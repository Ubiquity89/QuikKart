import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { Link, useParams } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'
import CardProduct from '../components/CardProduct'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/validURLConvert'

const ProductListPage = () => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalPage, setTotalPage] = useState(1)
  const params = useParams()
  const AllSubCategory = useSelector(state => state.product.allSubCategory)
  const [DisplaySubCatory, setDisplaySubCategory] = useState([])
  const [selectedSubCategory, setSelectedSubCategory] = useState(null)

  console.log('AllSubCategory:', AllSubCategory)
  console.log('params:', params)
  console.log('categoryId:', params.category?.split("-")?.slice(-1)[0] || "")

  const subCategory = params?.subCategory?.split("-")
  const subCategoryName = subCategory?.slice(0, subCategory?.length - 1)?.join(" ")

  const categoryId = params.category?.split("-")?.slice(-1)[0] || ""
  const subCategoryId = params.subCategory?.split("-")?.slice(-1)[0] || ""

  useEffect(() => {
    console.log('Filtering subcategories for categoryId:', categoryId)
    console.log('AllSubCategory available:', AllSubCategory)
    
    const sub = AllSubCategory.filter(s => {
      console.log('Checking subcategory:', s.name, 'with category:', s.category)
      if (!s.category) {
        console.log('Skipping - no category')
        return false
      }
      
      // Handle category as object (not array)
      const filterData = s.category._id == categoryId
      console.log('Comparing s.category._id:', s.category._id, 'with categoryId:', categoryId, 'Result:', filterData)
      return filterData
    })
    
    console.log('Filtered subcategories:', sub)
    setDisplaySubCategory(sub)
    
    // Auto-select first subcategory if no subcategory is in URL
    if (!subCategoryId && sub.length > 0) {
      console.log('Auto-selecting first subcategory:', sub[0].name)
      setSelectedSubCategory(sub[0])
    } else if (subCategoryId) {
      // Find the subcategory that matches the URL
      const matched = sub.find(s => s._id === subCategoryId)
      console.log('Found matched subcategory:', matched)
      setSelectedSubCategory(matched || sub[0])
    }
  }, [params, AllSubCategory, subCategoryId])

  const fetchProductdata = async () => {
    try {
      setLoading(true)
      const effectiveSubCategoryId = subCategoryId || selectedSubCategory?._id || ""
      
      if (!effectiveSubCategoryId) {
        setLoading(false)
        return
      }
      
      const response = await Axios({
        ...SummaryApi.getProductByCategoryAndSubCategory,
        data: {
          categoryId: categoryId,
          subCategoryId: effectiveSubCategoryId,
          page: page,
          limit: 8,
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        if (responseData.page == 1) {
          setData(responseData.data)
        } else {
          setData([...data, ...responseData.data])
        }
        setTotalPage(responseData.totalCount)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductdata()
  }, [params, selectedSubCategory])

  return (
    <section className='sticky top-24 lg:top-20'>
      <div className='container sticky top-24  mx-auto grid grid-cols-[90px,1fr]  md:grid-cols-[200px,1fr] lg:grid-cols-[280px,1fr]'>
        {/**sub category **/}
        <div className=' min-h-[88vh] max-h-[88vh] overflow-y-scroll  grid gap-1 shadow-md scrollbarCustom bg-white py-2'>
          {
            DisplaySubCatory.map((s, index) => {
               const link = `/${valideURLConvert(s?.category?.name)}-${s?.category?._id}/${valideURLConvert(s.name)}-${s._id}`
               const isSelected = subCategoryId === s._id || selectedSubCategory?._id === s._id
              return (
                <Link key={s._id} to={link} className={`w-full p-2 lg:flex items-center lg:w-full lg:h-16 box-border lg:gap-4 border-b 
                  hover:bg-green-100 cursor-pointer
                  ${isSelected ? "bg-green-100" : ""}
                `}
                >
                  <div className='w-fit max-w-28 mx-auto lg:mx-0 bg-white rounded  box-border' >
                    <img
                      src={s.image}
                      alt='subCategory'
                      className=' w-14 lg:h-14 lg:w-12 h-full object-scale-down'
                    />
                  </div>
                  <p className='-mt-6 lg:mt-0 text-xs text-center lg:text-left lg:text-base'>{s.name}</p>
                </Link>
              )
            })
          }
        </div>


        {/**Product **/}
        <div className='sticky top-20'>
          <div className='bg-white shadow-md p-4 z-10'>
            <h3 className='font-semibold'>{selectedSubCategory?.name || subCategoryName || "Products"}</h3>
          </div>
          <div>

           <div className='min-h-[80vh] max-h-[80vh] overflow-y-auto relative'>
            <div className=' grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 p-4 gap-4 '>
                {
                  data.map((p, index) => {
                    return (
                      <CardProduct
                        data={p}
                        key={p._id + "productSubCategory" + index}
                      />
                    )
                  })
                }
              </div>
           </div>

            {
              loading && (
                <Loading />
              )
            }

          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductListPage