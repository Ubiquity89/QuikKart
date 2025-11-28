import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
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

// Initialize Stripe with your publishable key
// In App.jsx, update the stripePromise initialization:
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const publicPaths = ['/login', '/register', '/forgot-password', '/verification-otp', '/reset-password'];
  const isPublicPath = publicPaths.includes(location.pathname);

  const fetchUser = async () => {
    try {
      // Check if we have a token in localStorage
      const token = localStorage.getItem("accesstoken");
      if (!token) {
        // No token means user is not logged in
        dispatch(setUserDetails({}));
        return null;
      }

      // Try to fetch user details
      const userData = await fetchUserDetailsFn();
      if (userData?.data) {
        // If we got user data, update the Redux store
        dispatch(setUserDetails(userData.data));
        return userData.data;
      } else {
        // If no user data but we had a token, clear the invalid token
        localStorage.removeItem("accesstoken");
        localStorage.removeItem("refreshtoken");
        dispatch(setUserDetails({}));
        return null;
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      // On any error, clear auth data
      localStorage.removeItem("accesstoken");
      localStorage.removeItem("refreshtoken");
      dispatch(setUserDetails({}));
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
        timeout: 10000,
        validateStatus: (status) => status === 200 || status === 404
      });
      
      if (response.status === 200 && response.data?.success) {
        dispatch(setAllSubCategory(response.data.data || []));
        return response.data;
      } else if (response.status === 404) {
        console.warn('Subcategories endpoint not found, continuing without subcategories');
        dispatch(setAllSubCategory([]));
        return { success: true, data: [] };
      }
      
      throw new Error(response.data?.message || 'Failed to load subcategories');
    } catch (error) {
      console.error('Error in fetchSubCategory:', error);
      if (error.response?.status !== 404) {
        dispatch(setError(error.message || 'Failed to load subcategories'));
      }
      dispatch(setAllSubCategory([]));
      return { success: false, error: error.message };
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
    let isMounted = true;
    
    const initializeApp = async () => {
      try {
        // First, check if we have tokens
        const accessToken = localStorage.getItem('accesstoken');
        const refreshToken = localStorage.getItem('refreshtoken');
        const hasTokens = !!(accessToken && refreshToken);
        
        // If we have tokens, try to fetch user data
        if (hasTokens) {
          try {
            const userData = await fetchUser();
            if (userData?.data?._id) {
              // If we have a valid user, fetch cart items
              await fetchCartItem().catch(console.error);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            // Don't throw here, let the app continue loading
          }
        }
        
        // Always fetch categories and subcategories
        await Promise.all([
          fetchCategory().catch(console.error),
          fetchSubCategory().catch(console.error)
        ]);
        
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        if (isMounted) {
          setIsAppInitialized(true);
        }
      }
    };

    initializeApp();
    
    return () => {
      isMounted = false;
    };
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
     <Elements stripe={stripePromise}>
      <GlobalProvider>
        <Header />
        <main className='min-h-[78vh]'>
          <Outlet />
        </main>
        <Footer />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        {location.pathname !== '/checkout' && <CartMobileLink />}
      </GlobalProvider>
    </Elements>
  )
}

export default App