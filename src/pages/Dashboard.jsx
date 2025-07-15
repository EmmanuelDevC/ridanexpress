import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Headers from '../components/Headers'
import Footer from '../components/Footer'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { RxDashboard, RxPerson } from 'react-icons/rx'
import { BsChat, BsHeart } from 'react-icons/bs'
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import { FiPackage } from 'react-icons/fi'
import { FiLogOut } from 'react-icons/fi'
import api from '../api/api'
import { useDispatch } from 'react-redux'
import { user_reset } from '../store/reducers/authReducer'
import { reset_count } from '../store/reducers/cardReducer'

const MobileNav = () => {
    const location = useLocation()
    const [visible, setVisible] = useState(true)
    const lastScrollPos = useRef(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset
            const isScrollingDown = currentScrollPos > lastScrollPos.current

            // Show/hide logic
            if (currentScrollPos > 100) {
                setVisible(!isScrollingDown)
            } else {
                setVisible(true)
            }

            lastScrollPos.current = currentScrollPos
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navItems = [
        { path: '/dashboard', icon: <RxDashboard />, label: 'Dashboard' },
        { path: '/dashboard/my-orders', icon: <FiPackage />, label: 'Orders' },
        { path: '/dashboard/my-wishlist', icon: <BsHeart />, label: 'Wishlist' },
        { path: '/dashboard/profile', icon: <AccountBoxOutlinedIcon />, label: 'Profile' },
    ]

    return (
        <div
            className={`block lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black shadow-lg rounded-t-2xl transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'
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
                                    ? 'text-orange-500'
                                    : 'text-gray-300 hover:text-orange-500'
                                }`}
                        >
                            {item.icon}
                        </span>
                        <span
                            className={`text-[10px] font-medium mt-1 transition-colors ${location.pathname === item.path
                                    ? 'text-orange-500'
                                    : 'text-gray-300'
                                }`}
                        >
                            {item.label}
                        </span>
                        {location.pathname === item.path && (
                            <motion.div
                                className="absolute -bottom-1 w-6 h-1 bg-orange-500 rounded-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                            />
                        )}
                    </Link>
                ))}
            </div>
        </div>
    )
}

const Dashboard = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

    const navItems = [
        { path: '/dashboard', icon: <RxDashboard />, label: 'Dashboard' },
        { path: '/dashboard/my-orders', icon: <FiPackage />, label: 'Orders' },
        { path: '/dashboard/my-wishlist', icon: <BsHeart />, label: 'Wishlist' },
        { path: '/dashboard/profile', icon: <AccountBoxOutlinedIcon />, label: 'Profile' },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            <Headers />
            <div className="flex-1 lg:mt-[8rem]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Mobile Sidebar Toggle
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden fixed bottom-20 right-4 z-50 p-3 bg-black text-white rounded-full shadow-lg"
                        >
                            <BsList className="text-2xl" />
                        </button> */}

                        {/* Responsive Sidebar */}
                        <div
                            className={`fixed lg:sticky lg:block inset-y-0 left-0 z-40 w-72 bg-gray-900 transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                                }`}
                        >
                            <div className="rounded-2xl shadow-xl p-6 h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)] sticky top-8 flex flex-col">
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
                                    {navItems.map((item) => (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                onClick={() => setIsMobileMenuOpen(false)}
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
                            <div className="mt-14 lg:mt-0 rounded-2xl shadow-sm border border-gray-200 px-2 min-h-[calc(100vh-140px)]">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <MobileNav />

            <div className="hidden">
                <Footer />
            </div>
        </div>
    )
}

export default Dashboard