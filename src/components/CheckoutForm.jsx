import React from 'react'
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3'
import { useDispatch, useSelector } from 'react-redux'
import { order_confirm } from '../redux/actions/orderAction'
import { app_url } from '../utils/config'

const CheckoutForm = ({ orderId, price, items }) => {
    const dispatch = useDispatch()
    const { loading, errorMessage } = useSelector(state => state.order)
    
    // Flutterwave configuration
    const config = {
        public_key: process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: Date.now().toString(),
        amount: price,
        currency: 'NGN', // Change to your preferred currency
        payment_options: 'card, mobilemoney, ussd',
        customer: {
            email: 'user@example.com', // You should get this from your auth state
            phone_number: '07012345678', // You should get this from user profile
            name: 'John Doe', // You should get this from user profile
        },
        customizations: {
            title: 'Your Store Name',
            description: `Payment for Order #${orderId}`,
            logo: 'https://your-logo-url.com/logo.png',
        },
    }

    const handleFlutterwavePayment = useFlutterwave(config)

    const handlePayment = async () => {
        handleFlutterwavePayment({
            callback: async (response) => {
                console.log('Flutterwave response:', response)
                
                if (response.status === 'successful') {
                    try {
                        // Confirm order with transaction ID
                        await dispatch(order_confirm({
                            orderId: orderId,
                            transaction_id: response.transaction_id || response.id
                        })).unwrap()
                        
                        // Redirect to success page
                        window.location.href = `${app_url}/order/success?orderId=${orderId}`
                    } catch (error) {
                        console.error('Order confirmation failed:', error)
                        // Handle order confirmation failure
                        window.location.href = `${app_url}/order/failed?orderId=${orderId}&error=${encodeURIComponent(error)}`
                    }
                } else {
                    // Payment failed
                    window.location.href = `${app_url}/order/failed?orderId=${orderId}&error=payment_failed`
                }
                closePaymentModal()
            },
            onClose: () => {
                // User closed the payment modal
                console.log('Payment modal closed')
            },
        })
    }

    return (
        <div className="checkout-form">
            <div className="payment-summary mb-6 p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="flex justify-between mb-2">
                    <span>Items ({items?.length || 0}):</span>
                    <span>${(price - (price * 0.1)).toFixed(2)}</span> {/* Assuming 10% tax for example */}
                </div>
                <div className="flex justify-between mb-2">
                    <span>Tax:</span>
                    <span>${(price * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2 font-semibold">
                    <span>Total:</span>
                    <span>${price.toFixed(2)}</span>
                </div>
            </div>

            <button 
                onClick={handlePayment}
                disabled={loading}
                className='w-full px-10 py-3 rounded-sm hover:shadow-orange-500/20 hover:shadow-lg bg-orange-500 text-white disabled:bg-orange-300 disabled:cursor-not-allowed'
            >
                <span id='button-text'>
                    {
                        loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </div>
                        ) : "Pay with Flutterwave"
                    }
                </span>
            </button>

            {errorMessage && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {errorMessage}
                </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
                <p>You will be redirected to Flutterwave to complete your payment securely.</p>
            </div>
        </div>
    )
}

export default CheckoutForm