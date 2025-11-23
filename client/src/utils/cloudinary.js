const CLOUD_NAME = 'dimztk9ce';
const UPLOAD_PRESET = 'ml_default';

export const uploadImage = async (file) => {
    if (!file) {
        throw new Error('No file provided');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'blinkit'); // Optional: Organize uploads in a folder

    try {
        console.log('Starting image upload to Cloudinary...');
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
            {
                method: 'POST',
                body: formData,
                // Don't set Content-Type header, let the browser set it with the correct boundary
            }
        );

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Cloudinary upload failed:', data);
            throw new Error(data.error?.message || 'Failed to upload image');
        }

        console.log('Image uploaded successfully:', data.secure_url);
        return data;
    } catch (error) {
        console.error('Error in uploadImage:', {
            error,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};
