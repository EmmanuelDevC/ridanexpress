import React, { useEffect } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import VerifiedUserTwoToneIcon from '@mui/icons-material/VerifiedUserTwoTone';
import SupportAgentTwoToneIcon from '@mui/icons-material/SupportAgentTwoTone';

import {
    AiOutlineShoppingCart,
    AiOutlineClockCircle,
    AiOutlineCloseCircle,
    AiOutlineLineChart,
    AiOutlineMessage,
    AiOutlineFileSearch
} from 'react-icons/ai';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { get_dashboard_index_data } from '../../store/reducers/dashboardReducer';

const Index = () => {
    const navigate = useNavigate();
    const { userInfo } = useSelector(state => state.auth);
    const { totalOrder, pendingOrder, recentOrders, cancelledOrder } = useSelector(state => state.dashboard);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(get_dashboard_index_data(userInfo.id));
    }, [dispatch, userInfo.id]);

    const redirect = (ord) => {
        const items = ord.products.reduce((acc, product) => acc + product.quantity, 0);
        navigate('/payment', {
            state: {
                price: ord.price,
                items,
                orderId: ord._id
            }
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'paid': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'cancelled': 'bg-red-100 text-red-800',
            'delivered': 'bg-blue-100 text-blue-800'
        };
        return `px-3 py-1 rounded-full text-sm ${statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 mb-14">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-gray-900 to-purple-600 rounded-2xl mt-3 sm:mt-10 md:mt-20 lg:mt-0 text-white py-7 px-6">
                <div className="max-w-9xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <div className='flex items-center gap-1'>
                                <VerifiedUserTwoToneIcon className='text-indigo-200'/>
                                <h1 className=" text-lg lg:text-2xl font-semi">Hi, {userInfo.name}</h1>
                            </div>
                            <p className="text-gray-200 text-xs mt-2">Here's your activity summary</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-4">
                            <button
                                onClick={() => navigate('/home')}
                                className="flex items-center text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all">
                                <SupportAgentTwoToneIcon className="mr-2" />
                                Support
                            </button>
                            <Link to={"/"}>
                                <button className="flex items-center text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all">
                                    <HomeIcon className="mr-2" />
                                    Back to shop
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 py-8 -mt-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 mb-6">
                    <div className="bg-white p-4 sm:p-6 shadow-md shadow-blue-500/20 rounded-lg border-l-2 sm:border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm">All Orders</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalOrder}</p>
                            </div>
                            <AiOutlineShoppingCart className="text-3xl sm:text-4xl text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 shadow-md shadow-yellow-500/20 rounded-lg border-l-2 sm:border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm">Pending Orders</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{pendingOrder}</p>
                            </div>
                            <AiOutlineClockCircle className="text-3xl sm:text-4xl text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 shadow-md shadow-red-500/20 rounded-lg border-l-2 sm:border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm">Cancelled</p>
                                <p className="text-2xl font-semibold text-gray-900">{cancelledOrder}</p>
                            </div>
                            <AiOutlineCloseCircle className="text-3xl sm:text-4xl text-red-500" />
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 shadow-md shadow-green-500/20 rounded-lg border-l-2 sm:border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm">Deliverd</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {totalOrder - pendingOrder - cancelledOrder}
                                </p>
                            </div>
                            <AiOutlineLineChart className="text-3xl sm:text-4xl text-green-500" />
                        </div>
                    </div>
                </div>


                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                    <h3 className="text-base sm:text-lg font-semibold mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        <button
                            className="p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex flex-col items-center text-center"
                        // onClick={() => navigate('/products')}
                        >
                            <AiOutlineShoppingCart className="text-xl sm:text-2xl text-blue-600 mb-1 sm:mb-2" />
                            <span className="text-sm sm:text-base font-medium">New Order</span>
                        </button>
                        <button
                            className="p-3 sm:p-4 bg-green-50 hover:bg-green-100 rounded-md transition-colors flex flex-col items-center text-center"
                        // onClick={() => navigate('/support')}
                        >
                            <AiOutlineMessage className="text-xl sm:text-2xl text-green-600 mb-1 sm:mb-2" />
                            <span className="text-sm sm:text-base font-medium">Support</span>
                        </button>
                        <button
                            className="p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors flex flex-col items-center text-center"
                        // onClick={() => navigate('/documents')}
                        >
                            <AiOutlineFileSearch className="text-xl sm:text-2xl text-purple-600 mb-1 sm:mb-2" />
                            <span className="text-sm sm:text-base font-medium">Track your order</span>
                        </button>
                        <button
                            className="p-3 sm:p-4 bg-yellow-50 hover:bg-yellow-100 rounded-md transition-colors flex flex-col items-center text-center"
                        // onClick={() => navigate('/reports')}
                        >
                            <AiOutlineLineChart className="text-xl sm:text-2xl text-yellow-600 mb-1 sm:mb-2" />
                            <span className="text-sm sm:text-base font-medium">Reports</span>
                        </button>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white rounded-lg shadow-sm mt-5 overflow-hidden">
                    <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-sm sm:text-base font-semibold">Recent Orders</h2>
                        <Link
                            to="/dashboard/my-orders"
                            className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center"
                        >
                            <span className="hidden sm:inline">View All</span>
                            <span className="sm:hidden">All →</span>
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] sm:min-w-0">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 sm:px-6 py-2 text-left text-xs sm:text-sm font-medium text-orange-500">Order ID</th>
                                    <th className="px-3 sm:px-6 py-2 text-right text-xs sm:text-sm font-medium text-orange-500">Amount</th>
                                    <th className="px-3 sm:px-6 py-2 text-left text-xs sm:text-sm font-medium text-orange-500">Payment</th>
                                    <th className="px-3 sm:px-6 py-2 text-left text-xs sm:text-sm font-medium text-orange-500">Status</th>
                                    <th className="px-3 sm:px-6 py-2 text-right text-xs sm:text-sm font-medium text-orange-500">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.map((order, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[90px] truncate">
                                            #{order._id.slice(-8)}
                                        </td>
                                        <td className="px-3 sm:px-6 py-2 text-xs sm:text-sm text-gray-500 text-right">
                                            {order.price && (
                                                <>
                                                    ₦ {Number(order.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-6 py-2">
                                            <span className={`${getStatusBadge(order.payment_status)} text-xs px-2 py-0.5`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-2">
                                            <span className={`${getStatusBadge(order.delivery_status)} text-xs px-2 py-0.5`}>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;