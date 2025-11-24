import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const user = useSelector(state => state.user);
  const location = useLocation();
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/verification-otp', '/reset-password', '/category', '/search', '/product'];
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

  // If it's a public route, always render the children
  if (isPublicRoute) {
    return children;
  }

  // For protected routes, check authentication
  const accessToken = localStorage.getItem('accesstoken');
  const refreshToken = localStorage.getItem('refreshtoken');
  const isAuthenticated = !!(user?._id || (accessToken && refreshToken));

  if (!isAuthenticated) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;