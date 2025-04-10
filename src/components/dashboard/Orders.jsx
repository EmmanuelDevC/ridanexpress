import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { get_orders } from '../../store/reducers/orderReducer'
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { FiDollarSign, FiPackage, FiClock, FiCheckCircle, FiXCircle, FiTruck, FiEye, FiExternalLink } from 'react-icons/fi'
import { motion } from 'framer-motion'

const Orders = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userInfo } = useSelector(state => state.auth)
    const { myOrders } = useSelector(state => state.order)
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        dispatch(get_orders({ status: statusFilter, customerId: userInfo.id }))
    }, [statusFilter])

    const statusStyles = {
        paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <FiCheckCircle className="w-4 h-4" /> },
        pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <FiClock className="w-4 h-4" /> },
        unpaid: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <FiClock className="w-4 h-4" /> },
        placed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <FiPackage className="w-4 h-4" /> },
        cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: <FiXCircle className="w-4 h-4" /> },
        warehouse: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <FiTruck className="w-4 h-4" /> }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row md:mt-10 justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FiPackage className="text-indigo-600" />
                        Order History
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Showing {myOrders.length} orders
                    </p>
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-48 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm transition-all"
                >
                    <option value="all">All Orders</option>
                    <option value="placed">Placed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="warehouse">Warehouse</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[180px]">Order ID</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Payment</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Items</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
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
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    <div className="flex items-center gap-2">
                                        <FiPackage className="text-gray-400  max-w-[90px] truncate" />
                                        <span className="font-mono">#{order._id.slice(0, 8)}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    <div className="flex items-center gap-1">
                                        <span className='text-green-500'>₦</span>
                                        {order.price.toFixed(2)}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs 
                                        ${statusStyles[order.payment_status]?.bg} 
                                        ${statusStyles[order.payment_status]?.text}`}>
                                        {statusStyles[order.payment_status]?.icon}
                                        {order.payment_status}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs 
                                        ${statusStyles[order.delivery_status]?.bg} 
                                        ${statusStyles[order.delivery_status]?.text}`}>
                                        {statusStyles[order.delivery_status]?.icon}
                                        {order.delivery_status}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {order.products.reduce((acc, p) => acc + p.quantity, 0)}
                                </td>
                                <td className="px-3 sm:px-6 py-2 text-right space-x-1 sm:space-x-2">
                                    <Link
                                        to={`/dashboard/order/details/${order._id}`}
                                        className="inline-flex items-center pr-4 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                                    >
                                        <FiEye className="hidden sm:inline mr-1" />
                                        <span>View</span>
                                    </Link>
                                    {order.payment_status !== 'paid' && (
                                        <button
                                            onClick={() => redirect(order)}
                                            className="inline-flex items-center text-white hover:text-slate-800 bg-green-500 rounded-full px-3 text-xs sm:text-sm font-medium"
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
                        <p className="text-gray-500 mt-1">Try adjusting your filters</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Orders