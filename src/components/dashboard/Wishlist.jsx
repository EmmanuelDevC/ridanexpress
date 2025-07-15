import React, { useEffect } from 'react'
import { AiFillHeart, AiOutlineDelete } from 'react-icons/ai'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Ratings from '../Ratings'
import { get_wishlist_products, remove_wishlist, messageClear } from '../../store/reducers/cardReducer'

const Wishlist = () => {
    const dispatch = useDispatch()
    const { userInfo } = useSelector(state => state.auth)
    const { wishlist, successMessage } = useSelector(state => state.card)

    useEffect(() => {
        dispatch(get_wishlist_products(userInfo.id))
    }, [])

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
        }
    }, [successMessage])

    return (
        <div className='w-full max-w-7xl mx-auto py-0 lg:py-2 mt-5 pb-6 px-1'>
            <h1 className="text-2xl font-bold text-gray-800 mb-4 px-2">My Wishlist</h1>

            {wishlist.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-orange-600 text-lg">No products in your wishlist </p>
                </div>
            )}

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 lg:gap-2'>
                {wishlist.map((p, i) => (
                    <div key={i} className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col'>
                        <div className='relative flex-1'>
                            {p.discount !== 0 && (
                                <div className='absolute left-1 top-1 bg-[#c48a47] text-white px-3 py-1 rounded-lg text-xs font-semibold z-10'>
                                    {p.discount}% OFF
                                </div>
                            )}
                            
                            {/* Delete Button */}
                            <div className='absolute right-1 top-1 flex gap-1'>
                                <button
                                    onClick={() => dispatch(remove_wishlist(p._id))}
                                    className='w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-red-500 hover:text-white text-gray-800 transition-all'
                                    aria-label="Delete item"
                                >
                                    <AiOutlineDelete className='w-5 h-5' />
                                </button>
                            </div>

                            <Link to={`/product/details/${p.slug}`} className='aspect-square overflow-hidden block'>
                                <img
                                    className='w-full h-auto object-cover'
                                    src={p.image}
                                    alt={p.name}
                                    loading='lazy'
                                />
                            </Link>
                        </div>

                        <div className="relative py-3 px-2 text-gray-700">
                            <Link to={`/product/details/${p.slug}`} className='hover:text-orange-600'>
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
        </div>
    )
}

export default Wishlist