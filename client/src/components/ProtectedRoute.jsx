import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const user = useSelector(state => state.user);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // If we have a user ID, we're authenticated
        if (user?._id) {
          setIsAuthenticated(true);
        } else {
          // Check if we have tokens in localStorage
          const accessToken = localStorage.getItem('accesstoken');
          const refreshToken = localStorage.getItem('refreshtoken');
          setIsAuthenticated(!!(accessToken && refreshToken));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user?._id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
