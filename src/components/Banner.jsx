import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { get_banners } from "../store/reducers/homeReducer";
import ridanImage from "../assets/Images/banner/ridan.jpg";
import ridanImage2 from "../assets/Images/banner/fashion.jpg";
import ridanImage3 from "../assets/Images/banner/Men.png";

const Banner = () => {
    const dispatch = useDispatch();
    const [currentSlide, setCurrentSlide] = useState(0);
    const timeoutRef = useRef(null);

    const carouselImages = [
        ridanImage,
        ridanImage2,
        ridanImage3
    ];

    useEffect(() => {
        dispatch(get_banners());
    }, [dispatch]);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(() => {
            setCurrentSlide((prev) => 
                prev === carouselImages.length - 1 ? 0 : prev + 1
            );
        }, 5000);

        return () => resetTimeout();
    }, [currentSlide]);

    const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? carouselImages.length - 1 : prev - 1));
    const nextSlide = () => setCurrentSlide(prev => (prev === carouselImages.length - 1 ? 0 : prev + 1));

    return (
        <div className="container w-[98%] mx-auto sm:px-4">
            <div className="flex flex-col lg:flex-row mb-3 gap-2 lg:gap-3">
                {/* Main Carousel - Enhanced Design */}
                <div className="relative w-full lg:w-[65%]">
                    <div className="relative h-[180px] xs:h-[220px] sm:h-[300px] md:h-[420px] overflow-hidden rounded-2xl lg:rounded-3xl shadow-xl">
                        {carouselImages.map((image, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                                    index === currentSlide 
                                        ? 'opacity-100 scale-100' 
                                        : 'opacity-0 scale-105'
                                }`}
                            >
                                <img
                                    src={image}
                                    className="w-full h-full object-cover object-center"
                                    alt={`Slide ${index + 1}`}
                                    loading="eager"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
                            </div>
                        ))}
                    </div>

                    {/* Modern Indicators */}
                    <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-2">
                        {carouselImages.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                                    index === currentSlide 
                                        ? 'bg-white w-10' 
                                        : 'bg-white/50'
                                }`}
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Sleek Controls */}
                    <button
                        type="button"
                        className="absolute top-1/2 left-4 -translate-y-1/2 z-30 p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-all duration-300 shadow-lg"
                        onClick={prevSlide}
                        aria-label="Previous slide"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        className="absolute top-1/2 right-4 -translate-y-1/2 z-30 p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-all duration-300 shadow-lg"
                        onClick={nextSlide}
                        aria-label="Next slide"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Right Grid - Modern Card Design */}
                <div className="lg:w-[35%] w-full grid grid-cols-2 gap-2 sm:gap-4">
                    {/* XclusivePlus Card */}
                    <div className="relative rounded-2xl overflow-hidden shadow-lg h-[150px] sm:h-[200px] group">
                        <img
                            src="https://www-konga-com-res.cloudinary.com/image/upload/w_300,f_auto,fl_lossy,dpr_1.0,q_auto/v1721217481/contentservice/box%20banner.png_6YtnUQEK6.png"
                            alt="XclusivePlus"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 p-3 flex flex-col justify-end">
                            <h3 className="text-white font-bold text-base sm:text-lg">XclusivePlus</h3>
                            <p className="text-amber-300 font-medium text-sm">GET UP TO ₦1,000 OFF</p>
                        </div>
                    </div>

                    {/* Interest Card */}
                    <div className="relative rounded-2xl overflow-hidden shadow-lg h-[150px] sm:h-[200px] bg-gradient-to-br from-blue-600 to-indigo-700 p-4 flex flex-col justify-center items-center group">
                        <div className="text-center space-y-2 transform group-hover:scale-105 transition-transform duration-500">
                            <h3 className="text-white font-bold text-2xl sm:text-3xl">Unlock 15%</h3>
                            <p className="text-blue-100 text-sm">Annual Interest</p>
                            <p className="text-white font-bold text-base sm:text-lg mt-2">JUST FOR YOU!</p>
                        </div>
                        <div className="absolute bottom-4">
                            <button className="px-4 py-1.5 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                                Learn More
                            </button>
                        </div>
                    </div>

                    {/* Product Cards */}
                    <div className="relative rounded-2xl overflow-hidden shadow-lg h-[150px] sm:h-[200px] group">
                        <img
                            src="https://www-konga-com-res.cloudinary.com/image/upload/w_300,f_auto,fl_lossy,dpr_1.0,q_auto/v1714910034/contentservice/access%20new.png_r19IQgHfC.png"
                            alt="CeraVe"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col justify-end">
                            <h3 className="text-white font-bold text-base">CeraVe</h3>
                            <p className="text-gray-200 text-xs sm:text-sm">Visibly maintains moisture even after 48 hours</p>
                        </div>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden shadow-lg h-[150px] sm:h-[200px] group">
                        <img
                            src="https://www-konga-com-res.cloudinary.com/image/upload/w_300,f_auto,fl_lossy,dpr_1.0,q_auto/v1724314744/contentservice/image%20%281%29.png_UzlEcf8H0.png"
                            alt="Special Offer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                SHOP NOW
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;