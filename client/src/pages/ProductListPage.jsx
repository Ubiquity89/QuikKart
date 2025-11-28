import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { Link, useParams, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const AllSubCategory = useSelector(state => state.product.allSubCategory)
  const [DisplaySubCatory, setDisplaySubCategory] = useState([])
  const [selectedSubCategory, setSelectedSubCategory] = useState(null)

  console.log('AllSubCategory:', AllSubCategory)
  console.log('params:', params)
  
  // Extract category ID from the wildcard parameter or from category path
  let categoryId = '';
  let subCategoryId = '';
  
  if (params['*']) {
    // Handle wildcard pattern (e.g., /Category-Name-123...)
    const match = params['*'].match(/-([0-9a-f]{24})$/i);
    if (match) {
      categoryId = match[1];
    }
  } else if (params.category) {
    // Handle /category/:category format
    categoryId = params.category.split('-').pop() || '';
    
    if (params.subCategory) {
      subCategoryId = params.subCategory.split('-').pop() || '';
    }
  }
  
  console.log('Extracted categoryId:', categoryId);
  console.log('Extracted subCategoryId:', subCategoryId);
  
  const subCategory = params?.subCategory?.split("-")
  const subCategoryName = subCategory?.slice(0, subCategory?.length - 1)?.join(" ")

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!categoryId) return;
      
      try {
        console.log('Fetching subcategories for categoryId:', categoryId);
        setLoading(true);
        
        // First try to fetch subcategories directly
        try {
          const subCatResponse = await Axios({
            url: `${SummaryApi.baseUrl}/api/subCategory/get-by-category/${categoryId}`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (subCatResponse.data?.success) {
            const subCategories = subCatResponse.data.data || [];
            console.log('Fetched subcategories directly:', subCategories);
            setDisplaySubCategory(subCategories);
            
            if (subCategories.length > 0) {
              if (subCategoryId) {
                const matched = subCategories.find(s => s._id === subCategoryId);
                setSelectedSubCategory(matched || subCategories[0]);
              } else {
                setSelectedSubCategory(subCategories[0]);
              }
            }
            return;
          }
        } catch (subCatError) {
          console.log('Direct subcategory fetch failed, falling back to product-based extraction:', subCatError);
        }
        
        // Fallback: Fetch products and extract subcategories
        const response = await Axios({
          ...SummaryApi.getProductByCategory,
          data: {
            id: categoryId,
            page: 1,
            limit: 100
          }
        });
        
        console.log('API Response:', response.data);
        
        if (response.data.success) {
          const products = response.data.data || [];
          console.log('Fetched products:', products);
          
          // Extract unique subcategories from products
          const subCategoriesMap = new Map();
          products.forEach(product => {
            if (product.subCategory && product.subCategory._id) {
              subCategoriesMap.set(product.subCategory._id, {
                ...product.subCategory,
                // Ensure we have all required fields with fallbacks
                name: product.subCategory.name || 'Unnamed Subcategory',
                image: product.subCategory.image || 'https://via.placeholder.com/50',
                category: product.category || { _id: categoryId }
              });
            }
          });
          
          const subCategories = Array.from(subCategoriesMap.values());
          console.log('Extracted subcategories from products:', subCategories);
          
          setDisplaySubCategory(subCategories);
          
          if (subCategories.length > 0) {
            if (subCategoryId) {
              const matched = subCategories.find(s => s._id === subCategoryId);
              console.log('Matched subcategory from URL:', matched);
              setSelectedSubCategory(matched || subCategories[0]);
            } else {
              console.log('Selecting first subcategory:', subCategories[0]?.name);
              setSelectedSubCategory(subCategories[0]);
            }
          }
          
          // Set the products in state
          setData(products);
        }
      } catch (error) {
        console.error('Error in fetchSubCategories:', error);
        // Show error to user
        AxiosToastError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [categoryId, subCategoryId]);

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
      <div className={`container sticky top-24 mx-auto ${DisplaySubCatory.length > 0 ? 'grid-cols-[90px,1fr] md:grid-cols-[200px,1fr] lg:grid-cols-[280px,1fr]' : 'grid-cols-1'} grid`}>
        {/**sub category **/}
        {DisplaySubCatory.length > 0 && (
          <div className='min-h-[88vh] max-h-[88vh] overflow-y-scroll grid gap-1 shadow-md scrollbarCustom bg-white py-2'>
            {DisplaySubCatory.map((subCategory) => {
              const link = `/${valideURLConvert(subCategory?.category?.name || '')}-${subCategory?.category?._id}/${valideURLConvert(subCategory.name)}-${subCategory._id}`;
              const isSelected = selectedSubCategory?._id === subCategory._id || subCategoryId === subCategory._id;
              
              return (
                <Link
                  key={subCategory._id}
                  to={link}
                  className={`w-full p-2 lg:flex items-center lg:w-full lg:h-16 box-border lg:gap-4 border-b 
                    hover:bg-green-100 cursor-pointer
                    ${isSelected ? "bg-green-100" : ""}
                  `}
                >
                  <div className='w-fit max-w-28 mx-auto lg:mx-0 bg-white rounded box-border'>
                    <img
                      src={subCategory.image || 'https://via.placeholder.com/50'}
                      alt={subCategory.name}
                      className='w-14 lg:h-14 lg:w-12 h-full object-scale-down'
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/50';
                      }}
                    />
                  </div>
                  <p className='-mt-6 lg:mt-0 text-xs text-center lg:text-left lg:text-base'>
                    {subCategory.name}
                  </p>
                </Link>
              );
            })}
          </div>
        )}


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