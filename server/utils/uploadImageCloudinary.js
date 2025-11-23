import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from 'path';

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required Cloudinary environment variables:', missingVars.join(', '));
    return false;
  }
  
  return true;
};

// Configure Cloudinary with error handling
try {
  if (validateCloudinaryConfig()) {
    cloudinary.config({ 
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('Cloudinary configured successfully');
  } else {
    console.warn('Cloudinary not configured. Check your environment variables.');
  }
} catch (error) {
  console.error('Error configuring Cloudinary:', error);
}

const uploadImageCloudinary = async (image) => {
  try {
    console.log('uploadImageCloudinary - Starting upload');
    
    if (!image?.path) {
      throw new Error("Invalid file path from Multer");
    }

    // Get absolute path to the uploaded file
    const absolutePath = path.resolve(image.path);
    console.log(`Processing file at path: ${absolutePath}`);
    
    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found at path: ${absolutePath}`);
    }

    // Check if Cloudinary is configured
    if (!validateCloudinaryConfig()) {
      console.warn('Cloudinary not properly configured. Using local file path.');
      // Fallback: Return local file path if Cloudinary is not configured
      console.warn('Cloudinary not configured, using local file path');
      const fileName = path.basename(image.path);
      return {
        url: `/uploads/${fileName}`,
        secure_url: `/uploads/${fileName}`,
        public_id: null,
        format: path.extname(fileName).substring(1).toLowerCase(),
        resource_type: 'image',
        created_at: new Date().toISOString(),
        bytes: fs.statSync(absolutePath).size,
        width: 0,
        height: 0,
        _isLocalFile: true
      };
    }

    console.log('uploadImageCloudinary - Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(absolutePath, {
      resource_type: "auto",
      folder: "blinkit",
      use_filename: true,
      unique_filename: true,
      overwrite: false
    });

    console.log('Cloudinary upload successful:', {
      url: result.secure_url,
      format: result.format,
      bytes: result.bytes
    });

    // Clean up the temporary file
    try {
      await fs.unlink(absolutePath);
      console.log('Temporary file deleted:', absolutePath);
    } catch (cleanupError) {
      console.error('Error deleting temporary file:', cleanupError);
    }

    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    
    // If there's an error with Cloudinary but we have a local file, return that
    if (image?.path && fs.existsSync(image.path)) {
      console.warn('Falling back to local file storage due to Cloudinary error');
      return {
        url: `/uploads/${path.basename(image.path)}`,
        secure_url: `/uploads/${path.basename(image.path)}`,
        public_id: null,
        format: path.extname(image.path).substring(1),
        resource_type: 'image',
        created_at: new Date().toISOString(),
        bytes: fs.statSync(image.path).size,
        width: 0,
        height: 0,
        _isLocalFile: true
      };
    }
    
    throw error;
  }
};

export default uploadImageCloudinary;
