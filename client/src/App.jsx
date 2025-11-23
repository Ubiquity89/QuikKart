import { Outlet} from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import toast,{ Toaster } from 'react-hot-toast';
import Axios from './utils/Axios';
import SummaryApi from './common/SummaryApi';
import { useEffect } from 'react';
import fetchUserDetailsFn from './utils/fetchUserDetails';
import { useDispatch } from 'react-redux';
import { setUserDetails } from './store/userSlice';
import { setAllCategory, setAllSubCategory, setLoadingCategory } from './store/productSlice';
import GlobalProvider from './provider/GlobalProvider';
import CartMobileLink from './components/CartMobile';
import { useLocation } from 'react-router-dom';

function App() {
  const dispatch = useDispatch()

  const fetchUser = async () => {
    try {
      const userData = await fetchUserDetailsFn();
      if (userData?.data) {
        dispatch(setUserDetails(userData.data));
        localStorage.setItem("user", JSON.stringify(userData.data));
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      // Don't clear existing user data on network errors, only on auth errors
      if (err?.response?.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("accesstoken");
        localStorage.removeItem("refreshtoken");
        dispatch(setUserDetails({}));
      }
    }
};

 const fetchCategory = async()=>{
        try{
            dispatch(setLoadingCategory(true));
            const response = await Axios({
                url : SummaryApi.getCategory.url,
                method : SummaryApi.getCategory.method,
                timeout: 10000 // 10 second timeout
            });
            
            console.log('Categories fetched:', response.data);
            
            if(response.data.success){
                dispatch(setAllCategory(response.data.data));
                console.log('Categories set in Redux:', response.data.data);
            }
        } catch(error) {
            console.error('Error fetching categories:', error);
            dispatch(setError(error.message || 'Failed to load categories'));
        } finally {
            dispatch(setLoadingCategory(false));
        }
    }

     const fetchSubCategory = async()=>{
        try {
            dispatch(setLoadingCategory(true));
            const response = await Axios({
                url : SummaryApi.getSubCategory.url,
                method : SummaryApi.getSubCategory.method,
                timeout: 10000 // 10 second timeout
            });
            
            console.log('SubCategories fetched:', response.data);
            
            if(response.data.success){
                dispatch(setAllSubCategory(response.data.data));
                console.log('SubCategories set in Redux:', response.data.data);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            dispatch(setError(error.message || 'Failed to load subcategories'));
        } finally {
            dispatch(setLoadingCategory(false));
        }
    }

    const fetchCartItem = async()=>{
        try{
           const response= await Axios({
            ...SummaryApi.getCartItem
           })
           const {data:responseData} =response

           if(responseData.success){
            dispatch(handleAddItemCart(responseData.data))
            console.log(responseData)
           }
            
        } catch (error) {
            console.error(error)
        }
    }


    useEffect(() => {
      console.log('App useEffect - initializing app...');
      
      // Initialize app data
      const initializeApp = async () => {
        console.log('initializeApp starting...');
        
        // Check localStorage for existing user first
        const storedUser = localStorage.getItem('user');
        let savedUser = null;
        
        try {
          savedUser = storedUser && storedUser !== 'undefined' 
            ? JSON.parse(storedUser) 
            : null;
          console.log('Saved user from localStorage:', savedUser);
        } catch (err) {
          savedUser = null;
          localStorage.removeItem('user');
        }

        if (savedUser?._id) {
          dispatch(setUserDetails(savedUser));
          console.log('User set from localStorage');
        }

        // Fetch data sequentially to avoid race conditions
        try {
          console.log('Starting data fetch...');
          
          // First fetch user data
          await fetchUser();
          
          // Then fetch categories and subcategories in parallel
          await Promise.all([
            fetchCategory(),
            fetchSubCategory()
          ]);
          
          // Finally fetch cart items if user is logged in
          if (savedUser?._id) {
            await fetchCartItem();
          }
          
          console.log('All data fetched successfully');
        } catch (error) {
          console.error('Error initializing app:', error);
          toast.error('Failed to load application data. Please refresh the page.');
        }
      };

      // Add a small delay to ensure the app is fully mounted
      const timer = setTimeout(() => {
        initializeApp();
      }, 100);
      
      // Cleanup function
      return () => clearTimeout(timer);
    }, [dispatch]);


  return (
    <GlobalProvider>
      <Header />
      <main className='min-h-[78vh]'>
        <Outlet />
      </main>
      <Footer />
      <Toaster/>
     {
        location.pathname !== '/checkout' && (
          <CartMobileLink/>
        )
      }
    </GlobalProvider>
  )
}

export default App