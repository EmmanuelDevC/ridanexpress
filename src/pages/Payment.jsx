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
    MdLocalShipping,
    MdAttachMoney,
    MdSchedule
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

    // Calculate breakdown for COD
    const getPaymentBreakdown = () => {
        const subtotal = Number(price);
        const shipping = price_includes_shipping ? 0 : Number(shipping_fee);
        const codFee = Math.round(subtotal * 0.02); // 2% COD fee example
        const amountDue = subtotal + shipping + codFee;
        
        return {
            subtotal,
            shipping,
            codFee,
            amountDue
        };
    }

    const breakdown = getPaymentBreakdown();

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
                                    Choose your preferred payment method
                                </p>
                            </div>

                            <div className="p-4 space-y-4">
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
                                            <h3 className="font-medium text-gray-900 text-sm">Pay Now</h3>
                                            <p className="text-xs text-gray-500">
                                                Credit/Debit Cards, Mobile Money, Bank Transfer
                                            </p>
                                        </div>
                                        {paymentMethod === 'flutterwave' && (
                                            <MdCheckCircle className="text-indigo-600 ml-auto text-lg" />
                                        )}
                                    </div>
                                </div>

                                {/* COD Option */}
                                <div
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`p-4 rounded-lg cursor-pointer transition-colors border ${paymentMethod === 'cod'
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-green-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full">
                                            <MdAttachMoney className="text-green-600 w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-sm">Cash on Delivery (COD)</h3>
                                            <p className="text-xs text-gray-500">
                                                Pay when you receive your order
                                            </p>
                                        </div>
                                        {paymentMethod === 'cod' && (
                                            <MdCheckCircle className="text-green-600 ml-auto text-lg" />
                                        )}
                                    </div>
                                </div>

                                {/* Payment Components */}
                                {paymentMethod === 'flutterwave' && (
                                    <div className="mt-4">
                                        <FlutterwavePayment orderId={orderId} price={totalAmount} />
                                    </div>
                                )}

                                {paymentMethod === 'cod' && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-3 mb-4">
                                            <MdLocalShipping className="text-green-600 w-6 h-6" />
                                            <div>
                                                <h3 className="font-semibold text-green-800">Cash on Delivery Selected</h3>
                                                <p className="text-sm text-green-700">
                                                    You will pay when your order arrives
                                                </p>
                                            </div>
                                        </div>

                                        {/* COD Payment Breakdown */}
                                        <div className="bg-white rounded-lg border border-green-200 p-4">
                                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                <MdAttachMoney className="text-green-600" />
                                                Payment Breakdown
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Items Subtotal ({items} items)</span>
                                                    <span>₦{breakdown.subtotal?.toLocaleString()}</span>
                                                </div>
                                                {breakdown.shipping > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Shipping Fee</span>
                                                        <span>₦{breakdown.shipping?.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">COD Service Fee</span>
                                                    <span className="text-orange-600">₦{breakdown.codFee?.toLocaleString()}</span>
                                                </div>
                                                <div className="border-t pt-2 mt-2">
                                                    <div className="flex justify-between font-semibold text-base">
                                                        <span className="text-gray-900">Amount Due on Delivery</span>
                                                        <span className="text-green-600">₦{breakdown.amountDue?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* COD Instructions */}
                                        <div className="mt-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <MdSchedule className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">Delivery Process</p>
                                                    <p className="text-xs text-gray-600">
                                                        Our delivery agent will contact you before arrival. Please keep exact change ready.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <MdCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">Order Confirmation</p>
                                                    <p className="text-xs text-gray-600">
                                                        Your order will be confirmed immediately. Delivery timeframe: 2-5 business days.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* COD Action Button */}
                                        <div className="mt-6">
                                            <button
                                                onClick={() => {
                                                    // Handle COD order confirmation
                                                    alert('COD order confirmed! You will receive a confirmation email shortly.');
                                                }}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                                            >
                                                Confirm COD Order
                                            </button>
                                            <p className="text-xs text-center text-gray-500 mt-2">
                                                By confirming, you agree to pay the amount due when your order arrives
                                            </p>
                                        </div>
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

                        {/* COD Specific Info */}
                        {paymentMethod === 'cod' && (
                            <div className="bg-green-50 rounded-lg p-3 text-sm text-gray-700 border border-green-200 mt-4">
                                <div className="flex items-start gap-2">
                                    <MdInfoOutline className="w-4 h-4 flex-shrink-0 text-green-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-green-800">Cash on Delivery Terms</p>
                                        <ul className="text-green-700 text-xs list-disc list-inside mt-1 space-y-1">
                                            <li>Please inspect your items before making payment</li>
                                            <li>Exact change is preferred for smooth transaction</li>
                                            <li>Delivery may be delayed if payment is not ready</li>
                                            <li>COD available for orders up to ₦500,000</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                    {!price_includes_shipping && shipping_fee > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Shipping Fee</span>
                                            <span className="font-medium">₦{shipping_fee?.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {paymentMethod === 'cod' && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">COD Service Fee</span>
                                            <span className="font-medium text-orange-600">₦{breakdown.codFee?.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-2">
                                    <div className="flex justify-between items-center font-semibold">
                                        <span className="text-gray-900">
                                            {paymentMethod === 'cod' ? 'Amount Due on Delivery' : 'Total Amount'}
                                        </span>
                                        <span className={`text-lg ${paymentMethod === 'cod' ? 'text-green-600' : 'text-gray-800'}`}>
                                            ₦{paymentMethod === 'cod' ? breakdown.amountDue?.toLocaleString() : totalAmount?.toLocaleString()}
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
                                            <span>Payment Method:</span>
                                            <span className="font-medium capitalize">
                                                {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Payment Status:</span>
                                            <span className={`font-medium ${
                                                paymentMethod === 'cod' ? 'text-blue-600' : 'text-yellow-600'
                                            }`}>
                                                {paymentMethod === 'cod' ? 'Pending Delivery' : 'Pending'}
                                            </span>
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
                                        <span>
                                            {paymentMethod === 'cod' 
                                                ? 'Order confirmation within 30 minutes' 
                                                : 'Instant order confirmation upon payment'
                                            }
                                        </span>
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