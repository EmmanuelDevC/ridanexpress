import React, { useState, useEffect } from 'react'
import Headers from '../components/Headers'
import Footer from '../components/Footer'
import FlutterwavePayment from '../components/Flutterwave'
import flutterwavePic from '../assets/Images/banner/Flutterwave-pic.png'
import { useLocation, Navigate, Link } from 'react-router-dom'
import {
    MdOutlineKeyboardArrowRight,
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

    // 🧩 Destructure incoming data
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
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* <Headers /> */}

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
                    {/* Progress Header */}
                    <div className="mb-2 mt-6 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
                        <div className="flex items-center text-sm text-gray-600">
                            <Link to="/" className="text-orange-600 hover:text-orange-700 font-medium">Home</Link>
                            <MdOutlineKeyboardArrowRight className="mx-2" />
                            <Link to="/shipping" className="text-orange-600 hover:text-orange-700 font-medium">Shipping</Link>
                            <MdOutlineKeyboardArrowRight className="mx-2" />
                            <span className="text-gray-800 font-medium">Payment</span>
                        </div>
                    </div>

                    {/* Step Progress */}
                    <div className="mb-6 flex items-center justify-center">
                        <div className="flex items-center">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white shadow">
                                <MdCheckCircle />
                            </div>
                            <div className="ml-3 text-sm font-medium text-green-600">Shipping</div>
                        </div>

                        <div className="w-20 h-1 mx-4 bg-green-500 rounded-full"></div>

                        <div className="flex items-center">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-600 text-white shadow">
                                2
                            </div>
                            <div className="ml-3 text-sm font-medium text-orange-600">Payment</div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                        {/* Payment Section */}
                        <div className="lg:w-[60%]">
                            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MdPayment className="text-orange-600" />
                                    Payment Method
                                </h2>
                                <p className="text-sm text-gray-500 mb-4">
                                    Your payment will be securely processed through Flutterwave.
                                </p>

                                {/* Flutterwave Option */}
                                <div
                                    onClick={() => setPaymentMethod('flutterwave')}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${paymentMethod === 'flutterwave'
                                            ? 'border-orange-500 bg-orange-50'
                                            : 'border-gray-200 hover:border-orange-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={flutterwavePic}
                                            alt="Flutterwave"
                                            className="h-10 w-10 object-contain"
                                        />
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-base">Flutterwave</h3>
                                            <p className="text-xs text-gray-500">
                                                Credit/Debit Cards, Mobile Money, Bank Transfer
                                            </p>
                                        </div>
                                        {paymentMethod === 'flutterwave' && (
                                            <MdCheckCircle className="text-orange-600 ml-auto text-lg" />
                                        )}
                                    </div>
                                </div>

                                {/* Payment Component */}
                                {paymentMethod === 'flutterwave' && (
                                    <div className="animate-fade-in mt-6">
                                        <FlutterwavePayment orderId={orderId} price={totalAmount} />
                                    </div>
                                )}
                            </div>

                            {/* Security Info */}
                            <div className="bg-orange-50 rounded-xl p-4 text-sm text-gray-700 border border-orange-300">
                                <div className="flex items-start gap-3">
                                    <MdSecurity className="w-5 h-5 flex-shrink-0 text-orange-600" />
                                    <div>
                                        <p className="font-medium text-orange-800">Secure Transaction</p>
                                        <p className="text-orange-700">
                                            256-bit SSL encryption. We never store your payment details.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:w-[40%]">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-4">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MdCheckCircle className="text-green-500" />
                                    Order Summary
                                </h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-sm">Subtotal ({items} items)</span>
                                        <span className="text-gray-900 font-medium text-sm">
                                            ₦{price?.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-sm flex items-center gap-1">
                                            <MdLocalShipping className="text-orange-500" />
                                            Shipping
                                        </span>
                                        <span className="text-orange-600 font-medium text-sm">
                                            {shipping_fee > 0 ? `₦${shipping_fee?.toLocaleString()}` : 'Free'}
                                        </span>
                                    </div>
                                </div>

                                <div className="py-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-900 text-base">Total Amount</span>
                                        <span className="text-lg font-bold text-orange-600">
                                            ₦{totalAmount?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Details</h3>
                                    <div className="space-y-2 text-xs text-gray-600">
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

                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <div className="flex items-start gap-2 text-xs text-gray-500 mb-3">
                                        <MdInfoOutline className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                                        <span>Includes all applicable taxes and fees</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs text-gray-500">
                                        <MdCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                                        <span>Instant order confirmation upon payment</span>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-xs text-gray-600 text-center">
                                        Need help?{' '}
                                        <a href="/contact" className="text-orange-600 hover:text-orange-700 font-medium">
                                            Contact Support
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="hidden lg:block border-t border-gray-200 mt-8">
                <Footer />
            </div>
        </div>
    )
}

export default Payment
