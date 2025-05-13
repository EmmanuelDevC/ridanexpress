import React, { useState, useEffect } from 'react'
import Ratings from './Ratings'
import RatingTemp from './RatingTemp'
import Pagination from './Pagination'
import { AiFillStar, AiOutlineShopping } from 'react-icons/ai'
import RatingReact from 'react-rating'
import { CiStar } from 'react-icons/ci'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { customer_review, messageClear, get_reviews, get_product } from '../store/reducers/homeReducer'
import toast from 'react-hot-toast'

const Reviews = ({ product }) => {

  const dispatch = useDispatch()
  const { userInfo } = useSelector(state => state.auth)
  const { successMessage, reviews, totalReview, rating_review } = useSelector(state => state.home)
  const [pageNumber, setPageNumber] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [rat, setRat] = useState('')
  const [re, setRe] = useState('')

  // In your Reviews component
  const hasPurchased = useSelector(state => {
    const orders = state.order.myOrders
    return orders.some(order =>
      order.orderStatus === 'Delivered' &&
      order.products?.some(p => p.productId === product._id)
    )
  })

  const review_submit = (e) => {
    e.preventDefault()
    if (!hasPurchased) {
      toast.error("You must purchase this product to leave a review")
      return
    }
    const obj = {
      name: userInfo.name,
      review: re,
      rating: rat,
      productId: product._id
    }
    dispatch(customer_review(obj))
  }

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage)
      dispatch(get_reviews({
        productId: product._id,
        pageNumber
      }))
      dispatch(get_product(product.slug))
      setRat('')
      setRe('')
      dispatch(messageClear())
    }
  }, [successMessage])

  useEffect(() => {
    if (product._id) {
      dispatch(get_reviews({
        productId: product._id,
        pageNumber
      }))
    }
  }, [pageNumber, product])

  return (
    <div className='mt-4 flex flex-col md:flex-row lg:flex-row gap-4 md:gap-8 w-full lg:w-[90%] xl:w-[80%] px-4 md:px-0 mx-auto'>
      {/* Left Column */}
      <div className='w-full lg:w-[45%] xl:w-[40%]'>
        <div className='flex flex-col gap-1'>
          <div className='flex flex-col sm:flex-row gap-4 items-center py-4'>
            <div className='text-center sm:text-left'>
              <span className='text-4xl font-light text-[#191919]'>{product.rating}</span>
              <span className='text-3xl font-light text-[#191919]'>/5</span>
            </div>
            <div className='flex flex-col gap-1 text-xl items-center sm:items-start'>
              <Ratings ratings={product.rating} />
              <p className='text-sm text-gray-500'>{totalReview} Verified Reviews</p>
            </div>
          </div>

          {/* Rating Bars */}
          <div className='flex flex-col gap-2 py-2'>
            {[5, 4, 3, 2, 1].map((rating, idx) => (
              <div key={rating} className='flex items-center gap-3 sm:gap-5'>
                <div className='w-[93px] flex justify-end'>
                  <RatingTemp rating={rating} />
                </div>
                <div className='flex-1 max-w-[250px] md:max-w-none flex items-center gap-2 sm:gap-3'>
                  <div className='w-full h-[9px] rounded-full bg-slate-200 relative'>
                    <div
                      style={{ width: `${Math.floor((100 * (rating_review[idx]?.sum || 0)) / totalReview)}%` }}
                      className='h-full bg-gradient-to-r from-orange-300 to-orange-500 rounded-full'
                    />
                  </div>
                  <p className='text-sm text-slate-600 w-8 text-right'>
                    {rating_review[idx]?.sum || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Form */}
        <div className='mt-4'>
          <h2 className='text-sm md:text-lg text-[#191919] font-semibold flex items-center gap-2'>
            <AiOutlineShopping className="text-orange-500" />
            Share Your Experience
          </h2>

          {userInfo ? (
            <div className='flex flex-col gap-3 mt-4'>
              {hasPurchased ? (
                <>
                  <div className='flex items-center gap-2 text-sm text-green-600'>
                    <AiOutlineShopping className="text-lg" />
                    <span>Verified Purchase</span>
                  </div>
                  <RatingReact
                    onChange={setRat}
                    initialRating={rat}
                    emptySymbol={<CiStar className="text-slate-300 text-2xl" />}
                    fullSymbol={<AiFillStar className="text-orange-400 text-2xl" />}
                  />
                  <form onSubmit={review_submit}>
                    <textarea
                      value={re}
                      required
                      onChange={(e) => setRe(e.target.value)}
                      className='border rounded-lg w-full border-gray-200 h-[120px] outline-none p-3 resize-none focus:ring-2 ring-orange-200'
                      placeholder='Tell us about your experience...'
                    />
                    <div className='mt-3'>
                      <button className='py-2 px-8 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2'>
                        Submit Review
                        <AiFillStar className="text-white" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                  <p className='text-blue-800 flex items-center gap-2'>
                    <AiOutlineShopping className="text-lg" />
                    You must purchase this product to leave a review
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className='mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200'>
              <Link to='/login' className='text-blue-800 hover:text-blue-900 flex items-center gap-2'>
                <AiOutlineShopping className="text-lg" />
                Login to review your purchase
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className='w-full lg:w-[55%] xl:w-[60%]'>
        <h2 className='text-xl font-bold py-4 md:py-5 text-[#191919] flex items-center gap-2'>
          Customer Experiences
          <span className='text-sm text-gray-500'>({totalReview} verified)</span>
        </h2>
        <div className='flex flex-col gap-6 pb-3 md:pb-10'>
          <div className='space-y-2 pb-4'>
            {reviews.slice(0, 2).map((r, i) => (
              <div
                key={i}
                className="flex flex-col  border border-gray-200 p-4 md:p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{r.name}</span>
                    <AiOutlineShopping className="text-orange-500 text-sm" />
                  </div>
                  <div className="flex gap-1 text-orange-400">
                    <RatingTemp rating={r.rating} />
                  </div>
                </div>
                <span className="text-xs text-gray-400">{r.date}</span>
                <p className="text-sm text-gray-600 leading-relaxed mt-1">{r.review}</p>
                {r.userId === userInfo?._id && (
                  <div className="mt-1 text-xs text-blue-500 flex items-center gap-1">
                    Verified customer review
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className='py-2 px-8 bg-orange-400 text-white rounded-lg hover:bg-orange-600 transition-all flex justify-center items-center gap-2'>
            <Link to={`/product/${product.slug}/reviews`} className='flex items-center gap-2'>
              <AiOutlineShopping className="text-lg" />
              View all reviews
            </Link>
            <AiFillStar className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Reviews