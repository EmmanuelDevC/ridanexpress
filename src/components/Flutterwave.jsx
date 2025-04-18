// Flutterwave.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api_url } from '../utils/config';

const FlutterwavePayment = ({ price, orderId, customerEmail, customerName }) => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isMounted, setIsMounted] = useState(true);

    useEffect(() => {
        return () => {
            // Cleanup to prevent state updates on unmounted component
            setIsMounted(false);
        };
    }, []);

    const initializePayment = async () => {
        try {
            setError(null);
            
            // 1. Generate payment reference
            const { data } = await axios.post(
                `${api_url}/api/order/create-payment`, 
                { price, orderId },  // Include orderId in request
                { withCredentials: true }
            );

            // 2. Load Flutterwave script safely
            const script = document.createElement('script');
            script.src = 'https://checkout.flutterwave.com/v3.js';
            
            script.onload = () => {
                if (!isMounted) return;

                // 3. Initialize payment
                window.FlutterwaveCheckout({
                    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
                    tx_ref: data.tx_ref,
                    amount: parseFloat(price).toFixed(2), // Ensure valid number format
                    currency: 'NGN',
                    payment_options: 'card,ussd,mobilemoney',
                    customer: {
                        email: "emmanueldev584@gmail.com",  // Use prop instead of hardcoded value
                        name: customerName,     // Use prop instead of hardcoded value
                    },
                    callback: async (response) => {
                        try {
                            // 4. Verify payment with backend
                            await axios.post(
                                `${api_url}/api/order/verify-payment`,
                                { transactionId: response.transaction_id, orderId },
                                { withCredentials: true }
                            );

                            // 5. Navigate only if component is still mounted
                            if (isMounted) {
                                navigate(`/order/confirm/${orderId}`, {
                                    state: { transaction_id: response.transaction_id }
                                });
                            }
                        } catch (verificationError) {
                            setError('Payment verification failed');
                            console.error(verificationError);
                        }
                    },
                    onclose: () => {
                        if (isMounted) setError('Payment was cancelled');
                    },
                });
            };

            script.onerror = () => {
                if (isMounted) setError('Failed to load payment processor');
            };

            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        } catch (error) {
            if (isMounted) {
                setError(error.response?.data?.message || 'Payment initialization failed');
                console.error(error);
            }
        }
    };

    return (
        <div className='bg-white'>
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <button 
                onClick={initializePayment}
                className='px-7 rounded-lg py-3 hover:shadow-orange-500/20 hover:shadow-lg bg-orange-500 text-white disabled:opacity-50'
                disabled={!price || !orderId}
            >
                Proceed to Payment
            </button>
        </div>
    );
};

export default FlutterwavePayment;