import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Uploads an image to the server and optionally to Cloudinary
 * @param {Object} request - Express request object
 * @param {Object} response - Express response object
 */
const uploadImageController = async (request, response) => {
    console.log('=== Upload Image Request ===');
    console.log('Request body:', request.body);
    console.log('Request file:', request.file);
    
    try {
        // Check if file exists in the request
        if (!request.file) {
            console.error('No file found in request');
            return response.status(400).json({
                success: false,
                message: 'No file uploaded',
                error: true
            });
        }

        const { file } = request;
        console.log(`Processing file: ${file.originalname}, size: ${file.size} bytes, type: ${file.mimetype}`);

        // Try to upload to Cloudinary first
        try {
            console.log('Attempting to upload to Cloudinary...');
            const cloudinaryResult = await uploadImageCloudinary(file);
            
            console.log('Cloudinary upload successful:', cloudinaryResult);
            
            // Format the response based on Cloudinary's response
            return response.status(200).json({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    url: cloudinaryResult.secure_url || cloudinaryResult.url,
                    public_id: cloudinaryResult.public_id,
                    format: cloudinaryResult.format,
                    bytes: cloudinaryResult.bytes,
                    width: cloudinaryResult.width,
                    height: cloudinaryResult.height
                }
            });
            
        } catch (cloudinaryError) {
            console.error('Cloudinary upload failed, falling back to local storage:', cloudinaryError);
            
            // If Cloudinary fails, use local file path
            const localUrl = `/uploads/${file.filename}`;
            const fullUrl = `${request.protocol}://${request.get('host')}${localUrl}`;
            
            console.log(`Serving file from local storage: ${fullUrl}`);
            
            return response.status(200).json({
                success: true,
                message: 'File uploaded to local storage (Cloudinary unavailable)',
                data: {
                    url: fullUrl,
                    secure_url: fullUrl,
                    _isLocalFile: true
                }
            });
        }
        
    } catch (error) {
        console.error('Error in uploadImageController:', error);
        
        // Clean up the uploaded file if it exists
        if (request.file?.path) {
            try {
                await fs.unlink(request.file.path);
                console.log('Cleaned up temporary file:', request.file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }
        
        // Determine the appropriate status code and error message
        let statusCode = 500;
        let errorMessage = 'An error occurred while processing the file';
        
        if (error.message.includes('File too large')) {
            statusCode = 413;
            errorMessage = 'File is too large. Maximum size is 10MB.';
        } else if (error.message.includes('Invalid file type')) {
            statusCode = 400;
            errorMessage = 'Invalid file type. Only image files are allowed.';
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            statusCode = 400;
            errorMessage = 'Unexpected file field. Please use the field name "image".';
        }
        
        return response.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: true,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export default uploadImageController;
