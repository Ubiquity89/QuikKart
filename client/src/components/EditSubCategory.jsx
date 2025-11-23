import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import uploadImage from '../utils/UploadImage';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

const EditSubCategory = ({close,data,fetchData}) => {
    const [subCategoryData,setSubCategoryData] = useState({
        _id : data._id,
        name : data.name,
        image : data.image,
        category : data.category?._id || ""
    })
    const allCategory = useSelector(state => state.product.allCategory)


    const handleChange = (e)=>{
        const { name, value} = e.target 

        setSubCategoryData((preve)=>{
            return{
                ...preve,
                [name] : value
            }
        })
    }

    const handleUploadSubCategoryImage = async (e) => {
        const file = e.target.files[0];

        if (!file) {
            toast.error('No file selected');
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload a JPEG, JPG, PNG, or WebP image.');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            toast.error('File is too large. Maximum size is 5MB.');
            return;
        }

        // Create a preview URL for the image
        const previewUrl = URL.createObjectURL(file);
        
        // Show a loading toast
        const toastId = toast.loading('Uploading image...');

        try {
            // Set a preview image immediately
            setSubCategoryData(prev => ({
                ...prev,
                image: previewUrl
            }));

            // Upload the image
            const response = await uploadImage(file);
            
            // If we get here, the upload was successful
            toast.success('Image uploaded successfully!', { id: toastId });
            
            // Update with the actual image URL from the server
            setSubCategoryData(prev => ({
                ...prev,
                image: response.data.url || response.data.secure_url || previewUrl
            }));
            
        } catch (error) {
            console.error('Error uploading image:', error);
            
            // Revert to the previous image or show an error state
            setSubCategoryData(prev => ({
                ...prev,
                image: data.image // Revert to the original image if available
            }));
            
            // The error will be shown by the uploadImage function
            toast.dismiss(toastId);
        } finally {
            // Revoke the object URL to free up memory
            URL.revokeObjectURL(previewUrl);
        }
    }

    const handleRemoveCategorySelected = ()=>{
        setSubCategoryData((preve)=>{
            return{
                ...preve,
                category : ""
            }
        })
    }

    const handleSubmitSubCategory = async(e)=>{
        e.preventDefault()

        try {
            const response = await Axios({
                ...SummaryApi.updateSubCategory,
                data : subCategoryData
            })

            const { data : responseData } = response

            console.log("responseData",responseData)
            if(responseData.success){
                toast.success(responseData.message)
                if(close){
                    close()
                }
                if(fetchData){
                    fetchData()
                }
            }

        } catch (error) {
            AxiosToastError(error)
        }
    }

  return (
    <section className='fixed top-0 right-0 bottom-0 left-0 bg-neutral-800 bg-opacity-70 z-50 flex items-center justify-center p-4'>
        <div className='w-full max-w-5xl bg-white p-4 rounded'>
            <div className='flex items-center justify-between gap-3'>
                <h1 className='font-semibold'>Edit Sub Category</h1>
                <button onClick={close}>
                    <IoClose size={25}/>
                </button>
            </div>
            <form className='my-3 grid gap-3' onSubmit={handleSubmitSubCategory}>
                    <div className='grid gap-1'>
                        <label htmlFor='name'>Name</label>
                        <input 
                            id='name'
                            name='name'
                            value={subCategoryData.name}
                            onChange={handleChange}
                            className='p-3 bg-blue-50 border outline-none focus-within:border-primary-200 rounded '
                        />
                    </div>
                    <div className='grid gap-1'>
                        <p>Image</p>
                        <div className='flex flex-col lg:flex-row items-center gap-3'>
                            <div className='border h-36 w-full lg:w-36 bg-blue-50 flex items-center justify-center'>
                                {
                                    !subCategoryData.image ? (
                                        <p className='text-sm text-neutral-400'>No Image</p>
                                    ) : (
                                        <img
                                            alt='subCategory'
                                            src={subCategoryData.image}
                                            className='w-full h-full object-scale-down'
                                        />
                                    )
                                }
                            </div>
                            <label htmlFor='uploadSubCategoryImage'>
                                <div className='px-4 py-1 border border-primary-100 text-primary-200 rounded hover:bg-primary-200 hover:text-neutral-900 cursor-pointer  '>
                                    Upload Image
                                </div>
                                <input 
                                    type='file'
                                    id='uploadSubCategoryImage'
                                    className='hidden'
                                    onChange={handleUploadSubCategoryImage}
                                />
                            </label>
                            
                        </div>
                    </div>
                    <div className='grid gap-1'>
                        <label>Select Category</label>
                        <div className='border focus-within:border-primary-200 rounded'>
                            {/*display value**/}
                            <div className='flex flex-wrap gap-2'>
                                {
                                    subCategoryData.category && (
                                        <div className='bg-white shadow-md px-2 py-1 m-1 flex items-center gap-2 rounded'>
                                            {allCategory.find(cat => cat._id === subCategoryData.category)?.name}
                                            <button 
                                                type="button" 
                                                className='cursor-pointer hover:text-red-600 focus:outline-none'
                                                onClick={handleRemoveCategorySelected}
                                                aria-label="Remove category"
                                            >
                                                <IoClose size={20} />
                                            </button>
                                        </div>
                                    )
                                }
                            </div>

                            {/*select category**/}
                            <select
                                className='w-full p-2 bg-transparent outline-none border'
                                value={subCategoryData.category}
                                onChange={(e)=>{
                                    const value = e.target.value
                                    setSubCategoryData((preve)=>{
                                        return{
                                            ...preve,
                                            category : value
                                        }
                                    })
                                }}
                            >
                                <option value={""}>Select Category</option>
                                {
                                    allCategory.map((category,index)=>{
                                        return(
                                            <option value={category?._id} key={category._id+"subcategory"}>{category?.name}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                    </div>

                    <button
                        className={`px-4 py-2 border
                            ${subCategoryData?.name && subCategoryData?.image && subCategoryData?.category ? "bg-primary-200 hover:bg-primary-100" : "bg-gray-200"}    
                            font-semibold
                        `}
                    >
                        Submit
                    </button>
                    
            </form>
        </div>
    </section>
  )
}

export default EditSubCategory
