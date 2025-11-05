import React, { useState, useEffect } from 'react'
import Headers from '../components/Headers'
import Footer from '../components/Footer'
import FlutterwavePayment from '../components/Flutterwave'
import flutterwavePic from '../assets/Images/banner/Flutterwave-pic.png'
import { useLocation, Navigate, Link } from 'react-router-dom'
import {
    MdSecurity,
    MdCheckCircle,
    MdInfoOutline,
    MdPayment,
    MdLocalShipping
} from 'react-icons/md'

const Payment = () => {
    const { state } = useLocation()

    if (!state) {
        return <Navigate to="/checkout" replace />
    }

    const { price, items, orderId, shipping_fee = 0, price_includes_shipping = false } = state
    const [paymentMethod, setPaymentMethod] = useState('flutterwave')
    const [totalAmount, setTotalAmount] = useState(price)

    // ✅ Adjust total amount correctly
    useEffect(() => {
        // If shipping not already included in price, then add it
        if (!price_includes_shipping) {
            setTotalAmount(Number(price) + Number(shipping_fee))
        } else {
            setTotalAmount(Number(price))
        }
    }, [price, shipping_fee, price_includes_shipping])

    return (
        <div className="min-h-screen bg-white">
            {/* <Headers /> */}

            {/* Header */}
            <div className="border-b bg-white">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center text-indigo-600 font-medium">
                            Home
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
                        <div className="w-20"></div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mt-4">
                        <div className="flex items-center text-green-500">
                            <div className="w-7 h-7 rounded-full text-sm flex items-center justify-center border-2 bg-green-500 border-green-500 text-white">
                                <MdCheckCircle className="w-4 h-4" />
                            </div>
                            <span className="ml-2 text-xs font-medium">Shipping</span>
                        </div>
                        <div className="w-8 h-0.5 bg-green-500 mx-2"></div>
                        <div className="flex items-center text-green-500">
                            <div className="w-7 h-7 text-sm rounded-full flex items-center justify-center border-2 bg-green-500 border-green-500 text-white">
                                2
                            </div>
                            <span className="ml-2 text-xs font-medium">Payment</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Payment Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <MdPayment className="text-indigo-600 w-5 h-5" />
                                    Payment Method
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Your payment will be securely processed through Flutterwave.
                                </p>
                            </div>

                            <div className="p-4">
                                {/* Flutterwave Option */}
                                <div
                                    onClick={() => setPaymentMethod('flutterwave')}
                                    className={`p-4 rounded-lg cursor-pointer transition-colors border ${paymentMethod === 'flutterwave'
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-indigo-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={flutterwavePic}
                                            alt="Flutterwave"
                                            className="h-8 w-8 object-contain"
                                        />
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-sm">Flutterwave</h3>
                                            <p className="text-xs text-gray-500">
                                                Credit/Debit Cards, Mobile Money, Bank Transfer
                                            </p>
                                        </div>
                                        {paymentMethod === 'flutterwave' && (
                                            <MdCheckCircle className="text-indigo-600 ml-auto text-lg" />
                                        )}
                                    </div>
                                </div>

                                {/* Payment Component */}
                                {paymentMethod === 'flutterwave' && (
                                    <div className="mt-4">
                                        <FlutterwavePayment orderId={orderId} price={totalAmount} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Info */}
                        <div className="bg-indigo-50 rounded-lg p-3 text-sm text-gray-700 border border-indigo-200 mt-4">
                            <div className="flex items-start gap-2">
                                <MdSecurity className="w-4 h-4 flex-shrink-0 text-indigo-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-indigo-800">Secure Transaction</p>
                                    <p className="text-indigo-700 text-xs">
                                        256-bit SSL encryption. We never store your payment details.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-lg">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <MdCheckCircle className="text-green-500 w-4 h-4" />
                                    Order Summary
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Items ({items} items) + Fees</span>
                                        <span className="font-medium">₦{price?.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-2">
                                    <div className="flex justify-between items-center font-semibold">
                                        <span className="text-gray-900">Total Amount</span>
                                        <span className="text-gray-800 text-lg">
                                            ₦{totalAmount?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t pt-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Order Details</h3>
                                    <div className="space-y-1 text-xs text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Order ID:</span>
                                            <span className="font-medium text-gray-900">#{orderId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Items:</span>
                                            <span className="font-medium text-gray-900">{items}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Payment Status:</span>
                                            <span className="font-medium text-yellow-600">Pending</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-3">
                                    <div className="flex items-start gap-2 text-xs text-gray-500 mb-2">
                                        <MdInfoOutline className="w-3 h-3 mt-0.5 flex-shrink-0 text-indigo-500" />
                                        <span>Includes all applicable taxes and fees</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs text-gray-500">
                                        <MdCheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" />
                                        <span>Instant order confirmation upon payment</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded p-3 border border-gray-200">
                                    <p className="text-xs text-gray-600 text-center">
                                        Need help?{' '}
                                        <a href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                            Contact Support
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden lg:block border-t border-gray-200 mt-8">
                <Footer />
            </div>
        </div>
    )
}

export default Payment