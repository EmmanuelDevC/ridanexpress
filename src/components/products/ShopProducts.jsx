import React, { useEffect } from 'react'
import { AiFillHeart } from 'react-icons/ai'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Ratings from '../Ratings'
import { add_to_card, messageClear, add_to_wishlist } from '../../store/reducers/cardReducer'

const ShopProducts = ({ products }) => {
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
        <div className='w-full max-w-7xl mx-auto py-0 lg:py-2 pb-6 px-1'>

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 lg:gap-2'>
                {products.map((p, i) => (
                    <div key={i} className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col'>
                        <Link to={`/product/details/${p.slug}`} className='relative flex-1'>
                            {p.discount && (
                                <div className='absolute left-1 top-1 bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-semibold z-10'>
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
                                    className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-900 hover:text-white transition-all'
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
        </div>
    )
}

export default ShopProducts