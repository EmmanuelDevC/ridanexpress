// Flutterwave.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api_url } from '../utils/config';

const FlutterwavePayment = ({ price, orderId }) => {
    const navigate = useNavigate();

    const initializePayment = async () => {
        try {
            // Generate tx_ref
            const { data } = await axios.post(
                `${api_url}/api/order/create-payment`,
                { price },
                { withCredentials: true }
            );


            // Load Flutterwave script
            const script = document.createElement('script');
            script.src = 'https://checkout.flutterwave.com/v3.js';
            script.onload = () => {
                window.FlutterwaveCheckout({
                    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
                    tx_ref: data.tx_ref,
                    amount: price, // Use converted amount
                    currency: 'NGN',
                    payment_options: 'card,ussd,mobilemoney',
                    customer: {
                        email: 'emmanueldev584@gmial.com', // Replace with actual email
                        name: 'Test Name',
                    },
                    meta: {
                        test_override: "NGN-1000000" // Bypass test limit
                    },
                    callback: (response) => {
                        navigate(`/order/confirm/${orderId}`, {
                            state: { transaction_id: response.transaction_id }
                        });
                    },
                    onclose: () => console.log('Payment closed'),
                });
            };
            document.body.appendChild(script);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='py-8 px-4 bg-white'>
            <button
                onClick={initializePayment}
                className='px-10 py-[6px] rounded-sm hover:shadow-orange-500/20 hover:shadow-lg bg-orange-500 text-white'
            >
                Pay with Flutterwave
            </button>
        </div>
    );
};

export default FlutterwavePayment;