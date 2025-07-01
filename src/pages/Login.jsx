import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaGoogle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';
import { IoArrowBack } from 'react-icons/io5';
import { useSelector, useDispatch } from 'react-redux';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { customer_login, messageClear } from '../store/reducers/authReducer';
import ridanLogo from '../assets/Images/banner/logo2.png';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';

const Login = () => {
    const { loader, successMessage, errorMessage, userInfo } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [state, setState] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showResendButton, setShowResendButton] = useState(false);

    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        });
    };

    const login = (e) => {
        e.preventDefault();
        dispatch(customer_login(state));
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/google-auth`, {
                token: credentialResponse.credential
            });

            if (response.data.success) {
                toast.success('Logged in with Google');
                navigate('/');
            }
        } catch (error) {
            console.error('Google Login Error:', error);
            toast.error(error.response?.data?.error || 'Google login failed');
        }
    };

    const handleGoogleError = () => {
        toast.error('Google login failed');
    };

    const handleResendVerification = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/resend-verification`, {
                email: state.email
            });
            toast.success('Verification email resent! Check your inbox.');
            setShowResendButton(false);
        } catch (error) {
            console.error('Resend Error:', {
                error: error.message,
                response: error.response?.data,
                email: state.email
            });
            toast.error(error.response?.data?.error || 'Failed to resend email');
        }
    };

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            if (errorMessage.includes('not verified')) {
                setShowResendButton(true);
            }
            toast.error(errorMessage);
            dispatch(messageClear());
        }
        if (userInfo) {
            navigate('/');
        }
    }, [successMessage, errorMessage, userInfo]);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <div className='fixed top-0 left-0 right-0 py-4 px-10 flex items-center justify-between'>
                <Link to="/" className="text-gray-700">
                    <IoArrowBack className="text-xl" />
                </Link>
                <img src={ridanLogo} className='h-8 w-fit' alt="logo" />
            </div>

            {loader && (
                <div className='fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center'>
                    <PulseLoader color="orange" size={15} />
                </div>
            )}

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center">
                        <div className="w-full max-w-4xl rounded-xl overflow-hidden flex flex-col lg:flex-row ">
                            {/* Left Column - Form */}
                            <div className="w-full lg:w-1/2 p-8 sm:p-10">
                                <div className="text-center mb-8">
                                    <h1 className="text-xl font-bold text-gray-700">
                                        Login to ridan
                                    </h1>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Access your account to track orders, save items, and more.
                                    </p>
                                </div>

                                <form onSubmit={login} className="space-y-5">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            onChange={inputHandle}
                                            value={state.email}
                                            className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition duration-200"
                                            placeholder="your@email.com"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                Password
                                            </label>
                                            <Link to="/forgot-password" className="text-xs text-orange-600 hover:underline">
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="current-password"
                                                required
                                                onChange={inputHandle}
                                                value={state.password}
                                                className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition duration-200 pr-12"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                            Remember this device
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-full shadow-sm transition duration-200 flex items-center justify-center"
                                    >
                                        Sign In
                                    </button>

                                    {showResendButton && (
                                        <div className="mt-4 text-center text-sm">
                                            <p className="text-gray-600 mb-2">
                                                You need to verify your email to continue.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={handleResendVerification}
                                                className="text-orange-600 hover:text-orange-700 font-medium underline"
                                            >
                                                Resend Verification Email
                                            </button>
                                        </div>
                                    )}
                                </form>

                                <div className="mt-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white text-gray-500">
                                                Or sign in with
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-center mx-auto gap-3">

                                        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={handleGoogleError}
                                                useOneTap
                                                auto_select
                                                theme="filled_black"
                                                shape="pill"
                                                size="large"
                                                text=" Sign in with Google"
                                            />
                                        </GoogleOAuthProvider>

                                    </div>
                                </div>

                                <div className="mt-8 text-center text-sm text-gray-600">
                                    <p>
                                        New to Ridan Express?{' '}
                                        <Link
                                            to="/register"
                                            className="font-medium text-orange-600 hover:text-orange-500 hover:underline"
                                        >
                                            Create an account
                                        </Link>
                                    </p>
                                </div>
                            </div>

                            {/* Right Column - Brand Visual */}
                            <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-orange-600 to-orange-800 p-12 flex flex-col justify-center">
                                <div className="text-white">
                                    <h2 className="text-2xl font-bold mb-4">Welcome Back to Ridan Express</h2>
                                    <p className="mb-8 text-orange-100">
                                        Login to enjoy seamless shopping, faster checkouts, and personalized recommendations.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-orange-500 rounded-full p-1 mr-3">
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-orange-50">Track your orders</p>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-orange-500 rounded-full p-1 mr-3">
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-orange-50">Save items to wishlist</p>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-orange-500 rounded-full p-1 mr-3">
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-orange-50">Faster checkout</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;