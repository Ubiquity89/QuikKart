import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import CartMobileLink from './components/CartMobile';
import GlobalProvider from './provider/GlobalProvider';
import Axios from './utils/Axios';
import SummaryApi from './common/SummaryApi';
import fetchUserDetailsFn from './utils/fetchUserDetails';
import { setUserDetails } from './store/userSlice';
import { setAllCategory, setAllSubCategory, setLoadingCategory, setError } from './store/productSlice';
import { handleAddItemCart } from './store/cartProduct';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isAppInitialized, setIsAppInitialized] = useState(false);

  const fetchUser = async () => {
    try {
      const userData = await fetchUserDetailsFn();
      if (userData?.data) {
        dispatch(setUserDetails(userData.data));
        localStorage.setItem("user", JSON.stringify(userData.data));
        return userData.data;
      }
      return null;
    } catch (err) {
      console.error("Failed to fetch user:", err);
      if (err?.response?.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("accesstoken");
        localStorage.removeItem("refreshtoken");
        dispatch(setUserDetails({}));
      }
      return null;
    }
  };

  const fetchCategory = async () => {
    try {
      dispatch(setLoadingCategory(true));
      const response = await Axios({
        ...SummaryApi.getCategory,
        timeout: 10000
      });
      
      if (response.data.success) {
        dispatch(setAllCategory(response.data.data));
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      dispatch(setError(error.message || 'Failed to load categories'));
      throw error;
    } finally {
      dispatch(setLoadingCategory(false));
    }
  };

  const fetchSubCategory = async () => {
    try {
      dispatch(setLoadingCategory(true));
      const response = await Axios({
        ...SummaryApi.getSubCategory,
        timeout: 10000
      });
      
      if (response.data.success) {
        dispatch(setAllSubCategory(response.data.data));
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      dispatch(setError(error.message || 'Failed to load subcategories'));
      throw error;
    } finally {
      dispatch(setLoadingCategory(false));
    }
  };

  const fetchCartItem = async () => {
    try {
      const response = await Axios(SummaryApi.getCartItem);
      if (response.data.success) {
        dispatch(handleAddItemCart(response.data.data));
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check for existing user in localStorage
        const storedUser = localStorage.getItem('user');
        let savedUser = null;
        
        try {
          savedUser = storedUser && storedUser !== 'undefined' 
            ? JSON.parse(storedUser) 
            : null;
        } catch (err) {
          savedUser = null;
          localStorage.removeItem('user');
        }

        // Set user from localStorage if exists
        if (savedUser?._id) {
          dispatch(setUserDetails(savedUser));
        }

        // Fetch data in parallel where possible
        const [userData] = await Promise.all([
          fetchUser(),
          fetchCategory().catch(console.error),
          fetchSubCategory().catch(console.error)
        ]);

        // Fetch cart items if user is logged in
        if (userData?._id || savedUser?._id) {
          await fetchCartItem().catch(console.error);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        toast.error('Failed to load application data. Please refresh the page.');
      } finally {
        setIsAppInitialized(true);
      }
    };

    initializeApp();
  }, [dispatch]);

  // Show loading state while initializing
  if (!isAppInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <GlobalProvider>
      <Header />
      <main className='min-h-[78vh]'>
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-center" />
      {location.pathname !== '/checkout' && <CartMobileLink />}
    </GlobalProvider>
  )
}

export default App