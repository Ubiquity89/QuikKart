import React, { useState, useEffect } from 'react'
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

const EditProductAdmin = ({ data, fetchProductData, close }) => {
  const [editData, setEditData] = useState({
      name: data?.name || "",
      image: data?.image || [],
      category: data?.category || "",
      subCategory: data?.subCategory || "",
      unit: data?.unit || "",
      stock: data?.stock || "",
      price: data?.price || "",
      discount: data?.discount || "",
      description: data?.description || "",
      more_details: data?.more_details || {},
  })
  const [imageLoading, setImageLoading] = useState(false)
  const [ViewImageURL, setViewImageURL] = useState("")
  const allCategory = useSelector(state => state.product.allCategory)
  const [selectCategory, setSelectCategory] = useState(data?.category?._id || "")
  const [selectSubCategory, setSelectSubCategory] = useState(data?.subCategory?._id || "")
  const allSubCategory = useSelector(state => state.product.allSubCategory)
  const [openAddField, setOpenAddField] = useState(false)
  const [fieldName, setFieldName] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditData((preve) => {
      return {
        ...preve,
        [name]: value
      }
    })
  }

  const handleUploadImage = async(e) => {
    const file = e.target.files[0]
    if(!file){
      return
    }
    setImageLoading(true)
    const uploadProductImage = await uploadImage(file)
    setImageLoading(false)

    if(uploadProductImage.url){
      setEditData((preve)=>{
        return{
          ...preve,
          image : [...preve.image, uploadProductImage.url]
        }
      })
    }
  }

  const handleDeleteImage = (index)=>{
    const newImage = [...editData.image]
    newImage.splice(index,1)
    setEditData((preve)=>{
      return{
        ...preve,
        image : newImage
      }
    })
  }

  const handleSubmit = async(e) => {
    e.preventDefault()
    
    try {
      const response = await Axios({
        ...SummaryApi.updateProductDetails,
        data : {
          ...editData,
          _id: data._id
        }
      })

      const { data : responseData } = response

      if(responseData.success){
        successAlert(responseData.message)
        if(fetchProductData){
          fetchProductData()
        }
        close()
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  return (
    <section className='fixed top-0 left-0 right-0 bottom-0 bg-neutral-600 z-50 bg-opacity-70 p-4 flex justify-center items-center overflow-y-auto'>
      <div className='bg-white p-4 w-full max-w-4xl rounded-md max-h-[95vh] overflow-y-auto'>
        <div className='flex items-center justify-between gap-4'>
          <h2 className='font-semibold'>Edit Product</h2>
          <button onClick={close}>
            <IoClose size={25}/>
          </button>
        </div>
        
        <form className='grid gap-4' onSubmit={handleSubmit}>
          <div className='grid gap-1'>
            <label htmlFor='name' className='font-medium'>Name</label>
            <input 
              id='name'
              type='text'
              placeholder='Enter product name'
              name='name'
              value={editData.name}
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
              value={editData.description}
              onChange={handleChange}
              required
              multiple 
              rows={3}
              className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded resize-none'
            />
          </div>
          
          <div>
            <p className='font-medium'>Image</p>
            <div className='flex flex-wrap gap-3'>
              {
                editData.image.map((img,index)=>{
                  return(
                    <div key={img+index} className='relative group'>
                      <img
                        src={img}
                        alt={img}
                        className='bg-slate-100 border w-28 h-28 object-scale-down p-2 cursor-pointer'
                        onClick={()=>setViewImageURL(img)}
                      />
                      <div onClick={handleDeleteImage} className='absolute bottom-0 right-0 p-1 text-white bg-red-500 rounded hidden group-hover:block cursor-pointer'>
                        <MdDelete/>
                      </div>
                    </div>
                  )
                })
              }
              <label htmlFor='productImage' className='bg-blue-50 h-28 w-28 border rounded flex justify-center items-center cursor-pointer'>
                <div className='text-center flex justify-center items-center flex-col'>
                  {
                    imageLoading ? <Loading/> : (
                      <>
                        <FaCloudUploadAlt size={35}/>
                        <p className='text-xs'>Upload Image</p>
                      </>
                    )
                  }
                </div>
                <input 
                  type='file'
                  id='productImage'
                  className='hidden'
                  accept='image/*'
                  onChange={handleUploadImage}
                />
              </label>
            </div>
            {
              ViewImageURL && (
                <ViewImage url={ViewImageURL} close={()=>setViewImageURL("")}/>
              )
            }
          </div>

          <div className='grid gap-1'>
            <label htmlFor='category' className='font-medium'>Category</label>
            <select 
              id='category'
              value={selectCategory}
              onChange={(e)=> {
                const value = e.target.value
                setSelectCategory(value)
                setEditData((preve)=>{
                  return{
                    ...preve,
                    category : value,
                    subCategory : ""
                  }
                })
              }}
              className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
            >
              <option value="">Select Category</option>
              {
                allCategory.map((c,index)=>{
                  return(
                    <option value={c._id} key={c._id}>{c.name}</option>
                  )
                })
              }
            </select>
          </div>

          <div className='grid gap-1'>
            <label htmlFor='subCategory' className='font-medium'>Sub Category</label>
            <select 
              id='subCategory'
              value={selectSubCategory}
              onChange={(e)=> {
                const value = e.target.value
                setSelectSubCategory(value)
                setEditData((preve)=>{
                  return{
                    ...preve,
                    subCategory : value
                  }
                })
              }}
              required
              className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
            >
              <option value="">Select Sub Category</option>
              {
                allSubCategory.map((s,index)=>{
                  return(
                    s.category._id === selectCategory && (
                      <option value={s._id} key={s._id}>{s.name}</option>
                    )
                  )
                })
              }
            </select>
          </div>

          <div className='grid gap-1'>
            <label htmlFor='unit' className='font-medium'>Unit</label>
            <input 
              id='unit'
              type='text'
              placeholder='Enter product unit'
              name='unit'
              value={editData.unit}
              onChange={handleChange}
              required
              className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
            />
          </div>

          <div className='grid gap-1'>
            <label htmlFor='stock' className='font-medium'>Stock</label>
            <input 
              id='stock'
              type='number'
              placeholder='Enter product stock'
              name='stock'
              value={editData.stock}
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
              value={editData.price}
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
              value={editData.discount}
              onChange={handleChange}
              className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
            />
          </div>
          
          <div>
            <button 
              onClick={() => setOpenAddField(true)}
              className='py-1 px-3 bg-green-100 hover:bg-green-200 text-green-800 rounded font-medium'
            >
              Add Field
            </button>
          </div>

          {
            Object?.keys(editData?.more_details).map((element,index)=>{
              return(
                <div key={element+index} className='grid gap-1'>
                  <label htmlFor={element} className='font-medium'>{element}</label>
                  <input 
                    id={element}
                    type='text'
                    value={editData.more_details[element]}
                    onChange={(e)=>{
                      const value = e.target.value
                      setEditData((preve)=>{
                        return{
                          ...preve,
                          more_details : {
                            ...preve.more_details,
                            [element] : value
                          }
                        }
                      })
                    }}
                    className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                  />
                </div>
              )
            })
          }

          {
            openAddField && (
              <AddFieldComponent 
                close={()=>setOpenAddField(false)} 
                value={fieldName}
                onChange={(e)=>setFieldName(e.target.value)}
                submit={(e)=>{
                  e.preventDefault()
                  setEditData((preve)=>{
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
                }}
              />
            )
          }

          <button 
            type='submit'
            className='bg-primary-100 hover:bg-primary-200 py-2 rounded font-medium'
          >
            Update Product
          </button>
        </form>
      </div>
    </section>
  )
}

export default EditProductAdmin
