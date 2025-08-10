import React, { useEffect } from 'react'
import { AiFillHeart } from 'react-icons/ai'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Ratings from '../Ratings'
import { add_to_card, messageClear, add_to_wishlist } from '../../store/reducers/cardReducer'
import Skeleton from "@mui/material/Skeleton";

const FeatureProducts = ({ products, isAdmin = false }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userInfo } = useSelector(state => state.auth)
    const { successMessage, errorMessage } = useSelector(state => state.card)

    // Filter products based on user role and approval status
    const getVisibleProducts = () => {
        if (isAdmin) {
            // Admins see all products
            return products;
        } else {
            // Customers only see approved products
            return products.filter(p => p.status === 'approved');
        }
    };

    const visibleProducts = getVisibleProducts();

    const add_card = (id, e) => {
        e.preventDefault()
        e.stopPropagation()
        if (userInfo) {
            dispatch(add_to_card({
                userId: userInfo.id,
                quantity: 1,
                productId: id
            }))
        } else {
            navigate('/login')
        }
    }

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
    }, [errorMessage, successMessage])

    const isLoading = products.length === 0;

    const add_wishlist = (pro, e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(add_to_wishlist({
            userId: userInfo.id,
            productId: pro._id,
            name: pro.name,
            price: pro.price,
            image: pro.images[0],
            discount: pro.discount,
            rating: pro.rating,
            slug: pro.slug
        }))
    }

    return (
        <div className='w-full mx-auto py-0 lg:py-2 px-1'>

            {/* Header Section - Updated to light brown */}
            <div className="flex bg-gradient-to-r from-orange-600 to-amber-700 px-3 py-2 rounded-xl justify-between items-center mb-4 shadow-lg">
                <div className="flex flex-col">
                    <h2 className="text-lg lg:text-xl font-bold text-white flex items-center gap-1">
                        Special For You
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-amber-300"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-amber-300 to-transparent mt-2 rounded-full"></div>
                </div>

                <Link
                    to='/shops'
                    className="group flex items-center gap-2 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300"
                >
                    <span className="text-white text- font-semibold group-hover:text-white">See All</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-amber-200 group-hover:translate-x-1 transition-transform"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>

            {isLoading ? (
                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4'>
                    {[1, 2, 3, 4, 5, 6].map((_, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-[#efebe9]"
                        >
                            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                <Skeleton
                                    variant="rectangular"
                                    className='w-full h-full rounded-none'
                                    animation="wave"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </div>

                            <div className="p-3 space-y-2">
                                <div className="flex justify-between items-start">
                                    <Skeleton
                                        variant="text"
                                        width={120}
                                        height={24}
                                        className="rounded-lg"
                                    />
                                    <Skeleton
                                        variant="circular"
                                        width={32}
                                        height={32}
                                        className="mr-1"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Skeleton
                                        variant="text"
                                        width={80}
                                        height={20}
                                        className="rounded-lg"
                                    />
                                    <Skeleton
                                        variant="text"
                                        width={40}
                                        height={20}
                                        className="rounded-lg"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Skeleton
                                        variant="text"
                                        width={60}
                                        height={24}
                                        className="rounded-lg"
                                    />
                                    <Skeleton
                                        variant="text"
                                        width={50}
                                        height={20}
                                        className="rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) :
                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1 md:gap-2 lg:gap-2'>
                    {visibleProducts.map((p, i) => (
                        <Link
                            to={`/product/details/${p.slug}`}
                            className='relative flex-1 group'
                            key={i}
                        >
                            <div className='bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col border border-[#efebe9] h-full'>
                                {/* Approval status badge */}
                                {p.status === 'pending' && userInfo?.role === 'admin' && (
                                    <div className='absolute left-2 top-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold z-10 shadow-sm'>
                                        Pending Approval
                                    </div>
                                )}

                                {p.status === 'rejected' && userInfo?.role === 'admin' && (
                                    <div className='absolute left-2 top-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold z-10 shadow-sm'>
                                        Rejected
                                    </div>
                                )}

                                <div className='relative aspect-square overflow-hidden'>
                                    <img
                                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                                        src={p.images[0]}
                                        alt={p.name}
                                        loading='lazy'
                                    />

                                    <div className='absolute top-[8rem] right-2 flex flex-col gap-'>
                                        {/* <button
                                            onClick={(e) => add_wishlist(p, e)}
                                            className='w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-[#e9d8c5] text-gray-600 hover:text-[#d32f2f] transition-all'
                                            aria-label="Add to wishlist"
                                        >
                                            <AiFillHeart className='w-4 h-4' />
                                        </button> */}
                                        <button
                                            onClick={(e) => add_card(p._id, e)}
                                            className='w-9 h-9 flex items-center mt-2 justify-center bg-orange-600 border border rounded-xl shadow-md text-white hover:text-white transition-all'
                                        >
                                            <AddShoppingCartIcon className=' w-4 h-4' />
                                        </button>
                                    </div>
                                </div>

                                <div className="py-3 px-3 flex-grow flex flex-col relative">
                                    <h2 className="text-sm font-semibold text-black mb-1 line-clamp-1 group-hover:text-[#8d6e63] transition-colors">
                                        {p.name}
                                    </h2>

                                    <div className="flex items-center my-1 gap-1 mt-auto">
                                        <Ratings ratings={p.rating} />
                                        <span className="text-xs text-gray-500">({p.rating})</span>

                                        {p.discount && (
                                            <div className='absolute right-0 top-8 bg-gray-600 text-white px-2 py-1 rounded-l-xl text-xs font-bold z-10 shadow-xl'>
                                                - {p.discount}%
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-row flex-wrap items-center gap-2 mt-2">
                                        <span className="text-base font-bold text-[#5d4037]">
                                            ₦ {(p.price - (p.price * p.discount) / 100).toLocaleString()}
                                        </span>
                                        {p.discount > 0 && (
                                            <del className="text-gray-500 text-sm">
                                                ₦ {p.price.toLocaleString()}
                                            </del>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            }
        </div>
    )
}

export default FeatureProducts