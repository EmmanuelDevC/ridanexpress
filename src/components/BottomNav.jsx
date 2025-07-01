import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { FaLinkedinIn, FaFacebookF, FaUser } from 'react-icons/fa'
import { AiOutlineTwitter, AiFillGithub } from 'react-icons/ai'
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderSharpIcon from '@mui/icons-material/FavoriteBorderSharp';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const BottomNav = () => {
    const [visible, setVisible] = useState(true);
    const [scrollPos, setScrollPos] = useState(0);
    const { card_product_count, wishlist_count } = useSelector(state => state.card);
    const { userInfo } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [showSidebar, setShowSidebar] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;
            const isVisible = scrollPos > currentScrollPos;

            setScrollPos(currentScrollPos);
            setVisible(isVisible);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrollPos]);

    const navItems = [
        {
            icon: <HomeIcon />,
            label: "Home",
            path: "/"
        },
        {
            icon: <SearchIcon />,
            label: "Search",
            path: "/search"
        },
        {
            icon: <ShoppingCartOutlinedIcon />,
            label: "Cart",
            path: "/card",
            requiresAuth: true,
            count: card_product_count
        },
        {
            icon: <FavoriteBorderSharpIcon />,
            label: "Wishlist",
            path: "/dashboard/my-wishlist",
            requiresAuth: true,
            count: wishlist_count
        },
        {
            icon: <MoreHorizOutlinedIcon />,
            label: "More",
            requiresAuth: false
        },
    ];

    const handleNavigation = (item, index) => {
        setActiveTab(index);

        if (item.requiresAuth && !userInfo) {
            navigate('/login');
            return;
        }

        if (item.label === "More") {
            setShowSidebar(prev => !prev);
            return;
        }

        if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-40 bg-slate-100 shadow-4xl border border-[#C48A47] rounded-t-2xl transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex justify-around items-center py-3 px-2">
                {navItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => handleNavigation(item, index)}
                        className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === index
                            ? "text-white bg-[#C48A47]"
                            : "text-gray-800 hover:text-orange-400"
                            }`}
                        style={{ minWidth: "60px" }}
                    >
                        <div className="relative">
                            <span className={`text-2xl ${activeTab === index ? "scale-110" : "scale-100"
                                } transition-transform`}>
                                {React.cloneElement(item.icon, {
                                    fontSize: "medium"
                                })}
                            </span>
                            {item.count > 0 && (
                                <span className={`absolute -top-1 -right-2 text-xs w-5 h-5 rounded-full flex items-center justify-center 
                                    ${item.label === 'Cart' ? 'bg-[#C48A47]' : 'bg-[#C48A47]'} text-white`}>
                                    {item.count}
                                </span>
                            )}
                        </div>
                        <span className={`text-[10px] font-medium mt-1 ${activeTab === index ? "font-bold" : "font-normal"
                            }`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Side Navigation */}
            <div className={`fixed inset-0 z-50 transform ${showSidebar ? 'translate-x-full' : 'translate-x-0'} transition-transform duration-300`}>
                <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowSidebar(true)}></div>
                <div className="relative bg-white w-72 h-full ml-auto p-6 overflow-y-auto">
                    <div className="space-y-6">
                        <Link to="/" className="block mb-6">
                            <img src="/images/logo.png" alt="Logo" className="h-10" />
                        </Link>

                        <div className="space-y-4">
                            <Link to="/dashboard" className="flex items-center">
                                <FaUser className="mr-2" />
                                {userInfo ? userInfo.name : 'Account'}
                            </Link>

                            <div className="border-t pt-4 space-y-2">
                                <Link to="/" className="block py-2">Home</Link>
                                <Link to="/shops" className="block py-2">Shop</Link>
                                <Link to="/blog" className="block py-2">Blog</Link>
                                <Link to="/about" className="block py-2">About</Link>
                                <Link to="/contact" className="block py-2">Contact</Link>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex space-x-4 text-xl">
                                    <FaFacebookF />
                                    <AiOutlineTwitter />
                                    <FaLinkedinIn />
                                    <AiFillGithub />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BottomNav;