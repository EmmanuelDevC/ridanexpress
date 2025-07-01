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

const FeatureProducts = ({ products }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userInfo } = useSelector(state => state.auth)
    const { successMessage, errorMessage } = useSelector(state => state.card)

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
        <div className='w-full max-w-7xl mx-auto py-0 lg:py-2 px-1'>

            {/* Header Section - Updated to light brown */}
            <div className="flex border border-[#e9d8c5] bg-gray-800 px-4 py-3 rounded-xl justify-between items-center mb-4 shadow-sm">
                <h2 className="text-xl font-bold text-white">
                    Special For You
                    <span className="hidden lg:block w-14 h-1 bg-[#a1887f] mt-2 rounded-full" />
                </h2>
                <Link
                    to='/shops'
                    className="text-white font-medium transition-colors flex items-center gap-2 hover:text-[#8d6e63]"
                >
                    See All
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
                    {products.map((p, i) => (
                        <Link 
                            to={`/product/details/${p.slug}`} 
                            className='relative flex-1 group'
                            key={i}
                        >
                            <div className='bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col border border-[#efebe9] h-full'>
                                {p.discount && (
                                    <div className='absolute left-2 top-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold z-10 shadow-sm'>
                                        {p.discount}% OFF
                                    </div>
                                )}
                                
                                <div className='relative aspect-square overflow-hidden'>
                                    <img
                                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                                        src={p.images[0]}
                                        alt={p.name}
                                        loading='lazy'
                                    />
                                    
                                    <div className='absolute top-3 right-3 flex flex-col gap-2'>
                                        <button
                                            onClick={(e) => add_wishlist(p, e)}
                                            className='w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-[#e9d8c5] text-gray-600 hover:text-[#d32f2f] transition-all'
                                            aria-label="Add to wishlist"
                                        >
                                            <AiFillHeart className='w-4 h-4' />
                                        </button>
                                    </div>
                                </div>

                                <div className="py-3 px-3 flex-grow flex flex-col">
                                    <h2 className="text-sm font-semibold text-black mb-1 line-clamp-1 group-hover:text-[#8d6e63] transition-colors">
                                        {p.name}
                                    </h2>

                                    <div className="flex items-center my-1 gap-1 mt-auto">
                                        <Ratings ratings={p.rating} />
                                        <span className="text-xs text-gray-500">({p.rating})</span>
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
                                    
                                    <button
                                        onClick={(e) => add_card(p._id, e)}
                                        className='mt-3 w-full py-2 bg-gray-800 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:bg-[#d7ccc8] transition-colors'
                                    >
                                        <AddShoppingCartIcon className='w-5 h-5' />
                                        <span>Add to Cart</span>
                                    </button>
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