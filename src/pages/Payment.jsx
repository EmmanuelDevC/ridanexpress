import React, { useState } from 'react'
import Headers from '../components/Headers'
import Footer from '../components/Footer'
import FlutterwavePayment from '../components/Flutterwave'
import flutterwavePic from '../assets/Images/banner/Flutterwave-pic.png'
import { useLocation, Navigate } from 'react-router-dom'

const Payment = () => {
    const { state } = useLocation()

    if (!state) {
        return <Navigate to="/checkout" replace />
    }

    const { price, items, orderId } = state
    const [paymentMethod, setPaymentMethod] = useState('flutterwave')

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Headers />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Secure Checkout
                            </h1>
                            {/* <p className="text-gray-600">Order ID: #{orderId}</p> */}
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Payment Section */}
                            <div className="lg:w-[60%]">
                                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-base text-gray-900 mb-4">
                                            Payment Method
                                        </h2>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Your payment will be securely processed through Flutterwave
                                        </p>
                                        
                                        <div
                                            onClick={() => setPaymentMethod('flutterwave')}
                                            className={`p-4 rounded-xl cursor-pointer transition-all border-2
                                                ${paymentMethod === 'flutterwave'
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-orange-300'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={flutterwavePic}
                                                    alt="Flutterwave"
                                                    className="h-10 w-10 object-contain"
                                                />
                                                <div>
                                                    <h3 className="font-medium text-gray-900">Flutterwave</h3>
                                                    <p className="text-sm text-gray-500">Credit/Debit Cards, Mobile Money</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {paymentMethod === 'flutterwave' && (
                                        <div className="animate-fade-in">
                                            <FlutterwavePayment
                                                orderId={orderId}
                                                price={price}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Security Info */}
                                <div className="bg-indigo-50 rounded-xl p-4 text-sm text-gray-700 border border-indigo-300">
                                    <div className="flex items-start gap-3">
                                        <svg 
                                            className="w-5 h-5 flex-shrink-0 text-indigo-600" 
                                            fill="currentColor" 
                                            viewBox="0 0 20 20"
                                        >
                                            <path 
                                                fillRule="evenodd" 
                                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
                                                clipRule="evenodd" 
                                            />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Secure Transaction</p>
                                            <p>256-bit SSL encryption. We never store your payment details.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:w-[40%]">
                                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8 border border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        Order Summary
                                    </h2>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">{items} items</span>
                                            <span className="text-gray-900 font-medium">₦ {price}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Shipping</span>
                                            <span className="text-indigo-600 font-medium">Free</span>
                                        </div>
                                    </div>

                                    <div className="py-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-900">Total</span>
                                            <span className="text-xl font-base text-gray-900">₦ {price}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 text-sm text-gray-500 space-y-2">
                                        <div className="flex items-start gap-2">
                                            <svg
                                                className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span>Includes applicable taxes</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <svg
                                                className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span>Instant payment processing</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="hidden lg:block border-t border-gray-200 mt-12">
                <Footer />
            </div>
        </div>
    )
}

export default Payment