import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { get_orders } from '../../store/reducers/orderReducer'
import { AiOutlineShoppingCart, AiOutlineFileSearch } from 'react-icons/ai'
import { FiPackage, FiCheckCircle, FiXCircle, FiTruck, FiClock, FiBox } from 'react-icons/fi'
import { motion } from 'framer-motion'

const Orders = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userInfo } = useSelector(state => state.auth)
    const { myOrders } = useSelector(state => state.order)
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        dispatch(get_orders({ status: statusFilter, customerId: userInfo.id }))
    }, [statusFilter, dispatch, userInfo.id])

    const getStatusBadge = (status) => {
        const statusClasses = {
            paid: 'bg-emerald-100 text-emerald-700',
            unpaid: 'bg-amber-100 text-amber-700',
            failed: 'bg-red-100 text-red-700',
            refunded: 'bg-purple-100 text-purple-700',
            pending: 'bg-amber-100 text-amber-700',
            processing: 'bg-blue-100 text-blue-700',
            shipped: 'bg-indigo-100 text-indigo-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        }
        return `${statusClasses[status] || 'bg-gray-100 text-gray-700'} rounded-full`
    }

    const redirectToPayment = (order) => {
        if (order.payment_url) {
            window.location.href = order.payment_url
        } else {
            navigate(`/dashboard/order/details/${order._id}`)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm py-6 px-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FiPackage className="text-orange-500" />
                        Order History
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {myOrders.length} order{myOrders.length !== 1 && 's'} found
                    </p>
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-48 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm transition-all"
                >
                    <option value="all">All Orders</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] sm:min-w-0">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 sm:px-6 py-2 text-left text-xs sm:text-sm font-medium text-orange-500">Order Ref</th>
                            <th className="px-3 sm:px-6 py-2 text-right text-xs sm:text-sm font-medium text-orange-500">Amount</th>
                            <th className="px-3 sm:px-6 py-2 text-left text-xs sm:text-sm font-medium text-orange-500">Payment</th>
                            <th className="px-3 sm:px-6 py-2 text-left text-xs sm:text-sm font-medium text-orange-500">Fulfillment</th>
                            <th className="px-3 sm:px-6 py-2 text-right text-xs sm:text-sm font-medium text-orange-500">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {myOrders.map((order, index) => (
                            <motion.tr
                                key={order._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[120px] truncate">
                                    <div className="flex items-center gap-2">
                                        <FiPackage className="text-gray-400" />
                                        <span className="font-mono">#{order.flutterwave_ref}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-3 sm:px-6 py-2 text-xs sm:text-sm text-gray-500 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        ₦{Number(order.price).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </div>
                                </td>
                                <td className="px-3 sm:px-6 py-2">
                                    <span className={`${getStatusBadge(order.payment_status)} inline-flex items-center gap-1 px-2 py-0.5 text-xs`}>
                                        {order.payment_status === 'paid' && <FiCheckCircle className="w-4 h-4" />}
                                        {order.payment_status === 'unpaid' && <FiClock className="w-4 h-4" />}
                                        {order.payment_status === 'failed' && <FiXCircle className="w-4 h-4" />}
                                        {order.payment_status === 'refunded' && <FiBox className="w-4 h-4" />}
                                        {order.payment_status}
                                    </span>
                                </td>
                                <td className="px-3 sm:px-6 py-2">
                                    <span className={`${getStatusBadge(order.delivery_status)} inline-flex items-center gap-1 px-2 py-0.5 text-xs`}>
                                        {order.delivery_status === 'processing' && <FiClock className="w-4 h-4" />}
                                        {order.delivery_status === 'shipped' && <FiTruck className="w-4 h-4" />}
                                        {order.delivery_status === 'delivered' && <FiCheckCircle className="w-4 h-4" />}
                                        {order.delivery_status}
                                    </span>
                                </td>
                                <td className="px-3 sm:px-6 py-2 text-right space-x-1 sm:space-x-2">
                                    <Link
                                        to={`/dashboard/order/details/${order._id}`}
                                        className="inline-flex items-center pr-4 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                                    >
                                        <AiOutlineFileSearch className="hidden sm:inline mr-1" />
                                        <span>View</span>
                                    </Link>
                                    {order.payment_status !== 'paid' && order.payment_status !== 'refunded' && (
                                        <button
                                            onClick={() => redirectToPayment(order)}
                                            className="inline-flex items-center text-white hover:bg-green-600 bg-green-500 rounded-full px-3 py-1 text-xs sm:text-sm font-medium transition-colors"
                                        >
                                            <AiOutlineShoppingCart className="hidden sm:inline mr-1" />
                                            <span>Pay</span>
                                            <span className='pl-1 hidden sm:inline'>now</span>
                                        </button>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {/* Empty State */}
                {myOrders.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="mb-4 text-gray-400 mx-auto">
                            <FiPackage className="w-12 h-12 mx-auto" />
                        </div>
                        <h3 className="text-gray-900 font-medium">No orders found</h3>
                        <p className="text-gray-500 mt-1">
                            {statusFilter === 'all' ? 
                                "You haven't placed any orders yet" : 
                                "No orders match your current filters"
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Orders