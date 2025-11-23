import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";

const Axios = axios.create({
  baseURL: baseURL, // ✅ ensures API calls hit backend (http://localhost:8080)
  withCredentials: true
});

// ✅ Request Interceptor — adds access token
Axios.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accesstoken");
    console.log('🔍 INTERCEPTOR DEBUG:');
    console.log('  - URL:', config.url);
    console.log('  - Token exists:', !!accessToken);
    console.log('  - Setting Authorization:', accessToken ? `Bearer ${accessToken.substring(0, 20)}...` : 'null');
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('  - Final headers:', config.headers);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor — handles expired tokens
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if it's a refresh token request or already retried
    if (originalRequest.url === '/api/user/refresh-token' || originalRequest.retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      originalRequest.retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const newAccessToken = await refreshAccessToken(refreshToken);

          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return Axios(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, clear tokens and redirect to login
          localStorage.removeItem("accesstoken");
          localStorage.removeItem("refreshToken");
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await Axios({
      ...SummaryApi.refresh_token,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const accessToken = response.data.data.accessToken;
    localStorage.setItem("accesstoken", accessToken);
    return accessToken;
  } catch (error) {
    console.log("Refresh token failed:", error);
    // Clear tokens on refresh failure
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("refreshToken");
  }
};

export default Axios;
