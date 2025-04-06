import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmailToken = async () => {
            try {
                const response = await axios.get(
                    `https://ridanexpress-backend.onrender.com/api/verify-email?token=${token}`
                );

                if (response.data.message) {
                    toast.success('Email verified successfully!');
                    // Redirect to login with success state
                    navigate('/login', { 
                        state: { 
                            verified: true,
                            message: 'Your email has been verified. Please log in.'
                        } 
                    });
                }
            } catch (err) {
                toast.error(err.response?.data?.error || 'Verification failed');
                navigate('/error', {
                    state: {
                        error: 'Invalid or expired verification link',
                        returnPath: '/register'
                    }
                });
            }
        };

        if (token) {
            verifyEmailToken();
        } else {
            navigate('/error', {
                state: {
                    error: 'Missing verification token',
                    returnPath: '/register'
                }
            });
        }
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Verifying your email address...</p>
            </div>
        </div>
    );
};

export default VerifyEmail;