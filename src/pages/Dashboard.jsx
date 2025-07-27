"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Headers from "../components/Headers"
import Footer from "../components/Footer"
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom"
import { BsHeart } from "react-icons/bs"
import { FiLogOut, FiBell, FiShoppingCart, FiUser, FiMessageCircle, FiGrid } from "react-icons/fi"
import { HiOutlineShoppingBag } from "react-icons/hi"
import api from "../api/api"
import { useDispatch } from "react-redux"
import { user_reset } from "../store/reducers/authReducer"
import { reset_count } from "../store/reducers/cardReducer"

const MobileNav = () => {
    const location = useLocation()
    const [visible, setVisible] = useState(true)
    const lastScrollPos = useRef(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset
            const isScrollingDown = currentScrollPos > lastScrollPos.current

            if (currentScrollPos > 100) {
                setVisible(!isScrollingDown)
            } else {
                setVisible(true)
            }
            lastScrollPos.current = currentScrollPos
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navItems = [
        { path: "/dashboard", icon: <FiGrid />, label: "Overview" },
        { path: "/dashboard/my-orders", icon: <HiOutlineShoppingBag />, label: "Orders" },
        { path: "/dashboard/my-wishlist", icon: <BsHeart />, label: "Wishlist" },
        { path: "/dashboard/chat", icon: <FiMessageCircle />, label: "Support", badge: true },
        { path: "/dashboard/profile", icon: <FiUser />, label: "Account" },
    ]

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-4 left-4 right-4 z-50 lg:hidden"
                >
                    <div className="bg-white shadow-2xl rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center">
                            {navItems.map((item, index) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="flex-1 flex flex-col items-center py-3 px-2 group relative"
                                >
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
                                        <div
                                            className={`p-2 rounded-xl transition-all duration-300 ${location.pathname === item.path
                                                ? "bg-orange-500 shadow-lg shadow-orange-500/25"
                                                : "group-hover:bg-orange-50"
                                                }`}
                                        >
                                            <span
                                                className={`text-lg transition-colors duration-300 ${location.pathname === item.path ? "text-white" : "text-gray-600 group-hover:text-orange-500"
                                                    }`}
                                            >
                                                {item.icon}
                                            </span>
                                        </div>
                                        {item.badge && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </motion.div>
                                    <span
                                        className={`text-xs font-medium mt-1 transition-colors duration-300 ${location.pathname === item.path ? "text-orange-500" : "text-gray-500 group-hover:text-orange-500"
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const Dashboard = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const logout = async () => {
        try {
            const { data } = await api.get("/customer-logout")
            localStorage.removeItem("customerToken")
            dispatch(user_reset())
            dispatch(reset_count())
            navigate("/login")
        } catch (error) {
            console.log(error.response.data)
        }
    }

    const navItems = [
        { path: "/dashboard", icon: <FiGrid />, label: "Dashboard Overview", color: "text-blue-500" },
        { path: "/dashboard/my-orders", icon: <HiOutlineShoppingBag />, label: "My Orders", color: "text-green-500" },
        {
            path: "/dashboard/chat",
            icon: <FiMessageCircle />,
            label: "Customer Support",
            badge: "New",
            color: "text-purple-500",
        },
        { path: "/dashboard/my-wishlist", icon: <BsHeart />, label: "My Wishlist", color: "text-red-500" },
        { path: "/dashboard/profile", icon: <FiUser />, label: "Account Settings", color: "text-orange-500" },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <Headers />

            <div className="pt-8 lg:pt-32">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">
                        {/* Sidebar */}
                        <div className="lg:w-80 xl:w-96">
                            <div className="sticky top-24 lg:top-36">

                                {/* Sidebar Content */}
                                <div className={`${isMobileMenuOpen ? "block" : "hidden"} lg:block`}>
                                    {/* User Profile Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                                                    <FiUser className="text-2xl text-white" />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full"></div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900">Welcome back!</h3>
                                                <p className="text-sm text-gray-600">Manage your account</p>
                                                <div className="flex items-center mt-2">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        Premium Member
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Navigation Menu */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-4">
                                            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Account Menu</h4>
                                            <nav className="space-y-1">
                                                {navItems.map((item, index) => (
                                                    <motion.div
                                                        key={item.path}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <Link
                                                            to={item.path}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${location.pathname === item.path
                                                                ? "bg-orange-50 border-2 border-orange-200 text-orange-700"
                                                                : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                                                                }`}
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <span
                                                                    className={`text-xl ${location.pathname === item.path ? "text-orange-500" : item.color
                                                                        }`}
                                                                >
                                                                    {item.icon}
                                                                </span>
                                                                <span className="font-medium">{item.label}</span>
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                {item.badge && (
                                                                    <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                                                                        {item.badge}
                                                                    </span>
                                                                )}
                                                                {location.pathname === item.path && (
                                                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </nav>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                                Quick Actions
                                            </h5>
                                            <div className="space-y-2">
                                                <button className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-white hover:text-gray-900 transition-all duration-300 group">
                                                    <FiBell className="text-lg group-hover:text-orange-500" />
                                                    <span className="text-sm font-medium">Notifications</span>
                                                    <div className="ml-auto w-2 h-2 bg-red-500 rounded-full"></div>
                                                </button>

                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={logout}
                                                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-300 group"
                                                >
                                                    <FiLogOut className="text-lg group-hover:translate-x-1 transition-transform duration-300" />
                                                    <span className="text-sm font-medium">Sign Out</span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[calc(100vh-200px)] lg:min-h-[calc(100vh-180px)]"
                            >

                                {/* Page Content */}
                                <div className="p-6 lg:p-8 pb-24 lg:pb-8">
                                    <Outlet />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <MobileNav />

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <div className="hidden">
                <Footer />
            </div>
        </div>
    )
}

export default Dashboard
