import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "react-feather";

const Categorys = () => {
  const { categorys = [] } = useSelector((state) => state.home);
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category.name}`);
  };

  const scroll = (direction) => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.firstChild?.offsetWidth || 0;
      const scrollAmount = (itemWidth + 32) * (direction === 'left' ? -1 : 1);
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Auto-scroll logic with pause on hover
  useEffect(() => {
    const carousel = carouselRef.current;
    let autoScroll;

    const startScroll = () => {
      autoScroll = setInterval(() => {
        if (carousel && !isHovered) {
          const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
          const itemWidth = carousel.firstChild?.offsetWidth || 0;

          if (carousel.scrollLeft >= maxScrollLeft - 10) {
            carousel.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            carousel.scrollBy({
              left: itemWidth + 32,
              behavior: "smooth"
            });
          }
        }
      }, 3000);
    };

    startScroll();
    return () => clearInterval(autoScroll);
  }, [isHovered]);

  return (
    <div className="mb-1">
      <div className="bg-white rounded-lg mt-3 lg:mt-0 shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section - Maintained your original structure */}
        <div className="flex items-center bg-none lg:bg-gray-900 rounded-t-lg justify-between px-2 py-2 lg:px-4 lg:py-2">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg lg:text-2xl font-semibold lg:font-bold text-orange-500 lg:text-white">
              Shop by Category
            </h2>
            <span className="w-5 lg:w-12 h-1 bg-orange-600 rounded-full" />
          </div>
          <div className="hidden lg:flex space-x-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} className="text-orange-600" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} className="text-orange-600" />
            </button>
          </div>
        </div>

        {/* Category Carousel - Enhanced but structure preserved */}
        <div
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth 
            pb-0 lg:pb-4 px-2 scrollbar-thin scrollbar-thumb-orange-600 scrollbar-track-gray-100"
            role="list"
          >
            {categorys.length > 0 ? (
              categorys.map((category) => (
                <div
                  key={category.id}
                  className="snap-start min-w-[105px] md:min-w-[180px] pb-4 lg:pb-0 lg:min-w-[100px]
                  flex flex-col items-center px-1 transition-all duration-300
                  rounded-full active:scale-95 cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                  role="listitem"
                >
                  {/* Enhanced category card */}
                  <div className="relative w-full aspect-square rounded-xl bg-white p-3 lg:p-5 transition-all">
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      className="w-full h-full shadow-sm rounded-xl lg:rounded-3xl object-contain hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="mt-2 text-sm md:text-base font-medium text-gray-600 text-center">
                    {category.name}
                  </h3>
                  {category.count && (
                    <span className="mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                      {category.count} items
                    </span>
                  )}
                </div>
              ))
            ) : (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="snap-start min-w-[105px] md:min-w-[180px] lg:min-w-[200px]
                  flex flex-col items-center p-3 space-y-3 animate-pulse"
                >
                  <div className="w-full aspect-square bg-gray-200 rounded-xl" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                </div>
              ))
            )}
          </div>

          {/* Mobile scroll indicators (hidden on desktop) */}
          <div className="lg:hidden flex justify-center space-x-2 mt-2 pb-2">
            {categorys.slice(0, 4).map((_, i) => (
              <span key={i} className="w-2 h-2 rounded-full bg-gray-300"></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categorys;