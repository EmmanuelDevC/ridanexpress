import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api_url } from '../utils/config';

const FlutterwavePayment = ({ price, orderId, customerEmail, customerName }) => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isMounted, setIsMounted] = useState(true);
    const [isLoading, setIsLoading] = useState(false); // New loading state

    useEffect(() => {
        return () => {
            setIsMounted(false);
        };
    }, []);

    const initializePayment = async () => {
        try {
            setError(null);
            setIsLoading(true); // Start loading

            const { data } = await axios.post(
                `${api_url}/api/order/create-payment`,
                { price, orderId },
                { withCredentials: true }
            );

            const script = document.createElement('script');
            script.src = 'https://checkout.flutterwave.com/v3.js';

            script.onload = () => {
                if (!isMounted) return;

                window.FlutterwaveCheckout({
                    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
                    tx_ref: data.tx_ref,
                    amount: price,
                    currency: 'NGN',
                    payment_options: 'card,ussd,mobilemoney',
                    customer: {
                        email: "emmanueldev584@gmail.com",
                        name: customerName,
                    },
                    callback: async (response) => {
                        try {
                            await axios.post(
                                `${api_url}/api/order/confirm/${orderId}`,
                                { transaction_id: response.transaction_id },
                                { withCredentials: true }
                            );
                            
                            if (isMounted) {
                                navigate(`/dashboard/my-orders/`, {
                                    state: { transaction_id: response.transaction_id }
                                });
                            }
                        } catch (verificationError) {
                            if (isMounted) setError('Payment verification failed');
                        }
                    },
                    onclose: async () => {
                        if (!isMounted) return;

                        try {
                            const { data } = await axios.post(
                                `${api_url}/api/order/confirm/${orderId}`,
                                {},
                                { withCredentials: true }
                            );

                            if (data.success && isMounted) {
                                navigate(`/dashboard/my-orders/`);
                            } else {
                                if (isMounted) setError('Payment was cancelled');
                            }
                        } catch (error) {
                            if (isMounted) setError('Payment status check failed');
                        }
                    }
                });

                if (isMounted) setIsLoading(false); // Stop loading after Flutterwave modal opens
            };

            script.onerror = () => {
                if (isMounted) {
                    setError('Failed to load payment processor');
                    setIsLoading(false); // Stop loading on error
                }
            };

            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        } catch (error) {
            if (isMounted) {
                setError(error.response?.data?.message || error.message || 'An error occurred');
                setIsLoading(false); // Stop loading on error
            }
        }
    };

    return (
        <div className='bg-white'>
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <button
                onClick={initializePayment}
                className='px-16 rounded-full py-3 hover:shadow-orange-500/20 hover:shadow-lg text-small bg-gray-500 active:bg-orange-500 text-white disabled:opacity-50'
                disabled={!price || !orderId || isLoading} // Disable during loading
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <svg
                            className="animate-spin h-5 w-5 mr-3 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Processing...
                    </div>
                ) : (
                    'Proceed to Payment'
                )}
            </button>
        </div>
    );
};

export default FlutterwavePayment;