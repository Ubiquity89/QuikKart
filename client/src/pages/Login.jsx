import React, { useState } from 'react';
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { setUserDetails } from '../store/userSlice';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const [data, setData] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const isValid = Object.values(data).every(el => el);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid || isLoading) return;

        setIsLoading(true);

        try {
            const response = await Axios({
                ...SummaryApi.login,
                data: data
            });
            
            if (response.data.error) {
                toast.error(response.data.message);
                return;
            }

            if (response.data.success) {
                toast.success(response.data.message);

                // Save tokens
                localStorage.setItem('accesstoken', response.data.data.accesstoken || '');
                localStorage.setItem('refreshtoken', response.data.data.refreshToken || '');
                
                // Save user data
                const user = response.data.data.user || {};
                localStorage.setItem('user', JSON.stringify(user));
                dispatch(setUserDetails(user));
                
                // Reset form
                setData({ email: "", password: "" });
                
                // Redirect to the originally requested page or home
                navigate(from, { replace: true });
            }

        } catch (error) {
            AxiosToastError(error);
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <section className='w-full container mx-auto px-2'>
            <div className='bg-white my-4 w-full max-w-lg mx-auto rounded-lg shadow-md p-7'>
                <h1 className='text-2xl font-bold text-center mb-6 text-gray-800'>Welcome Back</h1>
                
                <form className='grid gap-4' onSubmit={handleSubmit}>
                    <div className='grid gap-1'>
                        <label htmlFor='email' className='text-sm font-medium text-gray-700'>Email</label>
                        <input
                            type='email'
                            id='email'
                            className='bg-blue-50 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200'
                            name='email'
                            value={data.email}
                            onChange={handleChange}
                            placeholder='Enter your email'
                            autoComplete='username email'
                            disabled={isLoading}
                            required
                        />
                    </div>
                    
                    <div className='grid gap-1'>
                        <div className='flex justify-between items-center'>
                            <label htmlFor='password' className='text-sm font-medium text-gray-700'>Password</label>
                            <Link 
                                to="/forgot-password" 
                                className='text-sm text-green-600 hover:text-green-700 hover:underline'
                            >
                                Forgot password?
                            </Link>
                        </div>
                        
                        <div className='bg-blue-50 p-3 border rounded-lg flex items-center focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all duration-200'>
                            <input
                                type={showPassword ? "text" : "password"}
                                id='password'
                                className='w-full outline-none bg-transparent'
                                name='password'
                                value={data.password}
                                onChange={handleChange}
                                placeholder='Enter your password'
                                autoComplete='current-password'
                                disabled={isLoading}
                                required
                                minLength={6}
                            />
                            <button 
                                type='button' 
                                onClick={() => setShowPassword(prev => !prev)} 
                                className='text-gray-500 hover:text-gray-700 focus:outline-none'
                                disabled={isLoading}
                            >
                                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        type='submit' 
                        disabled={!isValid || isLoading}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ${
                            isValid && !isLoading 
                                ? 'bg-green-700 hover:bg-green-800' 
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? (
                            <div className='flex items-center justify-center space-x-2'>
                                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                <span>Signing in...</span>
                            </div>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className='mt-6 text-center text-sm text-gray-600'>
                    <p>Don't have an account?{' '}
                        <Link 
                            to="/register" 
                            className='font-semibold text-green-600 hover:text-green-700 hover:underline'
                        >
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Login