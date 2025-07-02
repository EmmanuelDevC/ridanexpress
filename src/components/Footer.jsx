import React from 'react'
import  ridanLogo from '../assets/Images/banner/m2.png'
import { Link } from 'react-router-dom'
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa'
import { BsPhone, BsHeadset, BsShieldCheck } from 'react-icons/bs'
import { MdPayment, MdLocalShipping } from 'react-icons/md'
import { RiCustomerService2Line } from 'react-icons/ri'

const Footer = () => {
    return (
        <footer className='bg-[#172337] text-white'>
            {/* Top Section - Services */}
            <div className='bg-[#232F3E] py-6 border-b border-gray-600'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                        {[
                            { icon: <MdLocalShipping size={24} />, title: "Free Delivery", desc: "For all orders over ₦50,000" },
                            { icon: <BsShieldCheck size={24} />, title: "Secure Payment", desc: "100% protected payments" },
                            { icon: <RiCustomerService2Line size={24} />, title: "24/7 Support", desc: "Dedicated support" },
                            { icon: <MdPayment size={24} />, title: "Daily Offers", desc: "Discounts up to 70%" },
                            { icon: <BsHeadset size={24} />, title: "Help Center", desc: "Call: 01-700-7000" }
                        ].map((service, index) => (
                            <div key={index} className='flex items-center gap-3 p-2'>
                                <div className='text-orange-500'>
                                    {service.icon}
                                </div>
                                <div>
                                    <h4 className='font-medium text-sm'>{service.title}</h4>
                                    <p className='text-xs text-gray-300'>{service.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8'>
                {/* Company Info */}
                <div className='space-y-4 col-span-2'>
                    <img 
                        className='w-40 h-auto mb-4' 
                        src={ridanLogo} 
                        alt="Company Logo" 
                    />
                    <p className='text-gray-300 text-sm'>
                        Your one-stop online shop for electronics, fashion, home appliances, and more. 
                        We deliver quality products at affordable prices across Nigeria.
                    </p>
                    <div className='flex gap-4 pt-2'>
                        {[
                            { icon: <FaFacebookF />, label: 'Facebook' },
                            { icon: <FaTwitter />, label: 'Twitter' },
                            { icon: <FaInstagram />, label: 'Instagram' },
                            { icon: <FaYoutube />, label: 'YouTube' }
                        ].map((social, index) => (
                            <a
                                key={index}
                                href="#"
                                className='p-2 bg-[#2d3d52] rounded-full hover:bg-orange-500 transition-colors duration-200'
                                aria-label={social.label}
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div className='space-y-4'>
                    <h3 className='text-lg font-bold text-white mb-4'>Shop By Category</h3>
                    <ul className='space-y-3 text-gray-300'>
                        {['Phones & Tablets', 'Computers', 'Electronics', 'Fashion', 'Home & Kitchen'].map((link) => (
                            <li key={link}>
                                <Link 
                                    to="#" 
                                    className='hover:text-orange-400 transition-colors duration-200 text-sm'
                                >
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className='space-y-4'>
                    <h3 className='text-lg font-bold text-white mb-4'>Customer Service</h3>
                    <ul className='space-y-3 text-gray-300'>
                        {['Contact Us', 'FAQs', 'Track Order', 'Returns & Refunds', 'Shipping Policy'].map((link) => (
                            <li key={link}>
                                <Link 
                                    to="#" 
                                    className='hover:text-orange-400 transition-colors duration-200 text-sm'
                                >
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className='space-y-4'>
                    <h3 className='text-lg font-bold text-white mb-4'>About Us</h3>
                    <ul className='space-y-3 text-gray-300'>
                        {['About Company', 'Careers', 'Terms & Conditions', 'Privacy Policy', 'Blog'].map((link) => (
                            <li key={link}>
                                <Link 
                                    to="#" 
                                    className='hover:text-orange-400 transition-colors duration-200 text-sm'
                                >
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Payment Methods */}
            {/* <div className='bg-[#232F3E] py-4 border-t border-gray-600'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
                        <div className='flex items-center gap-2'>
                            <BsPhone className='text-orange-500' />
                            <span className='text-sm'>Download Our Mobile App:</span>
                        </div>
                        <div className='flex gap-2'>
                            <img src="https://via.placeholder.com/120x40?text=App+Store" alt="App Store" className='h-10' />
                            <img src="https://via.placeholder.com/120x40?text=Google+Play" alt="Google Play" className='h-10' />
                        </div>
                        <div className='flex gap-2'>
                            <img src="https://via.placeholder.com/40x25?text=Visa" alt="Visa" className='h-6' />
                            <img src="https://via.placeholder.com/40x25?text=Mastercard" alt="Mastercard" className='h-6' />
                            <img src="https://via.placeholder.com/40x25?text=PayPal" alt="PayPal" className='h-6' />
                            <img src="https://via.placeholder.com/40x25?text=Verve" alt="Verve" className='h-6' />
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Copyright */}
            <div className='py-6'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex flex-col md:flex-row justify-between items-center text-sm text-gray-400'>
                        <p>
                            © {new Date().getFullYear()} ShopName. All Rights Reserved.
                        </p>
                        <div className='flex gap-4 mt-3 md:mt-0'>
                            <Link to="#" className='hover:text-orange-400'>Privacy Policy</Link>
                            <Link to="#" className='hover:text-orange-400'>Terms of Use</Link>
                            <Link to="#" className='hover:text-orange-400'>Sitemap</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer