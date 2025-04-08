import React, { useState } from 'react'
import { motion } from 'framer-motion';
import Headers from '../components/Headers'
import Footer from '../components/Footer'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { FaList } from 'react-icons/fa'
import { RxDashboard } from 'react-icons/rx'
import { RiProductHuntLine } from 'react-icons/ri'
import { BsChat, BsHeart } from 'react-icons/bs'
import { TfiLock } from 'react-icons/tfi'
import { BiLogInCircle } from 'react-icons/bi'
import api from '../api/api'
import { useDispatch } from 'react-redux'
import { user_reset } from '../store/reducers/authReducer'
import { reset_count } from '../store/reducers/cardReducer'

const MobileNav = () => {
    const location = useLocation()

    const navItems = [
        { path: '/dashboard', icon: <RxDashboard />, label: 'Dashboard' },
        { path: '/dashboard/my-orders', icon: <RiProductHuntLine />, label: 'Orders' },
        { path: '/dashboard/my-wishlist', icon: <BsHeart />, label: 'Wishlist' },
        { path: '/dashboard/chat', icon: <BsChat />, label: 'Chat' },
        { path: '/dashboard/chage-password', icon: <TfiLock />, label: 'Security' },
        // { type: 'logout', icon: <BiLogInCircle />, label: 'Logout' },
    ];


    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 transform lg:hidden w-[100%] max-w-md z-50"
        >
            <div className="bg-black  rounded-t-2xl shadow-xl border border-gray-100">
                <div className="flex justify-around items-center p-2">
                    {navItems.map((item) => (
                        
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex flex-col items-center p-2 group"
                            >
                                <div
                                    className={`absolute -top-3 w-1 h-1 rounded-full transition-all ${location.pathname === item.path
                                            ? 'bg-indigo-500'
                                            : 'opacity-0 group-hover:opacity-100 bg-gray-300'
                                        }`}
                                />
                                <span
                                    className={`text-xl mb-1 transition-colors ${location.pathname === item.path
                                            ? 'text-indigo-500'
                                            : 'text-gray-200 group-hover:text-indigo-400'
                                        }`}
                                >
                                    {item.icon}
                                </span>
                                <span
                                    className={`text-[10px] font-xs  tracking-wide transition-colors ${location.pathname === item.path
                                            ? 'text-indigo-500'
                                            : 'text-white group-hover:text-gray-700'
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        )
                    )}
                </div>
            </div>
        </motion.div>
    );
};



const Dashboard = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    const logout = async () => {
        try {
            const { data } = await api.get('/customer-logout')
            localStorage.removeItem('customerToken')
            dispatch(user_reset())
            dispatch(reset_count())
            navigate('/login')
        } catch (error) {
            console.log(error.response.data)
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Headers />

            <div className="bg-slate-100 flex-1 mt-[2rem] lg:mt-[100px] pb-14 md:pb-0">
                <div className="max-w-7xl mx-auto lg:px-8">
                    <div className="flex flex-col md:flex-row gap-6 pt-5">
                        {/* Desktop Sidebar */}
                        <div className="hidden md:hidden lg:block sticky top-0 md:block w-64 flex-shrink-0">
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <ul className="space-y-2">
                                    <li>
                                        <Link
                                            to="/dashboard"
                                            className={`flex items-center gap-3 p-3 rounded-lg ${location.pathname === '/dashboard'
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <RxDashboard className="text-xl" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/dashboard/my-orders"
                                            className={`flex items-center gap-3 p-3 rounded-lg ${location.pathname === '/dashboard/my-orders'
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <RiProductHuntLine className="text-xl" />
                                            <span>My Orders</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/dashboard/my-wishlist"
                                            className={`flex items-center gap-3 p-3 rounded-lg ${location.pathname === '/dashboard/my-wishlist'
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <BsHeart className="text-xl" />
                                            <span>Wishlist</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/dashboard/chat"
                                            className={`flex items-center gap-3 p-3 rounded-lg ${location.pathname === '/dashboard/chat'
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <BsChat className="text-xl" />
                                            <span>Chat</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/dashboard/chage-password"
                                            className={`flex items-center gap-3 p-3 rounded-lg ${location.pathname === '/dashboard/chage-password'
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <TfiLock className="text-xl" />
                                            <span>Change Password</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50"
                                        >
                                            <BiLogInCircle className="text-xl" />
                                            <span>Logout</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="bg-white rounded-lg shadow-sm p-1 lg:p-6">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <MobileNav onLogout={logout} />

            <div className='hidden lg:block'>
                <Footer />
            </div>
        </div>
    )
}

export default Dashboard