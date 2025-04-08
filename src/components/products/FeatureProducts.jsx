import React, { useEffect } from 'react'
import { AiFillHeart } from 'react-icons/ai'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Ratings from '../Ratings'
import { add_to_card, messageClear, add_to_wishlist } from '../../store/reducers/cardReducer'
import Skeleton from "@mui/material/Skeleton"; // Import Skeleton from Material UI


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

    const isLoading = products.length === 0; // Loading state: Assuming if no products, data is loading

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

            <div className="flex border border-gray-200 bg-orange-500 lg:bg-orange-600 px-2 py-2 rounded-lg justify-between items-center mb-2 lg:mb-6">
                <h2 className="text-xl font-base text-white ">
                    Special For You
                    <span className="hidden lg:block w-12 h-1.5 block lg:hidden bg-orange-500 mt-2 rounded-full" />
                </h2>
                <Link
                    to="/products"
                    className="text-white font-medium transition-colors flex items-center gap-2"
                >
                    See All
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>

            {isLoading ? (
                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 lg:gap-4'>
                    {[1, 2, 3, 4, 5, 6].map((_, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                        >
                            {/* Image Skeleton with Shimmer Effect */}
                            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                <Skeleton
                                    variant="rectangular"
                                    className='w-full h-full rounded-none'
                                    animation="wave"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </div>

                            {/* Content Skeleton */}
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
            ) : // Render products when loaded

                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 md:gap-2 lg:gap-2'>
                    {products.map((p, i) => (
                        <div key={i} className='bg-white md:rounded-lg lg:rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col'>
                            <Link to={`/product/details/${p.slug}`} className='relative flex-1'>
                                {p.discount && (
                                    <div className='absolute left-1 top-1 bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-semibold z-0 z-10'>
                                        {p.discount}% OFF
                                    </div>
                                )}
                                <div className='aspect-square overflow-hidden'>
                                    <img
                                        className='w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105'
                                        src={p.images[0]}
                                        alt={p.name}
                                        loading='lazy'
                                    />
                                </div>
                            </Link>

                            {/* Action Buttons */}
                            <div className='absolute top-[10rem] hidden lg:block right-3 flex flex-col gap-3'>
                                <button
                                    onClick={(e) => add_card(p._id, e)}
                                    className='w-9 h-9 flex mb-3 items-center justify-center bg-white rounded-full shadow-md hover:bg-gray-900 hover:text-white text-gray-800 transition-all'
                                    aria-label="Add to cart"
                                >
                                    <AddShoppingCartIcon className='w-5 h-5' />
                                </button>
                            </div>


                            <div className="relative py-3 px-2 text-gray-700">

                                <div className='absolute right-1 -top-11 flex flex-col gap-2'>
                                    <button
                                        onClick={(e) => add_card(p._id, e)}
                                        className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-gray-900 hover:text-white transition-all'
                                        aria-label="Add to cart"
                                    >
                                        <ShoppingCartOutlinedIcon className='w-6 h-6 text-orange-600' />
                                    </button>
                                </div>

                                <Link to={`/product/debg-gradient-to-r from-gray-800 to-indigo-700tails/${p.slug}`} className='hover:text-orange-600'>
                                    <h2 className="text-sm md:text-base font-semibold line-clamp-1">
                                        {p.name}
                                    </h2>
                                </Link>

                                <div className="flex items-center my-1 gap-1">
                                    <Ratings ratings={p.rating} />
                                    <span className="text-xs text-gray-500">({p.rating})</span>
                                </div>

                                <div className="flex flex-row flex-wrap items-center gap-2 md:gap-1">
                                    <span className="text-[15px] font-base text-black">
                                        ₦ {(p.price - (p.price * p.discount) / 100).toLocaleString()}
                                    </span>
                                    {p.discount > 0 && (
                                        <del className="text-gray-500 text-[13px] font-base">
                                            ₦ {p.price.toLocaleString()}
                                        </del>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            }
        </div>
    )
}

export default FeatureProducts