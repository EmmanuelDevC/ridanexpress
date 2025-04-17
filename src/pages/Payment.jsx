import React, { useState } from 'react'
import Headers from '../components/Headers'
import Footer from '../components/Footer'
import FlutterwavePayment from '../components/Flutterwave'
import { useLocation } from 'react-router-dom'

const Payment = () => {
    const { state: { price, items, orderId } } = useLocation()
    const [paymentMethod, setPaymentMethod] = useState('flutterwave')

    return (
        <div className="min-h-screen flex flex-col">
            <Headers />

            <main className="flex-1 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Payment</h1>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Payment Methods Section */}
                            <div className="lg:w-2/3">
                                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h2>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div
                                            onClick={() => setPaymentMethod('flutterwave')}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all 
                                                ${paymentMethod === 'flutterwave'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src="/images/payment/flutterwave.png"
                                                    alt="Flutterwave"
                                                    className="h-8 object-contain"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Flutterwave</span>
                                            </div>
                                        </div>

                                        {/* Uncomment other payment methods as needed */}
                                        {/* <div 
                                            onClick={() => setPaymentMethod('bkash')}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all 
                                                ${paymentMethod === 'bkash' 
                                                    ? 'border-blue-500 bg-blue-50' 
                                                    : 'border-gray-200 hover:border-blue-300'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src="/images/payment/bkash.png" 
                                                    alt="bKash" 
                                                    className="h-8 object-contain"
                                                />
                                                <span className="text-sm font-medium text-gray-700">bKash</span>
                                            </div>
                                        </div> */}
                                    </div>

                                    {/* Payment Form Area */}
                                    <div className="pt-4 border-t border-gray-100">
                                        {paymentMethod === 'flutterwave' && (
                                            <FlutterwavePayment
                                                orderId={orderId}
                                                price={price}
                                            />
                                        )}

                                        {paymentMethod === 'bkash' && (
                                            <div className="space-y-4">
                                                <div className="form-group">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        bKash Number
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="01XXX-XXXXXX"
                                                    />
                                                </div>
                                                <button className="w-full bg-blue-600 text-white py-2.5 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium">
                                                    Pay ${price}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                                    <p className="flex items-start gap-2">
                                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        Your payment is secured with SSL encryption. We never store your payment details.
                                    </p>
                                </div>
                            </div>

                            {/* Order Summary Section */}
                            <div className="lg:w-1/3">
                                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">{items} items</span>
                                            <span className="text-gray-900">${price}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Shipping</span>
                                            <span className="text-green-600">Free</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-900">Total</span>
                                            <span className="text-xl font-bold text-blue-600">${price}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 text-sm text-gray-500">
                                        <p className="flex items-start gap-2">
                                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Includes applicable taxes. Prices may vary for international orders.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className='sm:hidden lg:block '>
                <Footer />
            </div>
        </div>
    )
}

export default Payment