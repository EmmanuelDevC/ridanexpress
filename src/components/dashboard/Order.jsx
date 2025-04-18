import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { get_order } from '../../store/reducers/orderReducer';
import {
    FiPackage,
    FiCopy,
    FiDollarSign,
    FiCheckCircle,
    FiTruck,
    FiHome,
    FiUser,
    FiMapPin,
    FiMail,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const Order = () => {
    const [isCopied, setIsCopied] = useState(false);
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const { myOrder } = useSelector(state => state.order);
    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(get_order(orderId));
    }, [orderId]);

    if (!myOrder || !myOrder._id) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(orderId);
            setIsCopied(true);
            toast.success('Order ID copied to clipboard!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy Order ID', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: true,
            });
            console.error('Failed to copy text: ', err);
        }
    };

    const statusStyles = {
        paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <FiCheckCircle className="w-4 h-4" /> },
        placed: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: <FiCheckCircle className="w-4 h-4" /> },
        pending: { bg: 'bg-orange-50', text: 'text-orange-700', icon: <FiCheckCircle className="w-4 h-4" /> },
        unpaid: { bg: 'bg-amber-50', text: 'text-amber-700' },
        cancelled: { bg: 'bg-red-200', text: 'text-amber-700' },
        delivered: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: <FiTruck className="w-4 h-4" /> }
    };

    // Safe date formatting
    const formatDate = (dateString) => {
        try {
            return dateString ? format(parseISO(dateString), 'MMM dd, yyyy - hh:mm a') : 'N/A';
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gray-50 lg:py-8 px-1 lg:px-8"
        >
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Order Header */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h1 className='mb-8 text-xl lg:text-2xl font-bold text-orange-500 uppercase'>Order Info</h1>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <div className="flex flex-col lg:flex-row gap-1">
                                <h1 className="lg:text-2xl mr-4 font-bold text-gray-900 flex items-center gap-1">
                                    <FiPackage className="text-indigo-600" />
                                    <span>Order ID</span>
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm text-gray-600">{orderId}</span>
                                    <button
                                        onClick={handleCopy}
                                        className="p-1 hover:bg-gray-100 rounded-md transition-colors group"
                                        aria-label="Copy order ID"
                                    >
                                        {isCopied ? (
                                            <FiCheckCircle className="text-emerald-500 animate-pulse" />
                                        ) : (
                                            <FiCopy className="text-gray-500 group-hover:text-indigo-600 transition-colors" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <ToastContainer />
                            <p className="text-gray-500 text-sm mt-1">
                                Placed on {formatDate(myOrder.date)}
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 space-y-2">
                            <div className='flex gap-3 items-center'>
                                <p className='text-sm lg:text-lg'>Payment Status:</p>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${statusStyles[myOrder.payment_status]?.bg} ${statusStyles[myOrder.payment_status]?.text}`}>
                                    {statusStyles[myOrder.payment_status]?.icon}
                                    <span className="ml-1.5 capitalize">{myOrder.payment_status}</span>
                                </div>
                            </div>

                            <div className='flex gap-3 items-center'>
                                <p className='text-sm lg:text-lg'>Delivery Status:</p>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${statusStyles[myOrder.delivery_status]?.bg} ${statusStyles[myOrder.delivery_status]?.text}`}>
                                    {statusStyles[myOrder.delivery_status]?.icon}
                                    <span className="ml-1.5 capitalize">{myOrder.delivery_status}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Details Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Shipping Information */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <FiHome className="text-indigo-600 w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Shipping Details</h2>
                                <p className="text-sm text-gray-500 mt-1">Delivery information for this order</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <FiUser className="text-gray-500 w-4 h-4" />
                                </span>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Recipient Name</p>
                                    <p className="text-gray-900 font-medium">{myOrder.shippingInfo?.name}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 transition-all hover:bg-gray-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <FiMapPin className="text-gray-500 w-4 h-4" />
                                    <p className="text-xs font-medium text-gray-500">Full Address</p>
                                </div>
                                <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm">
                                    <span className="text-gray-500 font-medium">Address:</span>
                                    <span className="text-gray-900">{myOrder.shippingInfo?.address}</span>

                                    <span className="text-gray-500 font-medium">Area:</span>
                                    <span className="text-gray-900">{myOrder.shippingInfo?.area}</span>

                                    <span className="text-gray-500 font-medium">City:</span>
                                    <span className="text-gray-900">{myOrder.shippingInfo?.city}</span>

                                    <span className="text-gray-500 font-medium">Province:</span>
                                    <span className="text-gray-900">{myOrder.shippingInfo?.province}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <FiMail className="text-gray-500 w-4 h-4" />
                                </span>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Contact Email</p>
                                    <p className="text-indigo-600 font-medium break-all">{userInfo.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className='text-green-500 font-base'>₦</span>
                            Payment Summary
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900 font-base">{myOrder.price && (
                                    <>
                                        ₦ {Number(myOrder.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    </>
                                )}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-emerald-600">Free</span>
                            </div>
                            <div className="flex justify-between border-t pt-3">
                                <span className="font-semibold text-gray-900">Total</span>
                                <span className="font-medium text-black ">{myOrder.price && (
                                    <>
                                        ₦ {Number(myOrder.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    </>
                                )}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products List */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                        Order Items ({myOrder.products?.length})
                    </h2>
                    <div className="space-y-3">
                        {myOrder.products?.map((p, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-start sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {/* Product Image */}
                                <img
                                    src={p.images[0]}
                                    alt={p.name}
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md border flex-shrink-0"
                                />

                                {/* Product Details */}
                                <div className="ml-2 sm:ml-4 flex-1 min-w-0">
                                    <Link className="text-sm sm:text-base font-medium text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
                                        {p.name}
                                    </Link>
                                    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 items-center">
                                        <span className="text-xs sm:text-sm text-gray-500">
                                            {p.brand}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-xs sm:text-sm text-gray-500">
                                            Qty: {p.quantity}
                                        </span>
                                    </div>
                                </div>

                                {/* Price Section */}
                                <div className="ml-2 sm:ml-4 text-right flex-shrink-0">
                                    <p className="text-base sm:text-lg font-semibold text-green-600">
                                        ₦ {(p.price - (p.price * p.discount) / 100).toLocaleString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Order;