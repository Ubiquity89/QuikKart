import React from 'react'
import banner from '../assets/banner.jpg'
import bannerMobile from '../assets/banner-mobile.jpg'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/validURLConvert'
import {Link, useNavigate} from 'react-router-dom'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'

const Home = () => {
  // Memoized selectors to prevent unnecessary re-renders
  const { loadingCategory, allCategory: categoryData, allSubCategory: subCategoryData } = useSelector(
    state => ({
      loadingCategory: state.product.loadingCategory,
      allCategory: state.product.allCategory,
      allSubCategory: state.product.allSubCategory
    }),
    // Custom equality function to prevent re-renders when unrelated state changes
    (prev, next) => 
      prev.loadingCategory === next.loadingCategory &&
      prev.allCategory === next.allCategory &&
      prev.allSubCategory === next.allSubCategory
  )
  
  const navigate = useNavigate()

  // Debug logging - only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Home render - categoryData:', categoryData)
    console.log('Home render - loadingCategory:', loadingCategory)
    console.log('Home render - categoryData length:', categoryData?.length || 0)
  }

  return (
    <section className='bg-white'>
      <div className='container mx-auto'>
          <div className='w-full h-full min-h-48 bg-blue-100 rounded my-2'>
              <img
                src={banner || ''}
                className='w-full h-full hidden lg:block'
                alt='banner' 
              />
              <img
                src={bannerMobile}
                className='w-full h-full lg:hidden'
                alt='banner' 
              />
          </div>
      </div>
      
      <div className='container mx-auto px-4 my-2 grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10  gap-2'>
          {
            loadingCategory ? (
              new Array(12).fill(null).map((c,index)=>{
                return(
                  <div key={index+"loadingcategory"} className='w-full h-full hover:shadow-lg transition-shadow cursor-pointer bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse'>
                    <div className='bg-blue-100 min-h-24 rounded'></div>
                    <div className='bg-blue-100 h-8 rounded'></div>
                  </div>
                )
              })
            ) : (
              [...categoryData].sort((a, b) => a.name.localeCompare(b.name)).map((cat,index)=>{
                return(
                  <Link 
                    key={cat._id+"displayCategory"} 
                    to={`/${valideURLConvert(cat.name)}-${cat._id}`}
                    className='w-full h-full hover:shadow-lg transition-shadow cursor-pointer'
                  >
                    <div>
                        <img 
                          src={cat.image}
                          className='w-full h-full object-scale-down'
                        />
                    </div>
                  </Link>
                )
              })
              
            )
          }
      </div>

{/* {/***display category product */}
      
       {
        [...(categoryData || [])].sort((a, b) => a.name.localeCompare(b.name)).map((c,index)=>{
          return(
            <CategoryWiseProductDisplay 
              key={c?._id+"CategorywiseProduct"} 
              id={c?._id} 
              name={c?.name}
            />
          )
        })
      }




   </section>
  )
}

export default Home