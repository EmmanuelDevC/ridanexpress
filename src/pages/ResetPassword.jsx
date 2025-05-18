import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import Loader from '../components/Loader';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [errorDetails, setErrorDetails] = useState({
        message: '',
        type: ''
    });
    const [passwordRequirements, setPasswordRequirements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await axios.post('/api/reset-password', {
                token: encodeURIComponent(token),
                newPassword
            });

            setErrorDetails({
                message: data.message,
                type: 'success'
            });

            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            const serverError = error.response?.data;
            if (serverError) {
                setErrorDetails({
                    message: serverError.error,
                    type: serverError.code
                });

                if (serverError.code === 'WEAK_PASSWORD') {
                    setPasswordRequirements(serverError.requirements);
                }

                if (serverError.code === 'INVALID_TOKEN') {
                    setTimeout(() => navigate('/forgot-password'), 3000);
                }
            } else {
                setErrorDetails({
                    message: 'Password reset failed. Please try again.',
                    type: 'generic'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 items-center">
            <div className="max-w-md mx-auto h-[100vh] bg-white shadow-2xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-orange-600 p-6">
                    <h2 className="mt-4 text-center text-2xl font-bold text-white">
                        Create New Password
                    </h2>
                </div>

                {/* Form Section */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Status Messages */}
                        {errorDetails.message && (
                            <div className={`p-4 rounded-lg ${errorDetails.type === 'success'
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                {errorDetails.type === 'success' ? '✅' : '⚠️'} {errorDetails.message}
                                {errorDetails.type === 'WEAK_PASSWORD' && (
                                    <ul className="mt-3 space-y-1">
                                        {passwordRequirements.map((req, index) => (
                                            <li key={index} className="flex items-center text-sm">
                                                <span className="mr-2">🔸</span>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                <FiLock className="inline mr-2 -mt-1" />
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                placeholder="Enter your new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Must contain at least:
                                <span className="block">• 8 characters</span>
                                <span className="block">• 1 uppercase letter</span>
                                <span className="block">• 1 number</span>
                                <span className="block">• 1 special character</span>
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <Loader className="h-5 w-5" />
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    {/* Navigation Links */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-orange-600 hover:text-orange-800 font-medium inline-flex items-center"
                        >
                            <FiArrowLeft className="mr-2" />
                            Back to Previous Page
                        </button>
                    </div>
                </div>

                {/* Additional Help */}
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        Still having trouble? Contact our{' '}
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

export default ResetPassword;