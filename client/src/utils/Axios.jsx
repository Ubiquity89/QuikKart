import axios from "axios";
import { toast } from "react-hot-toast";
import SummaryApi, { baseURL } from "../common/SummaryApi";

const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Flag to prevent multiple token refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor — adds access token
Axios.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accesstoken");
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor — handles expired tokens and errors
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry if it's a refresh token request or already retried
    if (originalRequest.url.includes('/user/refresh-token') || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // If we're already refreshing the token, add the request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return Axios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshtoken");
      
      if (!refreshToken) {
        // No refresh token available, clear auth and redirect to login
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        const newAccessToken = await refreshAccessToken(refreshToken);
        
        if (newAccessToken) {
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Process any queued requests
          processQueue(null, newAccessToken);
          
          // Retry the original request
          return Axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, clear auth and redirect to login
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your internet connection.');
      return Promise.reject(error);
    }
    
    // Handle 429 Too Many Requests
    if (error.response.status === 429) {
      toast.error('Too many requests. Please try again later.');
      return Promise.reject(error);
    }
    
    // Handle 500 Internal Server Error
    if (error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
      return Promise.reject(error);
    }
    
    // For other errors, just reject with the error
    return Promise.reject(error);
  }
);

// Helper function to clear auth data and redirect to login
const clearAuthAndRedirect = () => {
  localStorage.removeItem("accesstoken");
  localStorage.removeItem("refreshtoken");
  localStorage.removeItem("user");
  
  // Only redirect if not already on login page
  if (!window.location.pathname.includes('/login')) {
    window.location.href = "/login";
  }
};

// Helper function to refresh the access token
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post(
      `${baseURL}/user/refresh-token`,
      { refreshToken },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    if (response.data.success) {
      const { accesstoken, refreshToken: newRefreshToken } = response.data.data;
      
      // Store the new tokens
      localStorage.setItem("accesstoken", accesstoken);
      
      // Update refresh token if a new one was provided
      if (newRefreshToken) {
        localStorage.setItem("refreshtoken", newRefreshToken);
      }
      
      return accesstoken;
    }
    
    throw new Error('Failed to refresh token');
  } catch (error) {
    console.error("❌ Token refresh failed:", error);
    clearAuthAndRedirect();
    throw error;
  }
};

export default Axios;
