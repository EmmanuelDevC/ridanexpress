import React, { useState, useEffect, useMemo } from 'react'
import Ratings from '../components/Ratings'
import RatingTemp from '../components/RatingTemp'
import Pagination from '../components/Pagination'
import { AiFillStar, AiOutlineShopping, AiOutlineLike } from 'react-icons/ai'
import { CiStar, CiCalendar } from 'react-icons/ci'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { customer_review, messageClear, get_reviews, get_product } from '../store/reducers/homeReducer'
import { get_orders } from '../store/reducers/orderReducer'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import Rating from 'react-rating'
import Headers from '../components/Headers'

const CustomerReview = () => {
  const dispatch = useDispatch()
  const { slug } = useParams()
  const { userInfo } = useSelector(state => state.auth)
  const { successMessage, reviews, totalReview, rating_review, product } = useSelector(state => state.home)

  const [pageNumber, setPageNumber] = useState(1)
  const [perPage] = useState(10)
  const [rat, setRat] = useState('')
  const [re, setRe] = useState('')
  const [selectedRating, setSelectedRating] = useState(null)
  const [sortBy, setSortBy] = useState('recent')
  const { myOrders } = useSelector(state => state.order)

  useEffect(() => {
    if (slug) {
      dispatch(get_product(slug))
    }
    if (userInfo?._id) {
      dispatch(get_orders({
        customerId: userInfo._id,
        status: 'pending' // Make sure your backend supports this
      }))

    }
  }, [dispatch, userInfo?._id, successMessage])

  const hasPurchased = useMemo(() => {
    if (!product) return false
    return myOrders?.some(order =>
      order.payment_status === 'paid' &&
      order.delivery_status === 'pending' &&
      order.products?.some(p => p.productId === product._id)
    ), [product, myOrders]
  })

  //    const hasPurchased = useMemo(() => {
  //     if (!product) return false
  //     return myOrders?.some(order => 
  //       order.payment_status === 'paid' &&
  //       order.delivery_status === 'delivered' &&
  //       order.products?.some(p => p.productId === product._id)
  //   ), [product, myOrders]) // Add proper dependencies

  //   // Rest of your component remains the same
  // }

  const reviewSubmit = (e) => {
    e.preventDefault()
    if (!hasPurchased) {
      toast.error("Purchase required to leave a review")
      return
    }
    dispatch(customer_review({
      name: userInfo?.name,
      review: re,
      rating: rat,
      productId: product?._id
    }))
  }

  const calculateRatingPercentage = (sum) =>
    totalReview ? Math.floor((100 * (sum || 0) / totalReview)) : 0

  const filteredReviews = (reviews || [])
    .filter(r => !selectedRating || r.rating === selectedRating)
    .sort((a, b) => sortBy === 'recent' ?
      new Date(b.date) - new Date(a.date) :
      (b.helpfulCount || 0) - (a.helpfulCount || 0))

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage)
      product?._id && dispatch(get_reviews({ productId: product._id, pageNumber }))
      setRat('')
      setRe('')
      dispatch(messageClear())
    }
  }, [successMessage, dispatch, product, pageNumber])

  useEffect(() => {
    product?._id && dispatch(get_reviews({ productId: product._id, pageNumber }))
  }, [pageNumber, product, dispatch])

  if (!product) return (
    <div className="text-center py-8 text-gray-600">
      <Headers />
      <div className="h-screen flex items-center justify-center">
        Loading reviews...
      </div>
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <Headers />
      <main className="mx-auto px-3 sm:px-4 md:px-6 mt-[5rem] lg:mt-[6rem] pb-8">

        {/* Rating Header */}
        <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mb-1 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3">Customer Reviews</h1>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-center">
              <span className="text-4xl sm:text-5xl font-bold text-orange-600">
                {product?.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-2xl sm:text-3xl text-gray-600">/5</span>
            </div>
            <div className="flex-1">
              <Ratings ratings={product?.rating || 0} />
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                {totalReview} verified reviews
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Rating Breakdown & Form */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">

            {/* Rating Breakdown */}
            <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Rating Breakdown</h2>
              <div className="hidden lg:block space-y-3">
                {[5, 4, 3, 2, 1].map(rating => {
                  const ratingData = rating_review?.find(r => r._id === rating) || { sum: 0 }
                  return (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                      className={`flex items-center w-full p-2 rounded-lg text-sm sm:text-base ${selectedRating === rating ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50'
                        }`}
                    >
                      <span className="w-14 sm:w-20 flex items-center gap-1">
                        {rating}<AiFillStar className="text-orange-400" />
                      </span>
                      <div className="flex-1 h-2 sm:h-3 bg-gray-200 rounded-full mx-2 sm:mx-4">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${calculateRatingPercentage(ratingData.sum)}%` }}
                        />
                      </div>
                      <span className="text-gray-600 w-6 sm:w-8">{ratingData.sum || 0}</span>
                    </button>
                  )
                })}
              </div>

              {/* Mobile Rating Filter */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedRating(null)}
                  className='flex items-center px-3 py-1.5 rounded-full text-sm bg-orange-500 text-white'>
                  All
                </button>
                {[5, 4, 3, 2, 1].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                    className={`flex items-center px-3 py-1.5 rounded-full text-sm ${selectedRating === rating
                      ? 'bg-orange-500 text-white'
                      : 'bg-orange-100 text-orange-800'
                      }`}
                  >
                    {rating} <AiFillStar className="ml-1" />
                  </button>
                ))}
              </div>
            </section>

            {/* Review Form */}
            <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 flex items-center gap-2">
                <AiFillStar className="text-orange-500" />
                Write a Review
              </h2>

              {userInfo ? (
                <div className="space-y-3">
                  {hasPurchased ? (
                    <form onSubmit={reviewSubmit} className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <AiOutlineShopping />
                        <span>Verified Purchase</span>
                      </div>
                      <Rating
                        onChange={setRat}
                        initialRating={rat}
                        emptySymbol={<CiStar className="text-gray-300 text-2xl" />}
                        fullSymbol={<AiFillStar className="text-orange-500 text-2xl" />}
                      />
                      <textarea
                        value={re}
                        required
                        onChange={(e) => setRe(e.target.value)}
                        className="w-full h-32 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Share your experience..."
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 text-sm"
                      >
                        <AiFillStar />
                        Submit Review
                      </button>
                    </form>
                  ) : (
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-sm">
                      <p className="text-orange-800 flex items-center gap-2">
                        <AiOutlineShopping />
                        Purchase required to review
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <Link
                    to="/login"
                    className="text-orange-800 hover:text-orange-900 flex items-center gap-2 text-sm"
                  >
                    <AiOutlineShopping />
                    Login to review
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h3 className="text-lg sm:text-xl font-semibold">{totalReview} Reviews</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredReviews.map((r, i) => (
                  <article key={i} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">{r.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-500">
                          <CiCalendar />
                          {new Date(r.date).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-orange-400 ml-2">
                        <RatingTemp rating={r.rating} />
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base mb-3">{r.review}</p>
                    <div className="flex items-center gap-4 text-gray-500 text-xs sm:text-sm">
                      <button className="flex items-center gap-1 hover:text-orange-600">
                        <AiOutlineLike className="text-sm sm:text-lg" />
                        <span>Helpful ({r.helpfulCount || 0})</span>
                      </button>
                      <button className="hover:text-orange-600">Report</button>
                    </div>
                  </article>
                ))}
              </div>

              {totalReview > perPage && (
                <div className="mt-6">
                  <Pagination
                    pageNumber={pageNumber}
                    setPageNumber={setPageNumber}
                    totalItem={totalReview}
                    perPage={perPage}
                    showItem={3}
                    btnClass="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 text-sm"
                  />
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CustomerReview