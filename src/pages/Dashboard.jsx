import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion';
import Headers from '../components/Headers'
import Footer from '../components/Footer'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { RxDashboard, RxPerson } from 'react-icons/rx'
import { RiProductHuntLine, RiArrowLeftRightLine } from 'react-icons/ri'
import { BsChat, BsHeart, BsGear } from 'react-icons/bs'
import { TbLock } from 'react-icons/tb'
import { FiLogOut } from 'react-icons/fi'
import api from '../api/api'
import { useDispatch } from 'react-redux'
import { user_reset } from '../store/reducers/authReducer'
import { reset_count } from '../store/reducers/cardReducer'

const MobileNav = () => {
    const location = useLocation()
    const [visible, setVisible] = useState(true)
    const [scrollPos, setScrollPos] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset
            const isVisible = scrollPos > currentScrollPos

            setScrollPos(currentScrollPos)
            setVisible(isVisible || currentScrollPos < 10)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [scrollPos])


    const navItems = [
        { path: '/dashboard', icon: <RxDashboard />, label: 'Dashboard' },
        { path: '/dashboard/my-orders', icon: <RiProductHuntLine />, label: 'Orders' },
        { path: '/dashboard/my-wishlist', icon: <BsHeart />, label: 'Wishlist' },
        { path: '/dashboard/chat', icon: <BsChat />, label: 'Chat sellers' },
        { path: '/dashboard/chage-password', icon: <TbLock />, label: 'Security' },
    ];

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className={`block lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'
                }`}
        >
            <div className="flex justify-around border-t-2 border-gray-200 items-center p-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="relative flex flex-col items-center p-2 group w-full"
                    >
                        <span
                            className={`text-2xl transition-colors duration-200 ${location.pathname === item.path
                                ? 'text-indigo-600'
                                : 'text-gray-400 hover:text-indigo-500'
                                }`}
                        >
                            {item.icon}
                        </span>
                        <span
                            className={`text-[10px] font-medium mt-1 transition-colors ${location.pathname === item.path
                                ? 'text-indigo-600'
                                : 'text-gray-500'
                                }`}
                        >
                            {item.label}
                        </span>
                        {location.pathname === item.path && (
                            <motion.div
                                className="absolute -bottom-1 w-6 h-1 bg-indigo-600 rounded-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                            />
                        )}
                    </Link>
                ))}
            </div>
        </motion.div>
    )
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
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            <Headers />
            <div className="flex-1 lg:mt-[8rem]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-6 ">
                        {/* Desktop Sidebar */}
                        <div className="hidden lg:block w-72 flex-shrink-0">
                            <div className="bg-gray-900 rounded-2xl shadow-xl p-6 h-[calc(100vh-120px)] sticky top-8 flex flex-col">
                                <div className="mb-8 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                                        <RxPerson className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">User Dashboard</h2>
                                        <p className="text-sm text-gray-400">Premium Account</p>
                                    </div>
                                </div>

                                <ul className="space-y-2 flex-1">
                                    {[
                                        { path: '/dashboard', icon: <RxDashboard />, label: 'Dashboard' },
                                        { path: '/dashboard/my-orders', icon: <RiProductHuntLine />, label: 'Orders' },
                                        { path: '/dashboard/my-wishlist', icon: <BsHeart />, label: 'Wishlist' },
                                        { path: '/dashboard/chat', icon: <BsChat />, label: 'Messages', badge: 3 },
                                        { path: '/dashboard/chage-password', icon: <TbLock />, label: 'Security' },
                                    ].map((item) => (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                className={`flex items-center justify-between gap-3 p-3 rounded-xl transition-all ${location.pathname === item.path
                                                    ? 'bg-indigo-600/20 text-indigo-400'
                                                    : 'text-gray-300 hover:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{item.icon}</span>
                                                    <span>{item.label}</span>
                                                </div>
                                                {item.badge && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-indigo-600 rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>

                                <div className="border-t border-gray-800 pt-4">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors"
                                    >
                                        <FiLogOut className="text-xl" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="bg-white mt-14 rounded-2xl shadow-sm border border-gray-200 min-h-[calc(100vh-140px)]">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <MobileNav />

            <div className='hidden lg:block'>
                <Footer />
            </div>
        </div>
    )
}

export default Dashboard