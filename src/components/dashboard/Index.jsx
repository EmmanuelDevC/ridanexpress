"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import {
    FiShoppingCart,
    FiClock,
    FiX,
    FiTrendingUp,
    FiEye,
    FiCreditCard,
    FiHome,
    FiHeadphones,
    FiPackage,
    FiBarChart2, // Changed from FiBarChart3 to FiBarChart2
} from "react-icons/fi"
import { HiOutlineSparkles } from "react-icons/hi"
import { useSelector, useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { get_dashboard_index_data } from "../../store/reducers/dashboardReducer"

const Index = () => {
    const navigate = useNavigate()
    const { userInfo } = useSelector((state) => state.auth)
    const { totalOrder, pendingOrder, recentOrders, cancelledOrder } = useSelector((state) => state.dashboard)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(get_dashboard_index_data(userInfo.id))
    }, [dispatch, userInfo.id])

    const redirect = (ord) => {
        const items = ord.products.reduce((acc, product) => acc + product.quantity, 0)
        navigate("/payment", {
            state: {
                price: ord.price,
                items,
                orderId: ord._id,
            },
        })
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            paid: "bg-green-100 text-green-800 border border-green-200",
            pending: "bg-orange-100 text-orange-800 border border-orange-200",
            cancelled: "bg-red-100 text-red-800 border border-red-200",
            delivered: "bg-blue-100 text-blue-800 border border-blue-200",
        }
        return `px-3 py-1 rounded-full text-xs font-medium ${statusMap[status.toLowerCase()] || "bg-gray-100 text-gray-800 border border-gray-200"}`
    }

    const statsData = [
        {
            title: "Total Orders",
            value: totalOrder,
            icon: <FiShoppingCart />,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
            borderColor: "border-blue-200",
        },
        {
            title: "Pending Orders",
            value: pendingOrder,
            icon: <FiClock />,
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600",
            borderColor: "border-orange-200",
        },
        {
            title: "Cancelled Orders",
            value: cancelledOrder,
            icon: <FiX />,
            color: "from-red-500 to-red-600",
            bgColor: "bg-red-50",
            textColor: "text-red-600",
            borderColor: "border-red-200",
        },
        {
            title: "Delivered Orders",
            value: totalOrder - pendingOrder - cancelledOrder,
            icon: <FiTrendingUp />,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
            borderColor: "border-green-200",
        },
    ]

    const quickActions = [
        {
            title: "Shop",
            icon: <FiShoppingCart />,
            color: "text-orange-500 ",
            onClick: () => navigate("/"),
        },
        {
            title: "Support",
            icon: <FiHeadphones />,
            color: "text-blue-500 ",
            onClick: () => navigate("/dashboard/chat"),
        },
        {
            title: "Orders",
            icon: <FiPackage />,
            color: "text-purple-500",
            onClick: () => navigate("/dashboard/my-orders"),
        },
        {
            title: "Order History",
            icon: <FiBarChart2 />,
            color: "text-green-500 ",
            onClick: () => navigate("/dashboard/my-orders"),
        },
    ]

    return (
        <div className="space-y-2 lg:space-y-4">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-gray-900 mt-2 via-black to-gray-900 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden"
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full -translate-y-32 translate-x-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400 rounded-full translate-y-24 -translate-x-24"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <HiOutlineSparkles className="text-orange-400 text-xl" />
                                <h1 className="text-l lg:text-2xl font-bold">Hi,  {userInfo.name}!</h1>
                            </div>
                            <div className="flex items-center space-x-2">
                                <p className="text-gray-300 text-xs lg:text-sm">Track your every move on Ridan Express😁</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link to="/">
                                <button className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 px-4 py-2.5 rounded-full transition-all duration-300 font-medium">
                                    <FiHome className="text-lg" />
                                    <span className="text-sm">Back to Shop</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                {statsData.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white rounded-2xl p-4 lg:py-7 border-2 ${stat.borderColor} transition-all duration-300 group`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="text-gray-600 text-xs lg:text-sm font-medium">{stat.title}</p>
                                <p className="text-xl lg:text-3xl font-bold text-gray-900">{stat.value || 0}</p>
                            </div>
                            <div
                                className={`p-3 lg:p-4 ${stat.bgColor} rounded-2xl group-hover:scale-110 transition-transform duration-300`}
                            >
                                <span className={`text-lg lg:text-xl ${stat.textColor}`}>{stat.icon}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-3 lg:p-8 border border-gray-200 shadow-sm"
            >

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base lg:text-xl font-bold text-gray-900">Quick Actions</h3>
                    <div className="w-12 h-1 bg-orange-500 rounded-full"></div>
                </div>

                <div className="grid grid-cols-4 lg:grid-cols-4 gap-1">
                    {quickActions.map((action, index) => (
                        <motion.button
                            key={action.title}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={action.onClick}
                            className={`rounded-xl transition-all duration-300 group`}
                        >
                            <div className="flex flex-col items-center space-y-3">
                                <span className={`${action.color} text-xl lg:text-3xl group-hover:scale-110 transition-transform duration-300 `}>
                                    {action.icon}
                                </span>
                                <span className="text-xs lg:text-sm font-base text-center leading-tight">{action.title}</span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
                <div className="p-6 lg:p-8 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-sm lg:text-xl font-bold text-gray-900">Recent Orders</h2>
                        </div>
                        <Link
                            to="/dashboard/my-orders"
                            className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium transition-colors duration-300"
                        >
                            <span className="text-sm lg:text-base">View All</span>
                            <FiEye className="text-lg" />
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Orders
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {[...recentOrders]
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .slice(0, 5)
                                .map((order, index) => (
                                    <motion.tr
                                        key={order._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-semibold text-xs font-semibold text-gray-900">#{order._id.slice(-8)}</span>
                                                    {Date.now() - new Date(order.createdAt) < 86400000 && (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-gray-900">
                                                ₦
                                                {Number(order.price)
                                                    .toFixed(2)
                                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className={getStatusBadge(order.payment_status)}>{order.payment_status}</span>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className={getStatusBadge(order.delivery_status)}>{order.delivery_status}</span>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    to={`/dashboard/order/details/${order._id}`}
                                                    className="inline-flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300"
                                                >
                                                    <FiEye className="text-sm" />
                                                    <span className="text-sm font-medium">View</span>
                                                </Link>

                                                {order.payment_status !== "paid" && (
                                                    <button
                                                        onClick={() => redirect(order)}
                                                        className="inline-flex items-center space-x-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-300"
                                                    >
                                                        <FiCreditCard className="text-sm" />
                                                        <span className="text-sm font-medium">Pay Now</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                        </tbody>
                    </table>

                    {recentOrders.length === 0 && (
                        <div className="text-center py-12">
                            <FiShoppingCart className="mx-auto text-4xl text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                            <button
                                onClick={() => navigate("/")}
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors duration-300"
                            >
                                <FiShoppingCart />
                                <span>Start Shopping</span>
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

export default Index
