import React, { useEffect, useState } from "react";
import Headers from "../components/Headers";
import { Link, useParams, useNavigate } from "react-router-dom";
import Carousel from "react-multi-carousel";
import { Breadcrumb } from "flowbite-react";
import { HiHome } from "react-icons/hi";
import "react-multi-carousel/lib/styles.css";
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/css/navigation';
import "swiper/css";
import { useDispatch, useSelector } from "react-redux";
import "swiper/css/pagination";
import { Pagination, Navigation } from 'swiper/modules';
import Ratings from "../components/Ratings";
import Reviews from "../components/Reviews";
import { get_product } from "../store/reducers/homeReducer";
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ShoppingCartCheckout from '@mui/icons-material/ShoppingCartCheckout';
import { FormControl, InputLabel, Select, MenuItem, Box, CircularProgress } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { AiFillHeart, AiOutlineShoppingCart } from 'react-icons/ai'
import { get_card_products } from '../store/reducers/cardReducer';

import axios from 'axios';

import {
    add_to_card,
    messageClear,
    add_to_wishlist,
} from "../store/reducers/cardReducer";
import toast from "react-hot-toast";

const Details = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { card_product_count } = useSelector(state => state.card);
    const { price, } = useSelector((state) => state.card);
    const navigate = useNavigate();
    const { slug, id } = useParams();
    const dispatch = useDispatch();
    const { product, relatedProducts, moreProducts, loading: productLoading } = useSelector(
        (state) => state.home
    );
    const [openModal, setOpenModal] = useState(true);
    const { userInfo } = useSelector((state) => state.auth);
    const { errorMessage, successMessage } = useSelector((state) => state.card);
    const [nameLimit, setNameLimit] = useState(null);

    const [states, setStates] = useState([]);
    const [towns, setTowns] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedTown, setSelectedTown] = useState('');
    const [loadingTowns, setLoadingTowns] = useState(false);
    const [scrollPos, setScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        if (productLoading) {
            setLoading(true);
        } else {
            const timer = setTimeout(() => {
                setLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [productLoading]);

    useEffect(() => {
        if (userInfo?.id) {
            dispatch(get_card_products(userInfo.id));
        }
    }, [dispatch, userInfo]);

    const handleCategoryClick = () => {
        navigate(`/products?category=${product?.category}`);
    };

    // Fetch states on mount
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await axios.get(`/api/states`);
                if (response.data && response.data.states) {
                    setStates(response.data.states);
                } else {
                    setStates(['']);
                }
            } catch (error) {
                console.error("Error fetching states:", error);
                setStates([]);
            }
        };
        fetchStates();
    }, []);

    // Fetch towns when a state is selected
    const handleStateChange = async (event) => {
        const state = event.target.value;
        setSelectedState(state);
        setSelectedTown('');
        setLoadingTowns(true);

        try {
            const response = await axios.get(`https://nga-states-lga.onrender.com/fetch?state=${encodeURIComponent(state)}`);
            if (response.data && response.data.towns) {
                setTowns(response.data.towns);
            } else {
                setTowns([]);
            }
        } catch (error) {
            console.error("Error fetching towns:", error);
            setTowns([]);
        } finally {
            setLoadingTowns(false);
        }
    };

    const handleTownChange = (event) => {
        setSelectedTown(event.target.value);
    };

    const [image, setImage] = useState("");
    const [state, setState] = useState("reviews");
    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 5,
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 5,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 5,
        },
        mdtablet: {
            breakpoint: { max: 991, min: 464 },
            items: 5,
        },
        mobile: {
            breakpoint: { max: 768, min: 0 },
            items: 5,
        },
        smmobile: {
            breakpoint: { max: 640, min: 0 },
            items: 4,
        },
        xsmobile: {
            breakpoint: { max: 440, min: 0 },
            items: 4,
        },
    };

    const [quantity, setQuantity] = useState(1);

    const inc = () => {
        if (quantity >= product?.stock) {
            toast.error("Out of stock");
        } else {
            setQuantity(quantity + 1);
        }
    };

    const dec = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const add_card = () => {
        if (userInfo) {
            dispatch(
                add_to_card({
                    userId: userInfo.id,
                    quantity,
                    productId: product._id,
                    sellerId: product.sellerId,
                })
            ).then(() => {
                dispatch(get_card_products(userInfo.id));
            });
        } else {
            navigate("/login");
        }
    };

    useEffect(() => {
        if (userInfo?.id) {
            dispatch(get_card_products(userInfo.id));
        }
    }, [dispatch, userInfo, successMessage]);

    const add_wishlist = () => {
        if (userInfo) {
            dispatch(
                add_to_wishlist({
                    userId: userInfo.id,
                    sellerId: product.sellerId,
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    whatsapp: product.whatsapp,
                    location: product.location,
                    image: product.images[0],
                    discount: product.discount,
                    rating: product.rating,
                    slug: product.slug,
                })
            );
        } else {
            navigate("/login");
        }
    };

    useEffect(() => {
        if (slug || id) {
            dispatch(get_product(slug || id));
        }
    }, [dispatch, slug, id]);

    useEffect(() => {
        if (product) {
            setImage(product.images?.[0] || "");
        }
    }, [product]);

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
    }, [dispatch, errorMessage, successMessage]);

    const buy = () => {
        let price = 0;
        if (product.discount !== 0) {
            price =
                product.price - Math.floor((product.price * product.discount) / 100);
        } else {
            price = product.price;
        }
        const obj = [
            {
                sellerId: product.sellerId,
                shopName: product.shopName,
                shopImage: product.shopImage,
                price: quantity * (price - Math.floor((price * 5) / 100)),
                products: [
                    {
                        quantity,
                        productInfo: product,
                    },
                ],
            },
        ];
        navigate("/shipping", {
            state: {
                products: obj,
                price: price * quantity,
                shipping_fee: 85,
                items: 1,
            },
        });
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setNameLimit(16);
            } else {
                setNameLimit(null);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const redirect_card_page = () => {
        userInfo ? navigate(`/card`) : navigate(`/login`)
    }

    const productName = product?.name || "";

    // Function to generate product URL
    const generateProductUrl = (product) => {
        const baseDomain = "http://localhost:3000";
        const productCategory = encodeURIComponent(product.category);
        const productName = encodeURIComponent(product.name);
        const productId = product._id;

        const baseUrl = `${baseDomain}/${productCategory}/${productName}-${productId}.html`;

        const page = 1;
        const pos = 1;
        const adsPerPage = 23;
        const adsCount = 56742;
        const lid = "sampleListingId";
        const indexPosition = product.indexPosition || 1;

        const fullUrl = `${baseUrl}?page=${page}&pos=${pos}&ads_per_page=${adsPerPage}&ads_count=${adsCount}&lid=${lid}&indexPosition=${indexPosition}`;

        return fullUrl;
    };

    const openWhatsApp = () => {
        if (!product) return;

        const phoneNumber = `+234${product.whatsapp}`;
        const productName = product.name;
        const productPrice = product.price;
        const productLink = generateProductUrl(product);

        const message = encodeURIComponent(
            `Hello! I got your contact from *Ridan Express* and I want to order the following product:\n\n` +
            `*Product Name:* ${productName}\n` +
            `*Product Price:* ₦${productPrice.toLocaleString()}\n` +
            `*Product Link:* ${productLink}`
        );

        const appUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
        const webUrl = `https://wa.me/${phoneNumber}?text=${message}`;

        const isAppOpened = window.open(appUrl, "_blank");
        if (!isAppOpened) {
            window.open(webUrl, "_blank");
        }
    };

    // Skeleton Loader Component
    const SkeletonLoader = ({ className }) => (
        <div className={`animate-pulse bg-gray-200 rounded-md ${className}`}></div>
    );

    // Main Skeleton Screen
    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <Headers />
                <div className="mt-[4rem] lg:mt-[8rem]">
                    {/* Breadcrumb Skeleton */}
                    <div className="py-2 bg-gray-800">
                        <div className="w-[85%] mx-auto">
                            <SkeletonLoader className="h-4 w-1/3" />
                        </div>
                    </div>

                    <div className="w-full mx-auto px-4 lg:px-8 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Image Gallery Skeleton */}
                            <div className="w-full bg-white rounded-lg p-4">
                                <SkeletonLoader className="w-full h-[300px] lg:h-[400px]" />
                                <div className="mt-4">
                                    <div className="flex space-x-2">
                                        {[1, 2, 3, 4].map((_, i) => (
                                            <SkeletonLoader key={i} className="w-16 h-16" />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Product Info Skeleton */}
                            <div className="flex flex-col gap-6 bg-white p-6 rounded-xl">
                                <SkeletonLoader className="h-8 w-3/4" />
                                <SkeletonLoader className="h-4 w-1/3" />
                                <SkeletonLoader className="h-6 w-1/4" />
                                <SkeletonLoader className="h-12 w-full" />
                                <SkeletonLoader className="h-12 w-full" />
                                <SkeletonLoader className="h-12 w-full" />
                                <SkeletonLoader className="h-32 w-full" />
                                <SkeletonLoader className="h-12 w-full" />
                            </div>

                            {/* Seller Info Skeleton */}
                            <div className="space-y-6">
                                <div className="bg-white p-4 rounded-md">
                                    <SkeletonLoader className="h-6 w-1/2 mb-4" />
                                    <div className="space-y-3">
                                        {[1, 2].map((_, i) => (
                                            <div key={i} className="flex gap-2">
                                                <SkeletonLoader className="w-12 h-12 rounded-full" />
                                                <div className="flex-1 space-y-2">
                                                    <SkeletonLoader className="h-4 w-3/4" />
                                                    <SkeletonLoader className="h-3 w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-6">
                                    <SkeletonLoader className="h-6 w-1/3 mb-4" />
                                    <div className="flex items-start gap-4">
                                        <SkeletonLoader className="w-16 h-16 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <SkeletonLoader className="h-5 w-1/2" />
                                            <SkeletonLoader className="h-4 w-1/3" />
                                        </div>
                                    </div>
                                    <SkeletonLoader className="h-10 w-full mt-4" />
                                </div>
                            </div>
                        </div>

                        {/* Tabs Skeleton */}
                        <div className="bg-white rounded-xl mt-6 p-6">
                            <div className="flex gap-4 mb-4">
                                <SkeletonLoader className="h-10 w-24" />
                                <SkeletonLoader className="h-10 w-24" />
                            </div>
                            <SkeletonLoader className="h-48 w-full" />
                        </div>

                        {/* Related Products Skeleton */}
                        <div className="bg-white p-3 mt-6">
                            <div className="flex justify-between mb-4">
                                <SkeletonLoader className="h-6 w-1/4" />
                                <SkeletonLoader className="h-6 w-16" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <SkeletonLoader className="h-48 w-full" />
                                        <SkeletonLoader className="h-4 w-3/4" />
                                        <SkeletonLoader className="h-4 w-1/2" />
                                        <SkeletonLoader className="h-4 w-1/3" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 overflow-x-hidden">
            <Headers />
            <div className="py-2 mb-0 bg-black lg:mb-3 mt-[4rem] lg:mt-[10rem] md:mb-0">
                <div className="w-[85%] xl:w-[90%] lg:w-[95%] md:w-full mx-auto">
                    <Breadcrumb aria-label="breadcrumb" className="px-0 md:px-7 lg:px-5 dark:bg-transparent">
                        <Link to="/">
                            <Breadcrumb.Item>
                                <HiHome className="text-white mr-1 text-lg" /> <span className="text-white">Home</span>
                            </Breadcrumb.Item>
                        </Link>
                        <Breadcrumb.Item
                            onClick={() => handleCategoryClick(product?.category)}
                        ><span className="text-white">{product?.category || "Unknown Category"}</span></Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <span className="text-white font-medium">
                                {nameLimit && productName.length > nameLimit
                                    ? `${productName.substring(0, nameLimit)}...`
                                    : productName}
                            </span>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>

            <section className="w-[100%] xl:w-[90%] lg:w-[100%] md:w-full mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {/* Left Column - Product Images */}
                    <div className="bg-white rounded-xl shadow-sm p-3 lg:p-0 lg:my-8">
                        {/* Desktop Gallery - Side by side layout */}
                        <div className="hidden lg:flex gap-4">
                            {/* Thumbnails Column */}
                            <div className="flex flex-col gap-3 w-[80px]">
                                {product?.images?.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setImage(img)}
                                        className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${image === img ? 'border-orange-500 shadow-md' : 'border-transparent hover:border-orange-300'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Main Image */}
                            <div className="flex-1">
                                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={image || product?.images?.[0]}
                                        alt={product?.name || "Product image"}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mobile Gallery - Stacked layout */}
                        <div className="lg:hidden">
                            <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-4 bg-gray-100">
                                <img
                                    src={image || product?.images?.[0]}
                                    alt={product?.name || "Product image"}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {product?.images?.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setImage(img)}
                                        className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${image === img ? 'border-orange-500 shadow-md' : 'border-transparent hover:border-orange-300'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-orange-50 hidden lg:block rounded-lg border border-orange-100">
                            <div className="flex items-start gap-3">
                                <SupportAgentIcon className="text-orange-600 mt-1" />
                                <div>
                                    <h4 className="font-medium text-gray-900">Ridan Support</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Have any questions? Our We are always happy to help.
                                    </p>
                                    <a href="tel:07006000000" className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-2 inline-block">
                                        0700 600 0000
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Middle Column - Product Details */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        {product?.name}
                                    </h1>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Ratings ratings={product?.rating} />
                                        <span className="text-sm text-gray-500">({product?.totalReviews} reviews)</span>
                                    </div>
                                </div>
                                <button
                                    onClick={add_wishlist}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <FavoriteBorder />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-2xl font-bold text-gray-900">
                                    ₦ {product && (product.price - (product.price * product.discount) / 100).toLocaleString()}
                                </span>
                                {product?.discount > 0 && (
                                    <span className="px-2 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
                                        {product.discount}% OFF
                                    </span>
                                )}
                                {product?.discount > 0 && (
                                    <span className="text-gray-500 line-through">
                                        ₦{product.price.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700">
                                    {product?.shortDescription || "No description available"}
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center border border-gray-200 rounded-full">
                                        <button
                                            onClick={dec}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-l-full"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 w-16 text-center">{quantity}</span>
                                        <button
                                            onClick={inc}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-r-full"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className={`text-sm font-medium ${product?.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {product?.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={buy}
                                        disabled={!product?.stock}
                                        className="col-span-2 bg-gray-800 hover:from-orange-700 hover:to-red-700 text-white py-3 rounded-2xl font-medium transition-all disabled:opacity-50 shadow-md"
                                    >
                                        Buy Now
                                    </button>
                                    <button
                                        onClick={add_card}
                                        disabled={!product?.stock}
                                        className="flex items-center justify-center gap-2 border border-orange-500 text-orange-600 py-2.5 rounded-lg hover:bg-orange-50 transition-colors"
                                    >
                                        <ShoppingCartCheckout /> Add to Cart
                                    </button>
                                    <button
                                        onClick={add_wishlist}
                                        className="flex items-center justify-center gap-2 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <FavoriteBorder /> Wishlist
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Options</h3>
                            <div className="space-y-4">
                                <FormControl fullWidth size="small">
                                    <InputLabel>State</InputLabel>
                                    <Select
                                        value={selectedState}
                                        onChange={handleStateChange}
                                        label="State"
                                    >
                                        {states.map((state) => (
                                            <MenuItem key={state} value={state}>{state}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small" disabled={!selectedState}>
                                    <InputLabel>City/Town</InputLabel>
                                    <Select
                                        value={selectedTown}
                                        onChange={handleTownChange}
                                        label="City/Town"
                                    >
                                        {loadingTowns ? (
                                            <MenuItem><CircularProgress size={20} /></MenuItem>
                                        ) : towns.length > 0 ? (
                                            towns.map((town) => (
                                                <MenuItem key={town} value={town}>{town}</MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No towns available</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </div>

                            <div className="mt-6 p-4 bg-orange-50 rounded-lg block lg:hidden border border-orange-100">
                                <div className="flex items-start gap-3">
                                    <SupportAgentIcon className="text-orange-600 mt-1" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">Customer Support</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Have questions about this product? Our support team is here to help.
                                        </p>
                                        <a href="tel:07006000000" className="text-orange-600 hover:text-orange-700 text-sm font-medium mt-2 inline-block">
                                            0700 600 0000
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Seller Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-semibold text-gray-900">Seller Information</h2>
                                <Link
                                    to={`/seller/${product?.sellerId}`}
                                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    View Store
                                </Link>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-700 to-red-600 flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">
                                        {product?.shopName?.charAt(0).toUpperCase() || 'S'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{product?.shopName}</h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Ratings ratings={4.5} size="16px" />
                                        <span className="text-xs text-gray-500">(128 reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link
                                    to={`/dashboard/chat/${product?.sellerId}`}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-2xl hover:from-orange-700 hover:to-red-700 transition-all shadow-md"
                                >
                                    <SupportAgentIcon fontSize="small" />
                                    Ask Question
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        <LocalShippingOutlinedIcon className="text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Standard Delivery</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Estimated delivery: 3-5 business days
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Delivery fee: <span className="font-medium">₦850</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        <LocalShippingOutlinedIcon className="text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Express Delivery</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Estimated delivery: 1-2 business days
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Delivery fee: <span className="font-medium">₦1,200</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Details Tabs */}
            <section className="w-[99%] xl:w-[90%] lg:w-[95%] md:w-full mx-auto py-2">
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="border-b border-gray-100">
                        <div className="flex flex-wrap">
                            <button
                                onClick={() => setState("description")}
                                className={`px-6 py-4 font-medium ${state === 'description'
                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                    : 'text-gray-500 hover:text-orange-500'
                                    }`}
                            >
                                Description
                            </button>
                            <button
                                onClick={() => setState("reviews")}
                                className={`px-6 py-4 font-medium ${state === 'reviews'
                                    ? 'text-orange-600 border-b-2 border-orange-600'
                                    : 'text-gray-500 hover:text-orange-500'
                                    }`}
                            >
                                Reviews ({product?.totalReviews || 0})
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {state === "description" ? (
                            <div className="prose max-w-none text-gray-700">
                                {product?.description || "No description available"}
                            </div>
                        ) : (
                            <Reviews product={product} />
                        )}
                    </div>
                </div>
            </section>

            {/* Related Products */}
            <section className="w-[99%] xl:w-[90%] lg:w-[95%] md:w-full mx-auto py-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Related Products</h2>
                        <Link
                            to="/products"
                            className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                        >
                            View All
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {relatedProducts.map((p, i) => (
                            <div key={i} className="group">
                                <Link
                                    to={`/product/details/${p.slug}`}
                                    className="block"
                                >
                                    <div className="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden relative h-full flex flex-col">
                                        <div className="relative flex-1">
                                            {p.discount > 0 && (
                                                <div className="absolute left-2 top-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                                                    {p.discount}% OFF
                                                </div>
                                            )}
                                            <div className="aspect-square overflow-hidden">
                                                <img
                                                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                                                    src={p.images[0]}
                                                    alt={p.name}
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-3 flex flex-col gap-1">
                                            <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                                                {p.name}
                                            </h3>

                                            <div className="flex items-center gap-1 mt-1">
                                                <Ratings ratings={p.rating} iconSize="12px" />
                                                <span className="text-xs text-gray-500">({p.totalReviews})</span>
                                            </div>

                                            <div className="mt-2">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    ₦{(p.price - (p.price * p.discount) / 100).toLocaleString()}
                                                </span>
                                                {p.discount > 0 && (
                                                    <div className="text-xs text-gray-500 line-through">
                                                        ₦{p.price.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mobile Sticky Cart */}
            <div className="block lg:hidden">
                <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="h-16 flex items-center mx-4 mb-4 bg-white rounded-xl shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between w-full px-4">
                            <div>
                                <div className="text-xs text-gray-500">Total</div>
                                <div className="font-bold text-gray-900">₦ {price.toLocaleString()}</div>
                            </div>
                            <button
                                onClick={redirect_card_page}
                                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-colors shadow-md"
                            >
                                <AiOutlineShoppingCart className="text-lg" />
                                <span>View Cart</span>
                                {card_product_count > 0 && (
                                    <span className="bg-white text-orange-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                        {card_product_count}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Details;