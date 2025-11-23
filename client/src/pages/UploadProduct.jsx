import React, { useState } from 'react'
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from '../utils/UploadImage';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import { MdDelete } from "react-icons/md";
import { useSelector } from 'react-redux'
import { IoClose } from "react-icons/io5";
import AddFieldComponent from '../components/AddFieldComponent';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';
import { useEffect } from 'react';

const UploadProduct = () => {
  const [data,setData] = useState({
      name : "",
      image : [],
      category : "",
      subCategory : "",
      unit : "",
      stock : "",
      price : "",
      discount : "",
      description : "",
      more_details : {},
  })
  const [imageLoading,setImageLoading] = useState(false)
  const [ViewImageURL,setViewImageURL] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const allCategory = useSelector(state => state.product.allCategory)
  const [selectCategory,setSelectCategory] = useState("")
  const [selectSubCategory,setSelectSubCategory] = useState("")
  const allSubCategory = useSelector(state => state.product.allSubCategory)
  const [filteredSubCategories, setFilteredSubCategories] = useState([])

  const [openAddField,setOpenAddField] = useState(false)
  const [fieldName,setFieldName] = useState("")


  const handleChange = (e)=>{
    const { name, value} = e.target 

    setData((preve)=>{
      return{
          ...preve,
          [name]  : value
      }
    })
  }

  const handleUploadImage = async(file) => {
    if (!file) {
      return;
    }

    try {
      setImageLoading(true);
      console.log('Starting image upload...');
      
      const response = await uploadImage(file);
      console.log('Upload response:', response);
      
      // Handle different response structures to get the image URL
      let imageUrl = '';
      
      if (response?.data?.url) {
        imageUrl = response.data.url;
      } else if (response?.url) {
        imageUrl = response.url;
      } else if (response?.data?.data?.url) {
        imageUrl = response.data.data.url;
      } else if (response?.data?.secure_url) {
        imageUrl = response.data.secure_url;
      } else {
        console.warn('Unexpected response format:', response);
        throw new Error('Could not determine image URL from response');
      }

      console.log('Adding image URL to product:', imageUrl);
      
      setData(prevData => ({
        ...prevData,
        image: [...prevData.image, imageUrl]
      }));
      
      // Clear the file input to allow selecting the same file again if needed
      // e.target.value = null;
      
    } catch (error) {
      console.error('Error uploading image:', error);
      // toast.error(error.message || 'Failed to upload image');
    } finally {
      setImageLoading(false);
    }
  }

  const handleDeleteImage = async(index)=>{
      data.image.splice(index,1)
      setData((preve)=>{
        return{
            ...preve
        }
      })
  }

  const handleRemoveCategory = async(index)=>{
    data.category.splice(index,1)
    setData((preve)=>{
      return{
        ...preve
      }
    })
  }
  const handleRemoveSubCategory = async(index)=>{
      data.subCategory.splice(index,1)
      setData((preve)=>{
        return{
          ...preve
        }
      })
  }

  const handleAddField = ()=>{
    setData((preve)=>{
      return{
          ...preve,
          more_details : {
            ...preve.more_details,
            [fieldName] : ""
          }
      }
    })
    setFieldName("")
    setOpenAddField(false)
  }

  const handleSubmit = async(e)=>{
    e.preventDefault()
    console.log("data",data)

    try {
      const response = await Axios({
          ...SummaryApi.createProduct,
          data : data
      })
      const { data : responseData} = response

      if(responseData.success){
          successAlert(responseData.message)
          setData({
            name : "",
            image : [],
            category : "",
            subCategory : "",
            unit : "",
            stock : "",
            price : "",
            discount : "",
            description : "",
            more_details : {},
          })

      }
    } catch (error) {
        AxiosToastError(error)
    }


  }

  // useEffect(()=>{
  //   successAlert("Upload successfully")
  // },[])
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUploadImage(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUploadImage(file);
    }
  };

  return (
    <section className=''>
        <div className='p-2   bg-white shadow-md flex items-center justify-between'>
            <h2 className='font-semibold'>Upload Product</h2>
        </div>
        <div className='grid p-3'>
            <form className='grid gap-4' onSubmit={handleSubmit}>
                <div className='grid gap-1'>
                  <label htmlFor='name' className='font-medium'>Name</label>
                  <input 
                    id='name'
                    type='text'
                    placeholder='Enter product name'
                    name='name'
                    value={data.name}
                    onChange={handleChange}
                    required
                    className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                  />
                </div>
                <div className='grid gap-1'>
                  <label htmlFor='description' className='font-medium'>Description</label>
                  <textarea 
                    id='description'
                    type='text'
                    placeholder='Enter product description'
                    name='description'
                    value={data.description}
                    onChange={handleChange}
                    required
                    multiple 
                    rows={3}
                    className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded resize-none'
                  />
                </div>
                <div>
                    <p className='font-medium mb-1'>Product Images</p>
                    <div>
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                      >
                        <div className='flex flex-col items-center justify-center space-y-2'>
                          {imageLoading ? (
                            <Loading />
                          ) : (
                            <>
                              <FaCloudUploadAlt size={40} className='text-gray-400' />
                              <div className='mt-2'>
                                <p className='text-sm text-gray-600'>
                                  <span className='font-medium text-blue-600'>Click to upload</span> or drag and drop
                                </p>
                                <p className='text-xs text-gray-500'>
                                  PNG, JPG, JPEG (max 5MB)
                                </p>
                              </div>
                              <label 
                                htmlFor='productImage' 
                                className='mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer'
                              >
                                Select Files
                              </label>
                              <input 
                                type='file'
                                id='productImage'
                                className='hidden'
                                accept='image/*'
                                onChange={handleFileInput}
                              />
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Display uploaded images */}
                      <div className='mt-4'>
                        <div className='flex flex-wrap gap-4'>
                          {data.image.map((img, index) => (
                            <div key={img+index} className='relative group h-24 w-24'>
                              <img
                                src={img}
                                alt={`Preview ${index + 1}`}
                                className='w-full h-full object-cover rounded border border-gray-200 hover:shadow-md transition-shadow'
                                onClick={() => setViewImageURL(img)}
                              />
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteImage(index);
                                }}
                                className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600'
                                aria-label='Remove image'
                              >
                                <MdDelete size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                        {data.image.length > 0 && (
                          <p className='mt-2 text-xs text-gray-500'>
                            {data.image.length} image{data.image.length !== 1 ? 's' : ''} selected
                          </p>
                        )}
                      </div>
                    </div>
                </div>
                <div className='grid gap-1'>
                  <label className='font-medium'>Category</label>
                  <div>
                    <select
                      className='bg-blue-50 border w-full p-2 rounded'
                      value={selectCategory}
                      onChange={(e)=>{
                        const value = e.target.value 
                        const category = allCategory.find(el => el._id === value )
                        
                        setData(prev => ({
                          ...prev,
                          category: category._id,
                          subCategory: "" // Reset subcategory when category changes
                        }))
                        setSelectCategory("")
                        // Filter subcategories based on selected category
                        const filtered = allSubCategory.filter(sub => sub.category?._id === category._id)
                        setFilteredSubCategories(filtered)
                      }}
                    >
                      <option value={""}>Select Category</option>
                      {
                        allCategory.map((c,index)=>{
                          return(
                            <option value={c?._id}>{c.name}</option>
                          )
                        })
                      }
                    </select>
                    <div className='flex flex-wrap gap-3'>
                      {
                        data.category && (
                          <div className='text-sm flex items-center gap-1 bg-blue-50 mt-2'>
                            <p>{allCategory.find(c => c._id === data.category)?.name}</p>
                            <div className='hover:text-red-500 cursor-pointer' onClick={()=>setData(prev => ({...prev, category: ""}))}>
                              <IoClose size={20}/>
                            </div>
                          </div>
                        )
                      }
                    </div>
                  </div>
                </div>
                <div className='grid gap-1'>
                  <label className='font-medium'>Sub Category</label>
                  <div>
                    <select
                      className='bg-blue-50 border w-full p-2 rounded'
                      value={selectSubCategory}
                      onChange={(e)=>{
                        const value = e.target.value 
                        const subCategory = allSubCategory.find(el => el._id === value )

                        setData((preve)=>{
                          return{
                            ...preve,
                            subCategory : subCategory._id
                          }
                        })
                        setSelectSubCategory("")
                      }}
                    >
                      <option value={""} className='text-neutral-600'>Select Sub Category</option>
                      {
                        (data.category ? filteredSubCategories : allSubCategory).map((c,index)=>{
                          return(
                            <option key={c?._id} value={c?._id}>{c.name}</option>
                          )
                        })
                      }
                    </select>
                    <div className='flex flex-wrap gap-3'>
                      {
                        data.subCategory && (
                          <div className='text-sm flex items-center gap-1 bg-blue-50 mt-2'>
                            <p>{allSubCategory.find(c => c._id === data.subCategory)?.name}</p>
                            <div className='hover:text-red-500 cursor-pointer' onClick={()=>setData(prev => ({...prev, subCategory: ""}))}>
                              <IoClose size={20}/>
                            </div>
                          </div>
                        )
                      }
                    </div>
                  </div>
                </div>

                <div className='grid gap-1'>
                  <label htmlFor='unit' className='font-medium'>Unit</label>
                  <input 
                    id='unit'
                    type='text'
                    placeholder='Enter product unit'
                    name='unit'
                    value={data.unit}
                    onChange={handleChange}
                    required
                    className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                  />
                </div>

                <div className='grid gap-1'>
                  <label htmlFor='stock' className='font-medium'>Number of Stock</label>
                  <input 
                    id='stock'
                    type='number'
                    placeholder='Enter product stock'
                    name='stock'
                    value={data.stock}
                    onChange={handleChange}
                    required
                    className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                  />
                </div>

                <div className='grid gap-1'>
                  <label htmlFor='price' className='font-medium'>Price</label>
                  <input 
                    id='price'
                    type='number'
                    placeholder='Enter product price'
                    name='price'
                    value={data.price}
                    onChange={handleChange}
                    required
                    className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                  />
                </div>

                <div className='grid gap-1'>
                  <label htmlFor='discount' className='font-medium'>Discount</label>
                  <input 
                    id='discount'
                    type='number'
                    placeholder='Enter product discount'
                    name='discount'
                    value={data.discount}
                    onChange={handleChange}
                    required
                    className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                  />
                </div>


                {/**add more field**/}
                  {
                    Object?.keys(data?.more_details)?.map((k,index)=>{
                        return(
                          <div className='grid gap-1'>
                            <label htmlFor={k} className='font-medium'>{k}</label>
                            <input 
                              id={k}
                              type='text'
                              value={data?.more_details[k]}
                              onChange={(e)=>{
                                  const value = e.target.value 
                                  setData((preve)=>{
                                    return{
                                        ...preve,
                                        more_details : {
                                          ...preve.more_details,
                                          [k] : value
                                        }
                                    }
                                  })
                              }}
                              required
                              className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                            />
                          </div>
                        )
                    })
                  }

                <div onClick={()=>setOpenAddField(true)} className=' hover:bg-primary-200 bg-white py-1 px-3 w-32 text-center font-semibold border border-primary-200 hover:text-neutral-900 cursor-pointer rounded'>
                  Add Fields
                </div>

                <button
                  className='bg-primary-100 hover:bg-primary-200 py-2 rounded font-semibold'
                >
                  Submit
                </button>
            </form>
        </div>

        {
          ViewImageURL && (
            <ViewImage url={ViewImageURL} close={()=>setViewImageURL("")}/>
          )
        }

        {
          openAddField && (
            <AddFieldComponent 
              value={fieldName}
              onChange={(e)=>setFieldName(e.target.value)}
              submit={handleAddField}
              close={()=>setOpenAddField(false)} 
            />
          )
        }
    </section>
  )
}

export default UploadProduct