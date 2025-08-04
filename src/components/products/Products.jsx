import React from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { FiChevronLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { convert } from 'html-to-text';

const Products = ({ title, products }) => {
    const { userInfo } = useSelector(state => state.auth);
    const isAdmin = userInfo?.role === 'admin';
    
    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 3000 },
            items: 1
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 1
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 1
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1
        }
    };

    const ButtonGroup = ({ next, previous }) => {
        return (
            <div className='flex justify-between items-center'>
                <div className='text-lg font-bold text-slate-600'>{title}</div>
                <div className='flex justify-center items-center gap-3 text-slate-600'>
                    <button 
                        onClick={() => previous()} 
                        className='w-[30px] h-[30px] flex justify-center items-center bg-slate-300 border border-slate-200'
                    >
                        <span><FiChevronLeft /></span>
                    </button>
                    <button 
                        onClick={() => next()} 
                        className='w-[30px] h-[30px] flex justify-center items-center bg-slate-300 border border-slate-200'
                    >
                        <span><FiChevronLeft /></span>
                    </button>
                </div>
            </div>
        );
    };

    // Filter products based on user role
    const getVisibleProducts = () => {
        return products.map(group => {
            return group.filter(product => {
                // Admins see all products
                if (isAdmin) return true;
                
                // Customers only see approved products
                return product.status === 'approved';
            });
        }).filter(group => group.length > 0); // Remove empty groups
    };

    const visibleProducts = getVisibleProducts();

    if (visibleProducts.length === 0) {
        return null; // Don't render if no products to show
    }

    return (
        <div className='flex gap-8 flex-col-reverse'>
            <Carousel
                autoPlay={false}
                infinite={false}
                arrows={false}
                responsive={responsive}
                transitionDuration={500}
                renderButtonGroupOutside={true}
                customButtonGroup={<ButtonGroup />}
            >
                {visibleProducts.map((productGroup, i) => (
                    <div key={i} className='flex flex-col justify-start gap-2'>
                        {productGroup.map((product, j) => (
                            <Link 
                                key={j} 
                                className='flex justify-start items-center relative'
                                to={`/product/details/${product.slug}`}
                            >
                                {/* Approval status indicators */}
                                {isAdmin && product.status === 'pending' && (
                                    <div className='absolute top-1 left-1 bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-bold z-10'>
                                        Pending
                                    </div>
                                )}
                                
                                {isAdmin && product.status === 'rejected' && (
                                    <div className='absolute top-1 left-1 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold z-10'>
                                        Rejected
                                    </div>
                                )}
                                
                                <img 
                                    className='w-[80px] h-[80px] object-cover rounded-lg' 
                                    src={product.images[0]} 
                                    alt={product.name} 
                                />
                                <div className='px-3 flex justify-start items-start gap-1 flex-col text-slate-600'>
                                    <h2 className='text-[13px] text-gray-800'>{product.name?.slice(0, 40)}</h2>
                                    <span className='text-md font-bold text-gray-800'>
                                        ₦ {product.price.toLocaleString()}
                                    </span>
                                    {product.discount > 0 && (
                                        <span className='text-xs text-green-600'>
                                            {product.discount}% OFF
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ))}
            </Carousel>
        </div>
    );
};

export default Products;