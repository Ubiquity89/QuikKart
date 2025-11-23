import Axios from './Axios';
import { baseURL } from '../common/SummaryApi';
import toast from 'react-hot-toast';

// Allowed file types and max file size (5MB)
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Uploads an image file to the server
 * @param {File} file - The image file to upload
 * @returns {Promise<{data: {url: string}}>} - The uploaded image URL
 * @throws {Error} If upload fails
 */
const uploadImage = async (file) => {
    // Validate input
    if (!file) {
        throw new Error('No file provided for upload');
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const formData = new FormData();
    formData.append('image', file);

    console.log('Starting file upload:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
    });

    try {
        const response = await Axios({
            method: 'post',
            url: `${baseURL}/api/file/upload-image`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                console.log(`Upload progress: ${percentCompleted}%`);
            }
        });

        console.log('Upload response:', response.data);

        // Handle different response structures
        let imageUrl = '';
        
        if (response.data.url) {
            imageUrl = response.data.url;
        } else if (response.data.data?.url) {
            imageUrl = response.data.data.url;
        } else if (response.data.data?.secure_url) {
            imageUrl = response.data.data.secure_url;
        } else if (response.data.secure_url) {
            imageUrl = response.data.secure_url;
        } else {
            console.warn('Unexpected response format, trying to extract URL from response:', response.data);
            // Try to find URL in response data
            const findUrlInObject = (obj) => {
                for (const key in obj) {
                    if (typeof obj[key] === 'string' && 
                        (obj[key].startsWith('http') || obj[key].startsWith('/'))) {
                        return obj[key];
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        const found = findUrlInObject(obj[key]);
                        if (found) return found;
                    }
                }
                return '';
            };
            
            imageUrl = findUrlInObject(response.data);
            
            if (!imageUrl) {
                throw new Error('Could not determine image URL from response');
            }
        }

        // Ensure the URL is complete (add base URL if it's a relative path)
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:')) {
            if (imageUrl.startsWith('/')) {
                imageUrl = `${window.location.origin}${imageUrl}`;
            } else {
                imageUrl = `${window.location.origin}/${imageUrl}`;
            }
        }

        return {
            data: {
                url: imageUrl
            }
        };
    } catch (error) {
        console.error('Error in uploadImage:', error);
        
        let errorMessage = 'Failed to upload image';
        
        // Handle network errors first
        if (error.code === 'ERR_NETWORK') {
            errorMessage = 'Cannot connect to the server. Please check your internet connection and make sure the backend server is running.';
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timed out. The server is taking too long to respond.';
        } 
        // Handle response errors
        else if (error.response) {
            const { status, data } = error.response;
            
            if (status === 413) {
                errorMessage = 'File is too large. Maximum size is 5MB.';
            } else if (status === 400) {
                errorMessage = data?.message || 'Invalid file type. Please upload a valid image (JPEG, PNG, JPG, WebP).';
            } else if (status === 401) {
                errorMessage = 'Please log in to upload images';
            } else if (status === 404) {
                errorMessage = 'Server endpoint not found. Please check the server URL.';
            } else if (status >= 500) {
                errorMessage = 'Server error. Please try again later or contact support.';
            } else {
                errorMessage = data?.message || `Upload failed with status ${status}`;
            }
        } 
        // Handle cases where request was made but no response was received
        else if (error.request) {
            errorMessage = 'No response from server. The server may be down or unreachable.';
        } 
        // Handle other errors
        else if (error.message) {
            errorMessage = `Upload error: ${error.message}`;
        }
        
        // Show error toast
        toast.error(errorMessage);
        
        // Re-throw the error with a more descriptive message
        throw new Error(`Image upload failed: ${errorMessage}`);
    }
};

export default uploadImage;