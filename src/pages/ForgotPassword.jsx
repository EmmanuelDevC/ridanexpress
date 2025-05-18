import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import Loader from '../components/Loader'; // Assume you have a Loader component

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/forgot-password`, { email });
            setMessage(data.message);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
            setMessage('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 items-center">
            <div className="max-w-md h-[100vh] mx-auto bg-white shadow-xl overflow-hidden">
                <div className="bg-orange-600 p-6">
                    <h2 className="mt-4 text-center text-2xl font-bold text-white">
                        Reset Password
                    </h2>
                </div>

                {/* Form Section */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                <FiMail className="inline mr-2 -mt-1" />
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Status Messages */}
                        {message && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                                ✅ {message}
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <Loader className="h-5 w-5" />
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>

                    {/* Navigation Links */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-orange-600 hover:text-orange-800 font-medium inline-flex items-center"
                        >
                            <FiArrowLeft className="mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>

                {/* Additional Help */}
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        Need help? Contact our{' '}
                        <Link to="/support" className="text-orange-600 hover:underline">
                            support team
                        </Link>
                    </p>
                </div>
                <div className=' fixed bottom-8 flex-1 w-[100%] text-center justify-center'>
                    <span className='flex flex-col items-center'>
                        <p className='text-green-600 bg-green-100 px-3 py-2 rounded-full border border-green-300'>secured by ridan team</p>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;