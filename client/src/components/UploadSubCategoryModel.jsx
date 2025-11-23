import React, { useState, useRef, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import uploadImage from '../utils/UploadImage';
import { useDispatch, useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { setAllCategory } from '../store/productSlice';

const UploadSubCategoryModel = ({ close, fetchData, data }) => {
    const [subCategoryData, setSubCategoryData] = useState({
        name: "",
        image: "",
        category: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    
    const dispatch = useDispatch();
    const allCategory = useSelector(state => state.product.allCategory || []);

    // Fetch categories when component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await Axios.get('/api/category/get');
                if (response.data?.success) {
                    dispatch(setAllCategory(response.data.data));
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Failed to load categories");
            } finally {
                setIsLoadingCategories(false);
            }
        };

        if (allCategory.length === 0) {
            fetchCategories();
        } else {
            setIsLoadingCategories(false);
        }
    }, [dispatch, allCategory.length]);

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!subCategoryData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!subCategoryData.image) {
            newErrors.image = 'Image is required';
        }
        
        if (!subCategoryData.category) {
            newErrors.category = 'Please select a category';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        setSubCategoryData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const fileInputRef = useRef(null);

    const handleUploadSubCategoryImage = async (e) => {
        const file = e?.target?.files?.[0] || e;

        if (!file) {
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload a valid image (JPEG, PNG, JPG, WebP)');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('File is too large. Maximum size is 5MB.');
            return;
        }

        setIsUploading(true);
        
        try {
            console.log('Starting file upload:', {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified
            });
            
            const response = await uploadImage(file);
            console.log('Upload successful. Response:', response);
            
            // Handle different response formats
            let imageUrl = '';
            
            if (response?.data?.url) {
                // Case 1: response.data.url exists
                imageUrl = response.data.url;
            } else if (response?.data?.data?.url) {
                // Case 2: response.data.data.url exists
                imageUrl = response.data.data.url;
            } else if (response?.url) {
                // Case 3: response.url exists (direct URL)
                imageUrl = response.url;
            } else if (response?.data?.source) {
                // Case 4: response.data.source exists (for some APIs)
                imageUrl = response.data.source;
            } else {
                console.error('Unexpected response format:', response);
                throw new Error('Failed to process the uploaded image: Invalid response format');
            }
            
            // Ensure the URL is absolute
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:')) {
                if (imageUrl.startsWith('/')) {
                    imageUrl = `${window.location.origin}${imageUrl}`;
                } else {
                    imageUrl = `${window.location.origin}/${imageUrl}`;
                }
            }
            
            setSubCategoryData(prev => ({
                ...prev,
                image: imageUrl
            }));
            
            // Clear any previous image errors
            if (errors.image) {
                setErrors(prev => ({
                    ...prev,
                    image: ''
                }));
            }
            
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            
            // Extract a user-friendly error message
            let errorMessage = 'Failed to upload image. Please try again.';
            
            // If the error comes from uploadImage, it will have a formatted message
            if (error.message && error.message.startsWith('Image upload failed:')) {
                errorMessage = error.message.replace('Image upload failed: ', '');
            } else if (error.response) {
                // Handle HTTP error responses
                const { status } = error.response;
                if (status === 401) {
                    errorMessage = 'Please log in to upload images';
                } else if (status === 413) {
                    errorMessage = 'File is too large. Maximum size is 5MB.';
                } else if (status >= 500) {
                    errorMessage = 'Server error. Please try again later.';
                }
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Cannot connect to the server. Please check your internet connection and make sure the backend server is running.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. The server is taking too long to respond.';
            }
            
            // Show the error message to the user
            toast.error(errorMessage);
            
            // Reset the file input to allow re-uploading the same file if it fails
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveCategorySelected = () => {
        setSubCategoryData(prev => ({
            ...prev,
            category: ""
        }));
    };

    const resetForm = () => {
        setSubCategoryData({
            name: "",
            image: "",
            category: ""
        });
        setErrors({});
    };

    const handleSubmitSubCategory = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsLoading(true);

        try {
            const response = await Axios({
                ...SummaryApi.createSubCategory,
                data: subCategoryData
            });

            const { data: responseData } = response;

            if (responseData.success) {
                toast.success(responseData.message || 'Subcategory created successfully');
                resetForm();
                
                if (fetchData) {
                    await fetchData();
                }
                
                if (close) {
                    close();
                }
            } else {
                throw new Error(responseData.message || 'Failed to create subcategory');
            }
        } catch (error) {
            console.error('Error creating subcategory:', error);
            toast.error('Failed to create subcategory');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle drag and drop events
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUploadSubCategoryImage(e.dataTransfer.files[0]);
        }
    };

    const handleClickUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <section className='fixed inset-0 bg-neutral-800 bg-opacity-70 z-50 flex items-center justify-center p-4'>
            <div className='w-full max-w-md bg-white p-6 rounded-lg shadow-lg'>
                <div className='flex items-center justify-between mb-6 pb-2 border-b'>
                    <h1 className='text-xl font-semibold text-gray-800'>Add New Subcategory</h1>
                    <button 
                        type="button"
                        onClick={close} 
                        className='text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50'
                        disabled={isLoading || isUploading}
                    >
                        <IoClose size={25} />
                    </button>
                </div>
                
                <form className='space-y-6' onSubmit={handleSubmitSubCategory}>
                    {/* Name Field */}
                    <div className='space-y-2'>
                        <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                            Name <span className='text-red-500'>*</span>
                        </label>
                        <input 
                            id='name'
                            name='name'
                            value={subCategoryData.name}
                            onChange={handleChange}
                            disabled={isLoading || isUploading}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder='Enter subcategory name'
                        />
                        {errors.name && (
                            <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
                        )}
                    </div>

                    {/* Image Upload */}
                    <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700'>
                            Image <span className='text-red-500'>*</span>
                        </label>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleUploadSubCategoryImage}
                            className="hidden"
                            disabled={isLoading || isUploading}
                        />
                        
                        <div 
                            onClick={handleClickUpload}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                                errors.image 
                                    ? 'border-red-500 bg-red-50' 
                                    : 'border-gray-300 hover:border-indigo-500'
                            } cursor-pointer transition-colors`}
                        >
                            <div className="space-y-1 text-center">
                                {subCategoryData.image ? (
                                    <div className="flex flex-col items-center">
                                        <img 
                                            src={subCategoryData.image} 
                                            alt="Preview" 
                                            className="h-24 w-24 object-cover rounded-md"
                                        />
                                        <span className="mt-2 text-sm text-indigo-600 hover:text-indigo-500">
                                            Change image
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth={2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <span className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                Upload a file
                                            </span>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        {errors.image && (
                            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                        )}
                        
                        {isUploading && (
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </div>
                        )}
                    </div>
                    
                    {/* Category Selection */}
                    <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700'>
                            Category <span className='text-red-500'>*</span>
                        </label>
                        <div className="relative">
                            <select
                                id="category"
                                name="category"
                                value={subCategoryData.category}
                                onChange={handleChange}
                                disabled={isLoading || isUploading}
                                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                                    errors.category ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Select a category</option>
                                {allCategory.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                        {errors.category && (
                            <p className='mt-1 text-sm text-red-600'>{errors.category}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={close}
                            disabled={isLoading || isUploading}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || isUploading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </>
                            ) : 'Add Subcategory'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default UploadSubCategoryModel;