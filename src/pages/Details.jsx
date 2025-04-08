import React, { useEffect, useState } from "react";
import Headers from "../components/Headers";
import { Link, useParams, useNavigate } from "react-router-dom";
import Carousel from "react-multi-carousel";
import { Breadcrumb, HR } from "flowbite-react";
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
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
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
    const { slug } = useParams();
    const dispatch = useDispatch();
    const { product, relatedProducts, moreProducts } = useSelector(
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
        if (userInfo?.id) {
            dispatch(get_card_products(userInfo.id));
        }
    }, [dispatch, userInfo]);

    // Fetch states on mount
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await axios.get(`/api/states`);
                console.log("API response:", response);
                if (response.data && response.data.states) {
                    setStates(response.data.states);
                } else {
                    setStates(['']); // Set an empty array if no states are returned
                }
            } catch (error) {
                console.error("Error fetching states:", error);
                setStates([]); // Set an empty array if there's an error
            }
        };
        fetchStates();
    }, []);

    // Fetch towns when a state is selected
    const handleStateChange = async (event) => {
        const state = event.target.value;
        setSelectedState(state);
        setSelectedTown(''); // Reset town when a new state is selected
        setLoadingTowns(true);

        try {
            // Ensure API request includes the selected state
            const response = await axios.get(`https://nga-states-lga.onrender.com/fetch?state=${encodeURIComponent(state)}`);

            if (response.data && response.data.towns) {
                setTowns(response.data.towns);
            } else {
                setTowns([]); // Set empty array if no towns found
            }
        } catch (error) {
            console.error("Error fetching towns:", error);
            setTowns([]); // Handle error by setting an empty array
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
        if (quantity >= product.stock) {
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
                // Refresh cart data after adding item
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
    }, [dispatch, userInfo, successMessage]); // Add successMessage as dependency

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
        dispatch(get_product(slug));
    }, [dispatch, slug]);
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
        const baseDomain = "http://localhost:3000"; // Replace with your actual domain
        const productCategory = encodeURIComponent(product.category);
        const productName = encodeURIComponent(product.name);
        const productId = product._id;

        // Base URL
        const baseUrl = `${baseDomain}/${productCategory}/${productName}-${productId}.html`;

        // Query parameters
        const page = 1;
        const pos = 1;
        const adsPerPage = 23;
        const adsCount = 56742;
        const lid = "sampleListingId";
        const indexPosition = product.indexPosition || 1;

        // Construct the full URL with query parameters
        const fullUrl = `${baseUrl}?page=${page}&pos=${pos}&ads_per_page=${adsPerPage}&ads_count=${adsCount}&lid=${lid}&indexPosition=${indexPosition}`;

        return fullUrl;
    };

    const openWhatsApp = () => {
        const phoneNumber = `+234${product.whatsapp}`;
        const productName = product.name;
        const productPrice = product.price;
        const productLink = generateProductUrl(product); // Generate product URL

        const message = encodeURIComponent(
            `Hello! I got your contact from *Ridan Express* and I want to order the following product:\n\n` +
            `*Product Name:* ${productName}\n` +
            `*Product Name:* ${productPrice}\n` +
            `*Product Link:* ${productLink}`
        );

        // URL to open in WhatsApp app
        const appUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;

        const webUrl = `https://wa.me/${phoneNumber}?text=${message}`;

        const isAppOpened = window.open(appUrl, "_blank");

        if (!isAppOpened) {
            window.open(webUrl, "_blank");
        }
    };

    return (
        <div className="bg-gray-100 overflow-x-hidden <div className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>">
            <Headers />
            <div className=" py-2 mb-0 bg-gray-800 lg:mb-3 mt-[4rem] lg:mt-[8rem] md:mb-0">
                <div className="w-[85%] xl:w-[90%] lg:w-[95%] md:w-full mx-auto">
                    <Breadcrumb aria-label="breadcrumb" className="px-0 md:px-7 lg:px-5 dark:bg-gray-800">
                        <Breadcrumb.Item href="/">
                            <HiHome className="text-white mr-1 text-lg" /> <span className="text-white">Home</span>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item href="#"><span className="text-white">{product?.category || "Unknown Category"}</span></Breadcrumb.Item>
                        <Breadcrumb.Item>
                            {/* Only truncate on mobile screens */}
                            <span className="text-white">
                                {nameLimit && productName.length > nameLimit
                                    ? `${productName.substring(0, nameLimit)}...`
                                    : productName}
                            </span>
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>
            <section>
                <div className="w-full mx-auto md:mx-0 pb-8 md:pb-1">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 lg:gap-2 px-0 lg:px-[6rem]">

                        <div className="w-full bg-white rounded-lg mb-1">
                            {/* Desktop Main Image */}
                            <div className="hidden lg:block bg-white p-4 mx-auto max-w-4xl">
                                <img
                                    className="rounded-xl w-full h-[400px] object-contain shadow-sm"
                                    src={image || product?.images?.[0]}
                                    alt={product?.name || "Product image"}
                                />
                            </div>

                            <div className="lg:hidden relative mx-auto max-w-3xl">
                                <Swiper
                                    modules={[Navigation, Pagination]}
                                    navigation={{
                                        nextEl: '.swiper-button-next',
                                        prevEl: '.swiper-button-prev',
                                    }}
                                    pagination={{ clickable: true }}
                                    spaceBetween={5}  // Reduced from 20
                                    slidesPerView={1}
                                    breakpoints={{
                                        640: {
                                            slidesPerView: 1.3,  // More compact view on tablets
                                            spaceBetween: 5
                                        },
                                        768: {
                                            slidesPerView: 1.5,
                                            spaceBetween: 15
                                        }
                                    }}
                                    className="h-[300px]"  // Reduced from 400px
                                >
                                    {product?.images?.map((img, index) => (
                                        <SwiperSlide key={index} className="!flex items-center justify-center">
                                            <div className="h-full w-full p-2">
                                                <img
                                                    src={img}
                                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                                    alt={`Product ${index}`}
                                                />
                                            </div>
                                        </SwiperSlide>
                                    ))}

                                    {/* Smaller Navigation Arrows */}
                                    <div className="swiper-button-prev left-1 !w-8 !h-8 after:!text-[16px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
                                            <path stroke="currentColor" color="black" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </div>
                                    <div className="swiper-button-next right-1 !w-8 !h-8 after:!text-[16px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
                                            <path stroke="currentColor" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Swiper>
                            </div>

                            {/* Desktop Thumbnails */}
                            {product?.images && product.images.length > 0 && (
                                <Carousel
                                    responsive={responsive}
                                    className="thumbnail-carousel"
                                    itemClass="px-1"
                                >
                                    {(product.images || []).map((img, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setImage(img)}
                                            className={`cursor-pointer  hidden lg:block border-2 ${image === img ? 'border-orange-500' : 'border-transparent'
                                                } rounded-md p-0.5`}
                                        >
                                            <img
                                                className="w-full h-20 object-cover rounded-md"
                                                src={img}
                                                alt={`Product thumbnail ${i + 1}`}
                                            />
                                        </div>
                                    ))}
                                </Carousel>
                            )}
                            {/* Social Sharing */}
                            <div className="bg-white hidden lg:block p-5 mt-1 lg:mt-[3.8rem] rounded-lg">
                                <hr className="my-3" />
                                <p className="text-sm font-medium text-gray-700 mb-3">Share this product</p>
                                <div className="flex gap-4">
                                    <button className="text-orange-500 hover:text-orange-600 transition-colors">
                                        <XIcon className="w-6 h-6" />
                                    </button>
                                    <button className="text-orange-500 hover:text-orange-600 transition-colors">
                                        <FacebookIcon className="w-6 h-6" />
                                    </button>
                                    <button className="text-orange-500 hover:text-orange-600 transition-colors">
                                        <WhatsAppIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>


                        <div className="flex flex-col gap-4 lg:gap-6 h-fit bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex flex-col gap-5">
                                <h1 className="text-3xl lg:text-3xl font-base lg:font-medium text-gray-900 tracking-tight">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-1.5 text-lg">
                                    <span className="text-gray-600">Brand:</span>
                                    <span className="font-medium text-orange-500 hover:text-orange-600 transition-colors">
                                        {product.brand}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Ratings ratings={product.rating} />
                                    <span className="text-sm font-medium text-gray-500">
                                        ({product.reviewCount} reviews)
                                    </span>
                                </div>

                                <div className="mt-2 space-y-2">
                                    {product.discount !== 0 ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex text-center items-center gap-4">
                                                <span className="text-xl md:text-2xl lg:text-3xl font-base text-[#191919]">
                                                    ₦ {(product.price - Math.floor((product.price * product.discount) / 100)).toLocaleString()}
                                                </span>
                                                <span className=" block lg:hidden px-2 py-1 border border-gray-900 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                                    {product.discount}% OFF
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className=" hidden lg:block px-3 py-1.5 text-sm font-bold rounded-full bg-green-100 text-green-700">
                                                    {product.discount}% OFF
                                                </span>
                                                <span className="text-sm font-medium text-green-600">
                                                    Save ₦ {Math.floor((product.price * product.discount) / 100).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-900">
                                            ₦ {(product.price).toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                                    <span className="text-gray-800">+ shipping fee :</span>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                                        <span className="text-gray-900">₦1,400 to DHL Park</span>
                                    </div>
                                    <a href="details"><span className="text-blue-800 text-xs underlined">See Detailes</span>
                                    </a>
                                </div>
                                {/* <p className="text-sm">See options</p> */}

                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">Product :</span>
                                    {product.stock > 0 ? (
                                        <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                                            {product.stock} in stock
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-medium">
                                            Out of stock
                                        </span>
                                    )}
                                </div>

                                <div className="flex  gap-4 mt-4">
                                    {/* Quantity Selector */}
                                    <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300">
                                        <button
                                            onClick={dec}
                                            className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-l-lg"
                                        >
                                            <span className="text-2xl font-light">−</span>
                                        </button>

                                        <span className="w-20 text-center text-xl font-medium text-gray-900 border-x border-gray-200">
                                            {quantity}
                                        </span>

                                        <button
                                            onClick={inc}
                                            className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-r-lg"
                                        >
                                            <span className="text-2xl font-light">+</span>
                                        </button>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={add_card}
                                            className="p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
                                        >
                                            <ShoppingCartCheckoutIcon className="w-6 h-6 text-gray-700 group-hover:text-green-600 transition-colors" />
                                        </button>

                                        <button
                                            onClick={add_wishlist}
                                            className="p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-200 group"
                                        >
                                            <FavoriteBorderIcon className="w-6 h-6 text-gray-700 group-hover:text-red-600 transition-colors" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex w-[100%] gap-3 mt-1 lg:mt-4">
                                    {product.stock > 0 && (
                                        <button
                                            onClick={buy}
                                            className="px-6 w-[100%] py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-sm hover:shadow-md"
                                        >
                                            Buy Now
                                        </button>
                                    )}
                                    <Link
                                        to={`/dashboard/chat/${product.sellerId}`}
                                        className="px-6 w-[100%] py-4 rounded-xl border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold text-center transition-colors"
                                    >
                                        Chat Seller
                                    </Link>
                                </div>

                                <div className="mt-6 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                                        <SupportAgentIcon className="w-8 h-8 text-green-600 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-[#191919]">Customer Support</p>
                                            <a href="tel:07006000000" className="text-green-600 hover:text-blue-700 text-sm font-medium">
                                                0700 600 0000
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div id="details" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 w-[400px] md:w-full h-[100%]">
                            <div className="bg-white p-5 rounded-md mb-1">
                                <h2 className="text-sm font-semibold text-[#191919]"> DELIVERY POLICY </h2>
                                <hr className="my-4" />
                                <p className="text-[#191919] mr-10 text-sm">
                                    Fast and secure delivery regaurdless of your state and location 🚀
                                    {/* <a className="text-sm text-orange-400 hover:cursor-pointer" onClick={() => setOpenModal(true)}>Details</a> */}
                                </p>
                                {/* <Modal className="md:mt-20" show={openModal} onClose={() => setOpenModal(false)}>
                                    <Modal.Header>Terms of Service</Modal.Header>
                                    <Modal.Body>
                                        <div className="space-y-6 ">
                                            <h2 className="font-bold flex item-center text-gray-500">NOTE <WarningAmberOutlinedIcon /></h2>
                                            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                                With less than a month to go before the European Union enacts new consumer privacy laws for its citizens,
                                                companies around the world are updating their terms of service agreements to comply.
                                            </p>
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button onClick={() => setOpenModal(false)}>I Understand</Button>
                                    </Modal.Footer>
                                </Modal> */}
                                <h2 className="text-sm font-light md:font-semibold text-[#191919]">Choose Your Location</h2>
                                <br />

                                <Box display="flex" flexDirection="column" gap={2} width="300px">
                                    {/* State Dropdown */}
                                    <FormControl fullWidth>
                                        <InputLabel id="state-label">Choose State</InputLabel>
                                        <Select
                                            labelId="state-label"
                                            id="state"
                                            value={selectedState}
                                            label="Choose State"
                                            onChange={handleStateChange}
                                        >
                                            {states.length > 0 ? (
                                                states.map((state) => (
                                                    <MenuItem key={state} value={state}>
                                                        {state}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled>No states available</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>

                                    {/* Town Dropdown */}
                                    <FormControl fullWidth disabled={!selectedState}>
                                        <InputLabel id="town-label">Choose Town</InputLabel>
                                        <Select
                                            labelId="town-label"
                                            id="town"
                                            value={selectedTown}
                                            label="Choose Town"
                                            onChange={handleTownChange}
                                        >
                                            {loadingTowns ? (
                                                <MenuItem disabled>
                                                    <CircularProgress size={24} />
                                                </MenuItem>
                                            ) : towns.length > 0 ? (
                                                towns.map((town) => (
                                                    <MenuItem key={town} value={town}>
                                                        {town}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled>No towns available</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </div>

                            <div className="bg-white p-4 rounded-md">
                                <HR />
                                <h2 className="text-sm font-light md:font-semibold text-[#191919]">PICKUP DETAILS <a className="text-orange-400" href="#">Details</a></h2>
                                <br />
                                <ul>

                                    <div className="flex gap-2 mb-4">
                                        <div className="border boder-1 border-orange-200 rounded-full h-fit p-3">
                                            <LocalShippingOutlinedIcon className=" text-orange-400 " />
                                        </div>
                                        <div className="flex flex-col ">
                                            <li className="text-stone-600 flex item-center gap- mb-1 text-sm"> Delivery fee: <b>₦ 850</b></li>
                                            <li className="text-stone-600 text-sm">Arival will depend on the <b>seller</b>, Do well to message the <b>product seller</b>.
                                            </li>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-4">
                                        <div className="border boder-1 border-orange-200 rounded-full h-fit p-3">
                                            <LocalShippingOutlinedIcon className=" text-orange-400 " />
                                        </div>
                                        <div className="flex flex-col">
                                            <li className="text-stone-600 flex item-center gap- mb-1 text-sm"> Delivery fee: <b>₦ 850</b></li>
                                            <li className="text-stone-600 text-sm">Arival will depend on the <b>seller</b>, Do well to message the <b>product seller</b>.
                                            </li>
                                        </div>
                                    </div>

                                </ul>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <div>
                    {/* Tabs Section */}
                    <div className="bg-white rounded-xl shadow-sm mx-0 md:mx-0 lg:mx-[5.6rem]">
                        <div className="border-b border-gray-100">
                            <div className="flex flex-wrap gap-2 px-2 py-2 lg:px-4 py-1">
                                <button
                                    onClick={() => setState("description")}
                                    className={`px-4 py-3 md:px-6 md:py-4 rounded-lg md:rounded-t-lg transition-all duration-200 ${state === 'description'
                                        ? 'bg-orange-50 text-orange-600 font-semibold border-b-2 md:border-b-4 border-orange-500 shadow-inner'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                        }`}
                                >
                                    📖 Description
                                </button>
                                <button
                                    onClick={() => setState("reviews")}
                                    className={`px-4 py-3 md:px-6 md:py-4 rounded-lg md:rounded-t-lg transition-all duration-200 ${state === 'reviews'
                                        ? 'bg-orange-50 text-orange-600 font-semibold border-b-2 md:border-b-4 border-orange-500 shadow-inner'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                        }`}
                                >
                                    ⭐Reviews
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="px-4 md:px-6 py-6">
                            {state === "description" ? (
                                <div className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed">
                                    {product.description}
                                </div>
                            ) : (
                                <Reviews product={product} />
                            )}
                        </div>
                    </div>

                    {/* Related Products Section */}
                    <section className="mx-0 mb-20 lg:mb-5 lg:mx-[5.6rem] mt-4 bg-white p-3">
                        <div className="flex border border-gray-200 bg-transparent lg:bg-gray-800 px-2 py-2 rounded-lg justify-between items-center mb-2 lg:mb-6">
                            <h2 className="text-xl text-black lg:text-white font-base">
                                Related products
                                <span className="hidden lg:block w-12 h-1.5 block lg:hidden bg-orange-500 mt-2 rounded-full" />
                            </h2>
                            <Link
                                to="/products"
                                className="text-orange-600 lg:text-white font-medium transition-colors flex items-center gap-2"
                            >
                                See All
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 py-2">
                            {relatedProducts.map((p, i) => (
                                <div key={i} className="group">
                                    <a
                                        href={`/product/details/${p.slug}`}
                                        // rel="noopener noreferrer"
                                        className="block"
                                    >
                                        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative h-full flex flex-col">
                                            {/* Product Image */}
                                            <div className="relative flex-1">
                                                {p.discount && (
                                                    <div className="absolute left-2 top-2 bg-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-bold z-10 shadow-sm">
                                                        {p.discount}% OFF
                                                    </div>
                                                )}
                                                <div className="aspect-square overflow-hidden">
                                                    <img
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        src={p.images[0]}
                                                        alt={p.name}
                                                        loading="lazy"
                                                    />
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            add_wishlist(p);
                                                        }}
                                                        className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-orange-500 hover:text-white transition-all"
                                                        aria-label="Add to wishlist"
                                                    >
                                                        <AiFillHeart className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            add_card(p._id);
                                                        }}
                                                        className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-orange-500 hover:text-white transition-all"
                                                        aria-label="Add to cart"
                                                    >
                                                        <AiOutlineShoppingCart className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div className="p-2 flex flex-col gap-1">
                                                <h2 className="text-xs font-semibold text-gray-800 line-clamp-2">
                                                    {p.name}
                                                </h2>

                                                <div className="flex items-center gap-1">
                                                    <Ratings ratings={p.rating} iconSize="12px" />
                                                    <span className="text-[10px] text-gray-500 ml-1">({p.totalReviews})</span>
                                                </div>

                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm font-semibold text-orange-600">
                                                        ₦{(p.price - (p.price * p.discount) / 100).toLocaleString()}
                                                    </span>
                                                    {p.discount > 0 && (
                                                        <del className="text-[10px] text-gray-400">
                                                            ₦{p.price.toLocaleString()}
                                                        </del>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </section>

            {/* Related Products Section */}
            {/* Mobile Sticky Add to Cart */}
            <div className="block lg:hidden">
                {/* Fixed positioning container */}
                <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="h-14 flex items-center mx-4 mb-4 bg-gray-900 rounded-full shadow-xl border border-gray-800">
                        <button
                            onClick={redirect_card_page}
                            className="w-full flex items-center justify-between px-2 text-white font-medium active:scale-95 transition-transform"
                        >
                            <span className="text-sm ml-1">Cart items</span>
                            <span className="flex items-center h-10 px-2 bg-orange-500 rounded-full gap-2 hover:bg-orange-600 transition-colors">
                                <span className="text-sm font-base">
                                    ₦ {price.toLocaleString()}
                                </span>
                                <div className="bg-white rounded-full h-7 w-7 flex justify-center items-center">
                                    <AiOutlineShoppingCart className="relative text-lg text-black" />
                                    {/* Cart count badge */}
                                    {card_product_count > 0 && (
                                        <span className="absolute top-1 right-7 border-2 border-white text-xs w-5 h-5 rounded-full flex items-center justify-center bg-orange-500 text-white">
                                            {card_product_count}
                                        </span>
                                    )}
                                </div>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Details;




// import React, { useEffect, useState } from "react";
// import Headers from "../components/Headers";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import Carousel from "react-multi-carousel";
// import { Breadcrumb, HR } from "flowbite-react";
// import { HiHome } from "react-icons/hi";
// import "react-multi-carousel/lib/styles.css";
// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import { useDispatch, useSelector } from "react-redux";
// import "swiper/css/pagination";
// import { Pagination } from "swiper";
// import Ratings from "../components/Ratings";
// import Reviews from "../components/Reviews";
// import { get_product } from "../store/reducers/homeReducer";
// import { Button, Modal } from "flowbite-react";
// import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
// import WhatsAppIcon from '@mui/icons-material/WhatsApp';
// import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
// import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
// import { FormControl, InputLabel, Select, MenuItem, Box, CircularProgress } from '@mui/material';
// import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
// import XIcon from '@mui/icons-material/X';
// import FacebookIcon from '@mui/icons-material/Facebook';
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// import SupportAgentIcon from '@mui/icons-material/SupportAgent';
// import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
// import axios from 'axios';
// import { add_to_card, messageClear, add_to_wishlist } from "../store/reducers/cardReducer";
// import toast from "react-hot-toast";

// const Details = () => {
//     const navigate = useNavigate();
//     const { slug } = useParams();
//     const dispatch = useDispatch();
//     const { product, relatedProducts, moreProducts } = useSelector(
//         (state) => state.home
//     );
//     const [openModal, setOpenModal] = useState(true);
//     const { userInfo } = useSelector((state) => state.auth);
//     const { errorMessage, successMessage } = useSelector((state) => state.card);
//     const [nameLimit, setNameLimit] = useState(null);

//     const [states, setStates] = useState([]);
//     const [towns, setTowns] = useState([]);
//     const [selectedState, setSelectedState] = useState('');
//     const [selectedTown, setSelectedTown] = useState('');
//     const [loadingTowns, setLoadingTowns] = useState(false);

//     // Fetch states on mount
//     useEffect(() => {
//         const fetchStates = async () => {
//             try {
//                 const response = await axios.get(`/api/states`);
//                 console.log("API response:", response);
//                 if (response.data && response.data.states) {
//                     setStates(response.data.states);
//                 } else {
//                     setStates(['']); // Set an empty array if no states are returned
//                 }
//             } catch (error) {
//                 console.error("Error fetching states:", error);
//                 setStates([]); // Set an empty array if there's an error
//             }
//         };
//         fetchStates();
//     }, []);

//     // Fetch towns when a state is selected
//     const handleStateChange = async (event) => {
//         const state = event.target.value;
//         setSelectedState(state);
//         setSelectedTown(''); // Reset town when a new state is selected
//         setLoadingTowns(true);

//         try {
//             // Replace `{state_code}` with `state`
//             const response = await axios.get(`/api/${state}/towns`);
//             if (response.data && response.data.towns) {
//                 setTowns(response.data.towns);
//             } else {
//                 setTowns([]); // Set an empty array if no towns are returned
//             }
//         } catch (error) {
//             console.error("Error fetching towns:", error);
//             setTowns([]); // Set an empty array if there's an error
//         } finally {
//             setLoadingTowns(false);
//         }
//     };

//     const handleTownChange = (event) => {
//         setSelectedTown(event.target.value);
//     };


//     const [image, setImage] = useState("");
//     const [state, setState] = useState("reviews");

//     const responsive = {
//         superLargeDesktop: { breakpoint: { max: 4000, min: 1280 }, items: 5 },
//         desktop: { breakpoint: { max: 1280, min: 1024 }, items: 4 },
//         tablet: { breakpoint: { max: 1024, min: 640 }, items: 3 },
//         mobile: { breakpoint: { max: 640, min: 0 }, items: 3 }
//     };

//     const [quantity, setQuantity] = useState(1);

//     const inc = () => {
//         if (quantity >= product.stock) {
//             toast.error("Out of stock");
//         } else {
//             setQuantity(quantity + 1);
//         }
//     };

//     const dec = () => {
//         if (quantity > 1) {
//             setQuantity(quantity - 1);
//         }
//     };

//     const add_card = () => {
//         if (userInfo) {
//             dispatch(
//                 add_to_card({
//                     userId: userInfo.id,
//                     quantity,
//                     productId: product._id,
//                     sellerId: product.sellerId,
//                 })
//             );
//         } else {
//             navigate("/login");
//         }
//     };

//     const add_wishlist = () => {
//         if (userInfo) {
//             dispatch(
//                 add_to_wishlist({
//                     userId: userInfo.id,
//                     sellerId: product.sellerId,
//                     productId: product._id,
//                     name: product.name,
//                     price: product.price,
//                     whatsapp: product.whatsapp,
//                     location: product.location,
//                     image: product.images[0],
//                     discount: product.discount,
//                     rating: product.rating,
//                     slug: product.slug,
//                 })
//             );
//         } else {
//             navigate("/login");
//         }
//     };

//     useEffect(() => {
//         dispatch(get_product(slug));
//     }, [dispatch, slug]);
//     useEffect(() => {
//         if (errorMessage) {
//             toast.error(errorMessage);
//             dispatch(messageClear());
//         }
//         if (successMessage) {
//             toast.success(successMessage);
//             dispatch(messageClear());
//         }
//     }, [dispatch, errorMessage, successMessage]);

//     const buy = () => {
//         let price = 0;
//         if (product.discount !== 0) {
//             price =
//                 product.price - Math.floor((product.price * product.discount) / 100);
//         } else {
//             price = product.price;
//         }
//         const obj = [
//             {
//                 sellerId: product.sellerId,
//                 shopName: product.shopName,
//                 shopImage: product.shopImage,
//                 price: quantity * (price - Math.floor((price * 5) / 100)),
//                 products: [
//                     {
//                         quantity,
//                         productInfo: product,
//                     },
//                 ],
//             },
//         ];
//         navigate("/shipping", {
//             state: {
//                 products: obj,
//                 price: price * quantity,
//                 shipping_fee: 85,
//                 items: 1,
//             },
//         });
//     };

//     useEffect(() => {
//         const handleResize = () => {
//             if (window.innerWidth < 768) {
//                 setNameLimit(10);
//             } else {
//                 setNameLimit(null);
//             }
//         };


//         handleResize();

//         window.addEventListener('resize', handleResize);

//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     const productName = product?.name || "";

//     // Function to generate product URL
//     const generateProductUrl = (product) => {
//         const baseDomain = "http://localhost:3000"; // Replace with your actual domain
//         const productCategory = encodeURIComponent(product.category);
//         const productName = encodeURIComponent(product.name);
//         const productId = product._id;

//         // Base URL
//         const baseUrl = `${baseDomain}/${productCategory}/${productName}-${productId}.html`;

//         // Query parameters
//         const page = 1;
//         const pos = 1;
//         const adsPerPage = 23;
//         const adsCount = 56742;
//         const lid = "sampleListingId";
//         const indexPosition = product.indexPosition || 1;

//         // Construct the full URL with query parameters
//         const fullUrl = `${baseUrl}?page=${page}&pos=${pos}&ads_per_page=${adsPerPage}&ads_count=${adsCount}&lid=${lid}&indexPosition=${indexPosition}`;

//         return fullUrl;
//     };

//     const openWhatsApp = () => {
//         const phoneNumber = `+234${product.whatsapp}`;
//         const productName = product.name;
//         const productPrice = product.price;
//         const productLink = generateProductUrl(product); // Generate product URL

//         const message = encodeURIComponent(
//             `Hello! I got your contact from *Ridan Express* and I want to order the following product:\n\n` +
//             `*Product Name:* ${productName}\n` +
//             `*Product Name:* ${productPrice}\n` +
//             `*Product Link:* ${productLink}`
//         );

//         // URL to open in WhatsApp app
//         const appUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;

//         const webUrl = `https://wa.me/${phoneNumber}?text=${message}`;

//         const isAppOpened = window.open(appUrl, "_blank");

//         if (!isAppOpened) {
//             window.open(webUrl, "_blank");
//         }
//     };

//     return (
//         <div className="bg-gray-100">
//             <Headers />
//             <div className="bg-slate-100 py-2 mb-5 md:mb-0">
//                 <div className="container mx-auto px-4">
//                     <Breadcrumb aria-label="breadcrumb" className="px-2 md:px-5 dark:bg-gray-800">
//                         <Breadcrumb.Item href="/">
//                             <HiHome className="text-orange-400 mr-1 text-lg" /> Home
//                         </Breadcrumb.Item>
//                         <Breadcrumb.Item href="#">{product?.category || "Unknown Category"}</Breadcrumb.Item>
//                         <Breadcrumb.Item className="truncate max-w-[150px] md:max-w-none">
//                             {productName}
//                         </Breadcrumb.Item>
//                     </Breadcrumb>
//                 </div>
//             </div>

//             {/* Main Product Section */}
//             <section className="container mx-auto px-4 py-6">
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                     {/* Image Gallery */}
//                     <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm">
//                         <div className="aspect-square mb-4">
//                             <img
//                                 className="w-full h-full object-contain rounded-lg"
//                                 src={image || product.images?.[0]}
//                                 alt={product.name}
//                             />
//                         </div>
//                         <Carousel
//                             responsive={responsive}
//                             className="thumbnail-carousel"
//                             itemClass="px-1"
//                         >
//                             {product.images?.map((img, i) => (
//                                 <div key={i} onClick={() => setImage(img)} className="cursor-pointer">
//                                     <img
//                                         className="w-full h-20 object-cover rounded-md border-2 border-transparent hover:border-orange-400"
//                                         src={img}
//                                         alt=""
//                                     />
//                                 </div>
//                             ))}
//                         </Carousel>
//                     </div>

//                     {/* Product Info */}
//                     <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm">
//                         <div className="flex flex-col gap-2 md:mt-5">
//                             <h1 className="text-2xl text-[#191919] font-semibold mb-4">
//                                 {product.name}
//                             </h1>
//                             <div className="flex items-center gap-2 mb-1">
//                                 <Ratings ratings={product.rating} />
//                                 <span className="text-sm text-gray-500">({product.totalReviews} reviews)</span>
//                             </div>
//                             <h3 className="font-light">Brand: <span className="text-orange-400 font-normal">{product.brand}</span></h3>
//                             <div className="text-2xl text-[#191919] font-semibold">
//                                 {product.discount !== 0 ? (
//                                     <>
//                                         ₦  {(product.price -
//                                             Math.floor((product.price * product.discount) / 100)).toLocaleString()}
//                                         <span className="text-sm line-through font-light text-gray-500 ml-2">
//                                             ₦  {product.price}
//                                         </span>
//                                         <span className="text-sm text-orange-500 font-light bg-orange-100 p-1 rounded-sm ml-2">
//                                             -{product.discount}%
//                                         </span>
//                                     </>
//                                 ) : (
//                                     <>₦{product.price}</>
//                                 )}
//                             </div>
//                             {product.discount !== 0 && (
//                                 <div className="text-sm text-green-600">
//                                     Save {product.discount}% today!
//                                 </div>
//                             )}
//                         </div>


//                         <div className="my-">
//                             <div className="flex items-center gap-4 mb-4">
//                                 <div className="flex items-center border rounded-full w-fit">
//                                     <button
//                                         onClick={dec}
//                                         className="px-4 py-2 text-xl hover:bg-gray-100 rounded-l-full"
//                                     >
//                                         -
//                                     </button>
//                                     <span className="px-4 min-w-[40px] text-center">{quantity}</span>
//                                     <button
//                                         onClick={inc}
//                                         className="px-4 py-2 text-xl hover:bg-gray-100 rounded-r-full"
//                                     >
//                                         +
//                                     </button>
//                                 </div>
//                                 <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                                     {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
//                                 </span>
//                             </div>

//                             <div className="grid grid-cols-2 gap-3">
//                                 <button
//                                     onClick={buy}
//                                     disabled={product.stock === 0}
//                                     className="col-span-2 bg-orange-500 text-white py-3 rounded-full hover:bg-orange-600 disabled:opacity-50"
//                                 >
//                                     Buy Now
//                                 </button>
//                                 <button
//                                     onClick={add_card}
//                                     className="flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-500 py-2 rounded-full hover:bg-orange-50"
//                                 >
//                                     <ShoppingCartCheckoutIcon /> Add to Cart
//                                 </button>
//                                 <button
//                                     onClick={add_wishlist}
//                                     className="flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-500 py-2 rounded-full hover:bg-orange-50"
//                                 >
//                                     <FavoriteBorderIcon /> Wishlist
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="space-y-4">
//                             <div className="p-4 bg-gray-50 rounded-lg">
//                                 <h3 className="font-semibold mb-2">Delivery Options</h3>
//                                 {/* Delivery form components */}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Seller Info */}
//                     <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm">
//                         <div className="bg-gray-50 p-4 rounded-lg">
//                             <h2 className="text-lg font-semibold mb-4">Seller Information</h2>
//                             <div className="flex items-center gap-4 mb-4">
//                                 <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
//                                     {product?.shopImage ? (
//                                         <img src={product.shopImage} alt="Seller" className="w-full h-full object-cover" />
//                                     ) : (
//                                         <div className="w-full h-full flex items-center justify-center text-gray-600">
//                                             {product?.shopName?.[0]}
//                                         </div>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <h3 className="font-semibold">{product.shopName}</h3>
//                                     <p className="text-sm text-gray-600">{product.location}</p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={openWhatsApp}
//                                 className="w-full bg-green-500 text-white py-3 rounded-full flex items-center justify-center gap-2 hover:bg-green-600"
//                             >
//                                 <WhatsAppIcon /> Contact Seller
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* Product Tabs */}
//             <section className="container mx-auto px-4 py-6">
//                 <div className="bg-white rounded-lg shadow-sm">
//                     <div className="border-b">
//                         <div className="flex gap-4 px-4">
//                             <button
//                                 onClick={() => setState("description")}
//                                 className={`py-4 ${state === 'description' ? 'border-b-2 border-orange-500 font-semibold' : ''}`}
//                             >
//                                 Description
//                             </button>
//                             <button
//                                 onClick={() => setState("reviews")}
//                                 className={`py-4 ${state === 'reviews' ? 'border-b-2 border-orange-500 font-semibold' : ''}`}
//                             >
//                                 Reviews ({product.totalReviews})
//                             </button>
//                         </div>
//                     </div>
//                     <div className="p-4">
//                         {state === "description" ? (
//                             <div className="prose max-w-none">
//                                 {product.description}
//                             </div>
//                         ) : (
//                             <Reviews product={product} />
//                         )}
//                     </div>
//                 </div>
//             </section>

//             {/* Related Products */}
//             <section className="container mx-auto px-4 py-6">
//                 <h2 className="text-2xl font-semibold mb-6">Related Products</h2>
//                 <Swiper
//                     slidesPerView={1}
//                     spaceBetween={16}
//                     breakpoints={{
//                         640: { slidesPerView: 2 },
//                         1024: { slidesPerView: 3 },
//                         1280: { slidesPerView: 4 }
//                     }}
//                     pagination={{ clickable: true }}
//                     className="pb-10"
//                 >
//                     {relatedProducts.map((p, i) => (
//                         <SwiperSlide key={i}>
//                             <Link className="block group">
//                                 <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
//                                     <div className="aspect-square mb-4 relative">
//                                         <img
//                                             className="w-full h-full object-contain rounded-lg"
//                                             src={p.images[0]}
//                                             alt={p.name}
//                                         />
//                                         {p.discount > 0 && (
//                                             <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
//                                                 -{p.discount}%
//                                             </div>
//                                         )}
//                                     </div>
//                                     <h3 className="font-semibold mb-2 truncate">{p.name}</h3>
//                                     <div className="flex items-center justify-between">
//                                         <div>
//                                             <span className="text-lg font-bold text-red-600">
//                                                 ₦  {(p?.price || 0).toLocaleString()}
//                                             </span>
//                                             {p.discount > 0 && (
//                                                 <span className="ml-2 text-sm text-gray-500 line-through">
//                                                     ₦  {((p?.price || 0) + ((p?.price || 0) * (p?.discount || 0)) / 100).toLocaleString()}
//                                                 </span>
//                                             )}
//                                         </div>
//                                         <Ratings ratings={p.rating} />
//                                     </div>
//                                 </div>
//                             </Link>
//                         </SwiperSlide>
//                     ))}
//                 </Swiper>
//             </section>
//         </div>
//     );
// };

// export default Details;

