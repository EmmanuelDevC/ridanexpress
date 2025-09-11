import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { get_card_products, get_wishlist_products } from '../store/reducers/cardReducer';
import ridanLogo from "../assets/Images/banner/m2.png";

// Icon imports
import {
    FaLinkedinIn,
    FaFacebookF,
    FaUser,
    FaBell,
    FaHeart
} from 'react-icons/fa';
import {
    AiOutlineTwitter,
    AiOutlineSearch,
    AiOutlineClose
} from 'react-icons/ai';
import {
    ExpandMore as ExpandMoreIcon,
    ShoppingCartOutlined as ShoppingCartIcon,
    SupportAgent as SupportAgentIcon,
    Close as CloseIcon,
    LocationOnOutlined as LocationIcon,
    StorefrontOutlined as StorefrontIcon,
    LogoutOutlined as LogoutIcon,
    HelpOutlineOutlined as HelpOutlineIcon,
    ChevronRightOutlined as ChevronRightIcon,
    Menu as MenuIcon,
    LocalOffer as OfferIcon
} from '@mui/icons-material';

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
    const [showCategories, setShowCategories] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // Refs
    const searchContainerRef = useRef(null);
    const categoriesRef = useRef(null);
    const userDropdownRef = useRef(null);
    const debounceTimer = useRef(null);
    const abortControllerRef = useRef(null);
    const suggestionCache = useRef({}); // simple in-memory cache
    const lastQueryRef = useRef('');

    // Fetch suggestions with cancellation (AbortController)
    const fetchSuggestions = useCallback(async (query) => {
        // Avoid useless calls for short input
        if (!query || query.trim().length < 2) {
            if (searchSuggestions.length > 0) setSearchSuggestions([]);
            lastQueryRef.current = '';
            return;
        }

        // Use cache if available
        if (suggestionCache.current[query]) {
            setSearchSuggestions(suggestionCache.current[query]);
            lastQueryRef.current = query;
            return;
        }

        // If same query already fetched, skip
        if (lastQueryRef.current === query) return;

        // Cancel previous request if any
        if (abortControllerRef.current) {
            try { abortControllerRef.current.abort(); } catch (e) {}
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsFetchingSuggestions(true);
        try {
            const { data } = await axios.get('/api/home/search-suggestions', {
                params: { query },
                signal: controller.signal
            });

            const suggestions = data?.success ? (data.suggestions || []).slice(0, 5) : [];
            setSearchSuggestions(suggestions);
            suggestionCache.current[query] = suggestions;
            lastQueryRef.current = query;
        } catch (error) {
            // axios throws a CanceledError on abort; ignore that
            const canceled = error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED';
            if (!canceled) {
                console.error('Error fetching suggestions:', error);
                setSearchSuggestions([]);
                lastQueryRef.current = '';
            }
        } finally {
            setIsFetchingSuggestions(false);
        }
    }, [searchSuggestions.length]);

    // Debounced input handler
    const handleSearchChange = useCallback((value) => {
        setSearchValue(value);

        // If user quickly clears or types <2 chars, clear suggestions early
        if (!value || value.trim().length < 2) {
            // cancel any running request
            if (abortControllerRef.current) {
                try { abortControllerRef.current.abort(); } catch (e) {}
            }
            setSearchSuggestions([]);
            lastQueryRef.current = '';
        }

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 350);
    }, [fetchSuggestions]);

    // Perform search (navigate)
    const search = useCallback(() => {
        if (searchValue.trim()) {
            navigate(`/products/search?category=${encodeURIComponent(category || '')}&&value=${encodeURIComponent(searchValue)}`);
            setSearchValue('');
            setSearchSuggestions([]);
            setShowMobileSearch(false);
            lastQueryRef.current = '';
        }
    }, [searchValue, category, navigate]);

    // Select suggestion
    const selectSuggestion = useCallback((suggestion) => {
        // Prevent default focus loss behavior by setting value and navigating
        setSearchValue(suggestion);
        setSearchSuggestions([]);
        lastQueryRef.current = suggestion;

        // Cancel any outstanding request
        if (abortControllerRef.current) {
            try { abortControllerRef.current.abort(); } catch (e) {}
        }

        // Navigate (use timeout so state updates propagate)
        setTimeout(() => search(), 0);
    }, [search]);

    // Redirect to cart or login
    const redirect_card_page = useCallback(() => {
        userInfo ? navigate(`/card`) : navigate(`/login`);
    }, [userInfo, navigate]);

    // Click outside handlers
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
            if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
                setShowCategories(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load user card/wishlist
    useEffect(() => {
        if (userInfo) {
            dispatch(get_card_products(userInfo.id));
            dispatch(get_wishlist_products(userInfo.id));
        }
    }, [userInfo, dispatch]);

    // Scroll shadow
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Cleanup on unmount: clear timers and abort pending requests
    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            if (abortControllerRef.current) {
                try { abortControllerRef.current.abort(); } catch (e) {}
            }
        };
    }, []);

    // ----------------- JSX parts -----------------
    // Desktop search (inline JSX — not returning a function component)
    const DesktopSearch = (
        <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-2xl relative">
            <div className="relative w-full">
                <input
                    type="text"
                    value={searchValue}
                    className="w-full px-5 py-3 pr-16 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-gray-800 shadow-sm hover:shadow-lg"
                    placeholder="Search products, brands & categories..."
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && search()}
                    onFocus={() => setIsSearchFocused(true)}
                />
                <button
                    type="button"
                    onClick={search}
                    className="absolute right-0 top-0 h-full px-5 bg-orange-500 text-white rounded-full font-medium hover:bg-primary-600 transition-all duration-200 flex items-center"
                >
                    <AiOutlineSearch className="mr-2" />
                    <span>Search</span>
                </button>

                {isSearchFocused && (searchSuggestions.length > 0 || isFetchingSuggestions) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                        {isFetchingSuggestions ? (
                            <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
                        ) : (
                            searchSuggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    onMouseDown={(e) => e.preventDefault()} // prevents input blur before click
                                    onClick={() => selectSuggestion(suggestion)}
                                    className="p-3 text-gray-800 hover:bg-gray-50 cursor-pointer border-b last:border-0 transition-colors flex items-center"
                                >
                                    <AiOutlineSearch className="text-gray-400 mr-3" />
                                    {suggestion}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    // Mobile Search Modal JSX
    const MobileSearchModal = (
        <div className={`fixed inset-0 bg-white z-50 p-4 transform transition-all duration-300 ${showMobileSearch ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={() => setShowMobileSearch(false)}
                    className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                >
                    <AiOutlineClose size={24} />
                </button>
                <h2 className="text-2xl font-bold text-primary-600">Search</h2>
                <div className="w-10" />
            </div>

            <div className="relative mb-4">
                <input
                    type="text"
                    value={searchValue}
                    className="w-full px-5 py-3 pr-12 rounded-full border-2 text-gray-800 border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                    placeholder="What are you looking for?"
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && search()}
                    autoFocus
                />
                <button
                    type="button"
                    onClick={search}
                    className="absolute right-0 top-0 h-full px-4 text-gray-500 hover:text-primary-600 transition-colors"
                >
                    <AiOutlineSearch size={24} />
                </button>
            </div>

            {isFetchingSuggestions ? (
                <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
            ) : (
                searchSuggestions.length > 0 && (
                    <div className="bg-white border rounded-xl shadow-lg">
                        {searchSuggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectSuggestion(suggestion)}
                                className="p-4 text-gray-800 hover:bg-gray-50 cursor-pointer border-b last:border-0 transition-colors flex items-center"
                            >
                                <AiOutlineSearch className="text-gray-400 mr-3" />
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );

    // ----------------- return main JSX -----------------
    return (
        <header className={`w-full bg-white ${isScrolled ? 'shadow-lg' : 'shadow-sm'} fixed top-0 z-50 transition-all duration-300`}>
            {/* Top info bar */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-600 py-2 hidden md:block">
                <div className="container mx-auto ">
                    <div className="flex justify-between items-center text-white text-sm">
                        <div className="flex items-center space-x-6">
                            <span className="flex items-center hover:text-primary-200 transition-colors">
                                <FaBell className="mr-2 text-primary-300" size={14} />
                                Free shipping on all Orders on Ridan Express🫰
                            </span>
                            <span className="text-primary-400 mx-2">|</span>
                            <span className="flex items-center hover:text-primary-200 transition-colors">
                                <OfferIcon className="mr-2 text-primary-300" fontSize="small" />
                                Summer Sale: Up to 50% off
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button type="button" className="flex items-center hover:text-primary-200 transition-colors">
                                <SupportAgentIcon className="mr-2 text-primary-300" fontSize="small" />
                                <span>24/7 Support</span>
                            </button>
                            <span className="text-primary-400 mx-2">|</span>
                            <div className="flex space-x-3">
                                <a href="#" className="hover:text-primary-200 transition-colors"><FaFacebookF size={14} /></a>
                                <a href="#" className="hover:text-primary-200 transition-colors"><AiOutlineTwitter size={14} /></a>
                                <a href="#" className="hover:text-primary-200 transition-colors"><FaLinkedinIn size={14} /></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
                                onClick={() => setShowSidebar(!showSidebar)}
                                aria-label="Toggle menu"
                            >
                                {showSidebar ? (
                                    <CloseIcon className="text-gray-700" fontSize="medium" />
                                ) : (
                                    <MenuIcon className="text-gray-700" fontSize="medium" />
                                )}
                            </button>

                            <Link to="/" className="flex items-center">
                                <img
                                    src={ridanLogo}
                                    className="h-10 lg:h-12 transition-all duration-200 hover:opacity-90"
                                    alt="Ridan Logo"
                                    loading="eager"
                                />
                            </Link>
                        </div>

                        {DesktopSearch}

                        <div className="flex items-center space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowMobileSearch(true)}
                                className="md:hidden text-xl p-2 rounded-full text-gray-900 hover:bg-gray-100"
                            >
                                <AiOutlineSearch size={24} />
                            </button>

                            {userInfo ? (
                                <div ref={userDropdownRef} className="hidden md:flex items-center group relative">
                                    <button
                                        type="button"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors"
                                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                            <FaUser size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            Hi, {userInfo?.name?.split(' ')[0] || 'User'}
                                        </span>
                                        <ExpandMoreIcon className="text-gray-500" fontSize="small" />
                                    </button>
                                    {showUserDropdown && (
                                        <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                                            <Link to="/dashboard" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
                                                <FaUser className="mr-3 text-primary-500" size={14} />
                                                My Account
                                            </Link>
                                            <Link to="/orders" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
                                                <ShoppingCartIcon className="mr-3 text-primary-500" fontSize="small" />
                                                My Orders
                                            </Link>
                                            <Link to="/wishlist" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
                                                <FaHeart className="mr-3 text-primary-500" size={14} />
                                                Wishlist
                                            </Link>
                                            <div className="border-t my-1"></div>
                                            <Link to="/logout" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
                                                <LogoutIcon className="mr-3 text-primary-500" fontSize="small" />
                                                Sign Out
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                        <FaUser size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Login</span>
                                </Link>
                            )}

                            <Link
                                to="/wishlist"
                                className="hidden md:flex items-center p-2 rounded-full hover:bg-gray-50 transition-colors relative"
                                aria-label="Wishlist"
                            >
                                <FaHeart className="text-gray-700" size={20} />
                                <span className="absolute -top-1 -right-1 bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                    5
                                </span>
                            </Link>

                            <button
                                type="button"
                                onClick={redirect_card_page}
                                className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
                                aria-label="Shopping cart"
                            >
                                <ShoppingCartIcon className="text-gray-700" fontSize="medium" />
                                {card_product_count > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                        {card_product_count}
                                    </span>
                                )}
                            </button>

                            <button type="button" className="hidden md:flex items-center p-2 rounded-full hover:bg-gray-50 transition-colors relative">
                                <FaBell className="text-gray-700" size={20} />
                                <span className="absolute -top-1 -right-1 bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                    3
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Navigation Bar */}
            <div className="hidden md:block border-t border-gray-100 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-1">
                        <div className="flex space-x-8">
                            <div ref={categoriesRef} className="relative">
                                <button
                                    type="button"
                                    className="flex items-center font-medium text-gray-700 hover:text-primary-600 transition-colors py-2"
                                    onClick={() => setShowCategories(!showCategories)}
                                >
                                    <MenuIcon className="mr-2 text-primary-500" />
                                    <span className="font-semibold">All Categories</span>
                                    <ExpandMoreIcon className="ml-1 text-gray-500" />
                                </button>

                                {showCategories && (
                                    <div className="absolute top-full left-0 mt-1 w-64 bg-white shadow-xl rounded-xl py-3 z-50 border border-gray-100">
                                        {categorys.slice(0, 8).map(c => (
                                            <Link
                                                key={c._id}
                                                to={`/products?category=${c.name}`}
                                                className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <img
                                                    src={c.image}
                                                    className="w-9 h-9 rounded-full object-cover mr-3 border border-gray-200"
                                                    alt={c.name}
                                                />
                                                <span className="text-gray-800">{c.name}</span>
                                            </Link>
                                        ))}
                                        <Link
                                            to="/categories"
                                            className="flex items-center px-4 py-3 text-primary-600 font-semibold hover:bg-gray-50 mt-2 border-t border-gray-100 pt-3"
                                        >
                                            <ChevronRightIcon className="mr-2 text-primary-500" />
                                            <span>Browse All Categories</span>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-8">
                                <Link to="/deals" className="font-medium text-gray-700 hover:text-primary-600 transition-colors flex items-center py-2">
                                    <span className="flex items-center text-red-500 font-semibold">
                                        <OfferIcon className="mr-2 text-red-500" />
                                        Deals & Offers
                                    </span>
                                </Link>

                                <Link to="/new-arrivals" className="font-medium text-gray-700 hover:text-primary-600 transition-colors py-2">
                                    New Arrivals
                                </Link>

                                <Link to="/best-sellers" className="font-medium text-gray-700 hover:text-primary-600 transition-colors py-2">
                                    Best Sellers
                                </Link>

                                <Link to="/track-order" className="font-medium text-gray-700 hover:text-primary-600 transition-colors py-2">
                                    Track Delivery
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <Link to="/become-seller" className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors py-2">
                                <StorefrontIcon className="mr-2 text-primary-500" fontSize="small" />
                                <span>Become a Seller</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {showMobileSearch && MobileSearchModal}

            {showSidebar && (
                <div className="md:hidden">
                    <div
                        onClick={() => setShowSidebar(false)}
                        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    ></div>

                    <div className="fixed top-0 left-0 h-full w-[100%] max-w-sm bg-white z-50 transform transition-transform shadow-2xl overflow-y-auto">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between p-5 border-b">
                                <Link to="/" onClick={() => setShowSidebar(false)} className="flex items-center">
                                    <img src={ridanLogo} className="h-9" alt="Ridan Logo" />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setShowSidebar(false)}
                                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                                >
                                    <CloseIcon fontSize="medium" />
                                </button>
                            </div>

                            <div className="p-5 border-b">
                                {userInfo ? (
                                    <Link
                                        to="/dashboard"
                                        className="flex justify-between items-center rounded-xl hover:bg-gray-50 transition-colors"
                                        onClick={() => setShowSidebar(false)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center bg-gray-800 justify-center text-white">
                                                <FaUser size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{userInfo.name}</div>
                                                <div className="text-xs text-orange-400">Account Dashboard</div>
                                            </div>
                                        </div>
                                        <ChevronRightIcon className='text-primary-500' />
                                    </Link>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="flex items-center space-x-3 rounded-xl hover:bg-gray-50"
                                        onClick={() => setShowSidebar(false)}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center bg-black justify-center text-white">
                                            <FaUser size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">Login / Register</div>
                                            <div className="text-xs text-gray-500">Access your account</div>
                                        </div>
                                    </Link>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 p-2 mb-2">
                                <Link to="/track-order" className="bg-gray-50 rounded-xl p-2 hover:bg-primary-50 transition-colors flex flex-col items-center text-center">
                                    <LocationIcon className='text-primary-500 text-xl mb-2' />
                                    <span className="font-medium text-sm text-gray-900">Track Orders</span>
                                    <span className="text-xs text-gray-500 mt-1">View order status</span>
                                </Link>

                                <Link to="/become-seller" className="bg-gray-50 rounded-xl p-2 hover:bg-primary-50 transition-colors flex flex-col items-center text-center">
                                    <StorefrontIcon className='text-primary-500 text-3xl mb-2' />
                                    <span className="font-medium text-gray-900">Sell on Ridan</span>
                                    <span className="text-xs text-gray-500 mt-1">Start selling today</span>
                                </Link>

                                <Link to="/help" className="bg-gray-50 rounded-xl p-2 hover:bg-primary-50 transition-colors flex flex-col items-center text-center">
                                    <HelpOutlineIcon className='text-primary-500 text-xl mb-2' />
                                    <span className="font-medium text-sm text-gray-900">Help Center</span>
                                    <span className="text-xs text-gray-500 mt-1">24/7 customer support</span>
                                </Link>

                                <Link to="/logout" className="bg-gray-50 rounded-xl p-2 hover:bg-primary-50 transition-colors flex flex-col items-center text-center">
                                    <LogoutIcon className='text-primary-500 text-xl mb-2' />
                                    <span className="font-medium text-sm text-gray-900">Sign Out</span>
                                    <span className="text-xs text-gray-500 mt-1">Secure account</span>
                                </Link>
                            </div>

                            <div className="flex-1 px-5 pb-5">
                                <h3 className="font-bold text-lg text-orange-500 mb-3 flex items-center">
                                    Shop Categories
                                </h3>
                                <ul>
                                    {categorys.map((c, i) => (
                                        <li key={i} className="mb-2">
                                            <Link
                                                to={`/products?category=${c.name}`}
                                                onClick={() => setShowSidebar(false)}
                                            >
                                                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                                    <div className='flex items-center space-x-3'>
                                                        <img
                                                            src={c.image}
                                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                            alt={c.name}
                                                            loading="lazy"
                                                        />
                                                        <span className="text-gray-800">{c.name}</span>
                                                    </div>
                                                    <ChevronRightIcon className='text-gray-400' />
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-5">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <Link to="/about" className="text-gray-700 hover:text-primary-600 transition-colors text-center p-2">
                                        About Us
                                    </Link>
                                    <Link to="/contact" className="text-gray-700 hover:text-primary-600 transition-colors text-center p-2">
                                        Contact
                                    </Link>
                                    <Link to="/terms" className="text-gray-700 hover:text-primary-600 transition-colors text-center p-2">
                                        Terms
                                    </Link>
                                    <Link to="/privacy" className="text-gray-700 hover:text-primary-600 transition-colors text-center p-2">
                                        Privacy
                                    </Link>
                                </div>
                                <div className="flex justify-center space-x-5 pt-3 border-t border-gray-200">
                                    <a href="#" className="p-2 text-gray-500 hover:text-primary-600"><FaFacebookF size={18} /></a>
                                    <a href="#" className="p-2 text-gray-500 hover:text-primary-600"><AiOutlineTwitter size={18} /></a>
                                    <a href="#" className="p-2 text-gray-500 hover:text-primary-600"><FaLinkedinIn size={18} /></a>
                                </div>
                                <div className="mt-4 text-center text-xs text-gray-500">
                                    © {new Date().getFullYear()} Ridan. All rights reserved.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Headers;
