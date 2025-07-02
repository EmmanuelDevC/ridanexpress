import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { GrMail } from 'react-icons/gr';
import ridanLogo from "../assets/Images/banner/m2.png";
import ridanLogo2 from "../assets/Images/banner/m2.png";
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaLinkedinIn, FaFacebookF, FaUser, FaShoppingCart } from 'react-icons/fa';
import { AiOutlineTwitter, AiOutlineSearch } from 'react-icons/ai';
import ExpandMoreSharpIcon from '@mui/icons-material/ExpandMoreSharp';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { get_card_products, get_wishlist_products } from '../store/reducers/cardReducer';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';// import StorefrontIcon from '@mui/icons-material/Storefront';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';

const Headers = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { categorys } = useSelector(state => state.home);
    const { userInfo } = useSelector(state => state.auth);
    const { card_product_count } = useSelector(state => state.card);

    // State variables
    const [showSidebar, setShowSidebar] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [category, setCategory] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

    // Memoized debounce function
    const debounce = useCallback((func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    }, []);

    // Fetch search suggestions
    const fetchSuggestions = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchSuggestions([]);
            return;
        }

        setIsFetchingSuggestions(true);
        try {
            const { data } = await axios.get(`/api/home/search-suggestions`, {
                params: { query }
            });
            setSearchSuggestions(data?.success ? data.suggestions?.slice(0, 5) : []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSearchSuggestions([]);
        } finally {
            setIsFetchingSuggestions(false);
        }
    }, []);

    const debouncedFetchSuggestions = useMemo(() =>
        debounce(fetchSuggestions, 300),
        [debounce, fetchSuggestions]);

    // Search handlers
    const handleSearchChange = useCallback((value) => {
        setSearchValue(value);
        debouncedFetchSuggestions(value);
    }, [debouncedFetchSuggestions]);

    const search = useCallback(() => {
        if (searchValue.trim()) {
            navigate(`/products/search?category=${category}&&value=${searchValue}`);
            setSearchValue('');
            setSearchSuggestions([]);
            setShowMobileSearch(false);
        }
    }, [searchValue, category, navigate]);

    // Suggestion selection
    const selectSuggestion = useCallback((suggestion) => {
        setSearchValue(suggestion);
        setSearchSuggestions([]);
        search();
    }, [search]);

    // Memoized search components
    const DesktopSearch = useMemo(() => () => (
        <div className="hidden md:flex flex-1 max-w-2xl mx-6 relative">
            <div className="relative w-full">
                <input
                    type="text"
                    value={searchValue}
                    className="w-full px-5 py-2.5 pr-16 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-700 shadow-sm hover:shadow-lg"
                    placeholder="Search products, brands & categories..."
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && search()}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 100)}
                />
                <button
                    onClick={search}
                    className="absolute right-0 top-0 h-full px-5 bg-orange-500 text-white rounded-r-full font-medium hover:bg-orange-600 transition-all duration-200 flex items-center"
                >
                    <AiOutlineSearch className="mr-2" />
                    <span>Search</span>
                </button>

                {isSearchFocused && (searchSuggestions.length > 0 || isFetchingSuggestions) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {isFetchingSuggestions ? (
                            <div className="p-3 text-center text-gray-500">Loading...</div>
                        ) : (
                            searchSuggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => selectSuggestion(suggestion)}
                                    className="p-3 text-gray-900 hover:bg-gray-100 cursor-pointer border-b last:border-0 transition-colors"
                                >
                                    {suggestion}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    ), [searchValue, isSearchFocused, searchSuggestions, isFetchingSuggestions, handleSearchChange, search, selectSuggestion]);

    const MobileSearchModal = useMemo(() => () => (
        <div className={`fixed inset-0 bg-white z-50 p-4 transform transition-all duration-300 ${showMobileSearch ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => setShowMobileSearch(false)}
                    className="p-2 rounded-full text-red-500 hover:bg-gray-100"
                >
                    <CloseIcon />
                </button>
                <h2 className="text-xl text-orange-600 font-base">Search</h2>
                <div className="w-8"></div>
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={searchValue}
                    className="w-full px-4 py-3 pr-12 rounded-full border-2 text-gray-800 border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-gray-700"
                    placeholder="Search products..."
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && search()}
                    autoFocus
                />
                <button
                    onClick={search}
                    className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-orange-500 transition-colors"
                >
                    <AiOutlineSearch size={24} />
                </button>
            </div>

            {isFetchingSuggestions ? (
                <div className="p-3 text-center text-gray-500">Loading suggestions...</div>
            ) : (
                searchSuggestions.length > 0 && (
                    <div className="mt-4 bg-white border rounded-lg shadow-lg">
                        {searchSuggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectSuggestion(suggestion)}
                                className="p-3 text-gray-800 hover:bg-gray-100 cursor-pointer border-b last:border-0 transition-colors"
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    ), [showMobileSearch, searchValue, isFetchingSuggestions, searchSuggestions, handleSearchChange, search, selectSuggestion]);

    const redirect_card_page = useCallback(() => {
        userInfo ? navigate(`/card`) : navigate(`/login`);
    }, [userInfo, navigate]);

    useEffect(() => {
        if (userInfo) {
            dispatch(get_card_products(userInfo.id));
            dispatch(get_wishlist_products(userInfo.id));
        }
    }, [userInfo, dispatch]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`w-full bg-white ${isScrolled ? 'shadow-lg' : 'shadow-sm'} fixed top-0 z-50 transition-shadow duration-300`}>
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-2 hidden md:block">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between px-20 items-center text-white text-sm">
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center hover:text-orange-100 transition-colors">
                                <GrMail className="mr-2" size={14} />
                                Sell on Ridan
                            </span>
                            <span className="text-orange-200">|</span>
                            <span className="hover:text-orange-100 transition-colors">Powered by Ridan</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full hover:bg-opacity-30 transition-all">
                                <SupportAgentIcon className="mr-2" fontSize="small" />
                                <span>Ridan Support</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between lg:justify-evenly py-3">
                        <div className="flex items-center">
                            <button
                                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={() => setShowSidebar(!showSidebar)}
                                aria-label="Toggle menu"
                            >
                                {showSidebar ? (
                                    <CloseIcon className="text-gray-700" />
                                ) : (
                                    <MenuIcon className="text-gray-700" />
                                )}
                            </button>

                            <Link to="/" className="flex items-center">
                                <img
                                    src={ridanLogo2}
                                    className="h-8 lg:h-10 mt-2 lg:mt-0 transition-all duration-200 hover:opacity-90"
                                    alt="Ridan Logo"
                                    loading="lazy"
                                />
                            </Link>
                        </div>

                        <DesktopSearch />

                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => setShowMobileSearch(true)}
                                className="md:hidden text-xl mt-1 p-1 b font-bold rounded-full text-gray-900 hover:bg-gray-100"
                            >
                                <AiOutlineSearch size={20} />
                            </button>

                            {userInfo ? (
                                <div className="hidden md:flex items-center group relative">
                                    <button className="flex items-center space-x-1 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <FaUser size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            Hi, {userInfo?.name?.split(' ')[0] || 'User'}
                                        </span>
                                        <ExpandMoreSharpIcon className="text-gray-500" fontSize="small" />
                                    </button>
                                    <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 hidden group-hover:block z-50">
                                        <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</Link>
                                        <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                                        <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Wishlist</Link>
                                        <Link to="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign Out</Link>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="hidden md:flex items-center space-x-1 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                        <FaUser size={14} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Login</span>
                                </Link>
                            )}

                            <button
                                onClick={redirect_card_page}
                                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="Shopping cart"
                            >
                                <ShoppingCartOutlinedIcon className="text-gray-700" />
                                {card_product_count > 0 && (
                                    <span className="absolute border-2 border-white bottom-5 left-6 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                                        {card_product_count}
                                    </span>
                                )}
                            </button>

                            <button className="hidden md:flex items-center space-x-1 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors">
                                <HelpOutlineIcon className="text-gray-700" fontSize="small" />
                                <span className="text-sm font-medium text-gray-700">Help</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showMobileSearch && <MobileSearchModal />}

            {showSidebar && (
                <div className="md:hidden">
                    <div
                        onClick={() => setShowSidebar(false)}
                        className="fixed inset-0 bg-black/50 z-40 transition-opacity opacity-100 visible"
                    ></div>

                    <div className="fixed top-0 left-0 h-full w-[100%] bg-white z-50 transform transition-transform translate-x-0 shadow-xl">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b">
                                <Link to="/" onClick={() => setShowSidebar(false)}>
                                    <img src={ridanLogo} className="h-8" alt="Ridan Logo" />
                                </Link>
                                <button
                                    onClick={() => setShowSidebar(false)}
                                    className="p-2 rounded-full text-red-500 hover:bg-gray-100"
                                >
                                    <CloseIcon />
                                </button>
                            </div>

                            <div className="p-4 border-b">
                                {userInfo ? (
                                    <Link
                                        to="/dashboard"
                                        className="flex justify-between items-center space-x-3 px-2 rounded-lg hover:bg-gray-100"
                                        onClick={() => setShowSidebar(false)}
                                    >
                                        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                                <FaUser size={16} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{userInfo.name}</div>
                                                <div className="text-xs text-gray-500">View your dashboard</div>
                                            </div>
                                        </div>

                                        <ChevronRightOutlinedIcon className='text-orange-500' />
                                    </Link>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100"
                                        onClick={() => setShowSidebar(false)}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                            <FaUser size={16} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">Login / Register</div>
                                            <div className="text-xs text-gray-500">Access account features</div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-2 divide-x divide-y divide-gray-200">
                                    {/* Track Orders */}
                                    <div className="flex gap-2 text-center items-center p-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <LocationOnOutlinedIcon className='text-orange-400' />
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-sm font-base text-gray-900">Track Orders</span>
                                            <span className="text-xs text-gray-500">View order status</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-center items-center p-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <StorefrontOutlinedIcon className='text-orange-400' />
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-sm font-base text-gray-900">Sell on Ridan</span>
                                            <span className="text-xs text-gray-500">Start selling today</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-center items-center p-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <LogoutOutlinedIcon className='text-orange-400' />
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-sm font-base text-gray-900">Sign Out</span>
                                            <span className="text-xs text-gray-500">Secur account</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-center items-center p-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <HelpOutlineOutlinedIcon className='text-orange-400' />
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-sm font-base text-gray-900">Help Center</span>
                                            <span className="text-xs text-start text-gray-500">24/7 customer support</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <h3 className="font-semibold text-lg sticky top-0 h-12 items-center pt-2 pl-3 shadow-sm bg-white text-gray-800">
                                    Categories</h3>
                                <ul>
                                    {categorys.map((c, i) => (
                                        <li key={i}>
                                            <Link
                                                to={`/products?category=${c.name}`}
                                                onClick={() => setShowSidebar(false)}
                                            >
                                                <div className="flex items-center justify-between p-3 px-3 border rounded-lg hover:bg-gray-100 transition-colors">
                                                    <div className='flex justify-center items-center space-x-4'>
                                                        <img
                                                            src={c.image}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            alt={c.name}
                                                            loading="lazy"
                                                        />
                                                        <span className="text-gray-700">{c.name}</span>
                                                    </div>
                                                    <ChevronRightOutlinedIcon className='text-orange-500' />
                                                </div>

                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-2 divide-x divide-y divide-gray-200">
                                    {/* Track Orders */}
                                    <div className="flex gap-2 text-center items-center p-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-sm font-base text-gray-900">About Us</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-center items-center p-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-sm font-base text-gray-900">Contact</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-center items-center p-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-sm font-base text-gray-900">Terms</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-center items-center p-2 px-4 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-sm font-base text-gray-900">Help Center</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center space-x-4 mt-4">
                                    <a href="#" className="p-2 text-gray-500 hover:text-orange-500"><FaFacebookF /></a>
                                    <a href="#" className="p-2 text-gray-500 hover:text-orange-500"><AiOutlineTwitter /></a>
                                    <a href="#" className="p-2 text-gray-500 hover:text-orange-500"><FaLinkedinIn /></a>
                                </div>
                            </div>
                            {/* <div className="p-4 border-t">
                                <div className="grid grid-cols-2 gap-2">
                                    <Link to="/help" className="p-2 border text-sm text-gray-600 hover:text-orange-500">Help Center</Link>
                                    <Link to="/about" className="p-2 text-sm text-gray-600 hover:text-orange-500">About Us</Link>
                                    <Link to="/contact" className="p-2 text-sm text-gray-600 hover:text-orange-500">Contact</Link>
                                    <Link to="/terms" className="p-2 text-sm text-gray-600 hover:text-orange-500">Terms</Link>
                                </div>
                                <
                            </div> */}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Headers;