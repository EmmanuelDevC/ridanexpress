import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    get_seller_details,
    get_seller_products
} from '../store/reducers/sellerReducer'
import { add_to_card } from '../store/reducers/cardReducer'
import { MdLocationOn, MdOutlineKeyboardArrowRight, MdFilterList } from 'react-icons/md'
import { BsFillGridFill, BsListUl } from 'react-icons/bs'
import { Range } from 'react-range'
import Pagination from '../components/Pagination'
import Ratings from '../components/Ratings'
import Loader from '../components/Loader'
import Headers from '../components/Headers'
import Footer from '../components/Footer'
import { FiPackage, FiCalendar } from 'react-icons/fi'
import { AiOutlineShoppingCart } from 'react-icons/ai'

const ProductCard = ({ product, viewMode }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { userInfo } = useSelector(state => state.auth)

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(price)
    }

    const add_card = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (userInfo) {
            dispatch(add_to_card({
                userId: userInfo.id,
                quantity: 1,
                productId: product._id,
                sellerId: product.sellerId
            }))
        } else {
            navigate('/login')
        }
    }

    return (
        <Link
            to={`/product/details/${product.slug}`}
            className={`group block ${viewMode === 'grid'
                ? 'bg-white rounded-lg shadow-sm transition-all duration-300 group overflow-hidden flex flex-col p-2'
                : 'flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm'
                }`}
        >
            <div className={`relative ${viewMode === 'grid' ? 'mb-3' : 'w-3 flex-shrink-0'}`}>
                <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className={`object-contain ${viewMode === 'grid'
                        ? 'w-full h-48'
                        : 'w-full h-32'
                        }`}
                />
                {product.discount > 0 && (
                    <div className="absolute left-1 top-1 bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-semibold z-10">
                        {product.discount}% OFF
                    </div>
                )}
            </div>

            <div className={`flex-1 ${viewMode === 'list' ? 'min-w-0' : ''}`}>
                <h3 className={`font-medium text-gray-800 ${viewMode === 'grid'
                    ? 'text-sm md:text-base font-semibold mb-1 line-clamp-1'
                    : 'text-base mb-1'
                    }`}>
                    {product.name}
                </h3>

                <div className="flex items-center gap-1 mb-2">
                    <Ratings ratings={product.rating} size={viewMode === 'grid' ? '14px' : '16px'} />
                    <span className="text-xs text-gray-500">({product.rating})</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`${viewMode === 'grid'
                        ? 'text-base'
                        : 'text-lg'
                        } text-[15px] font-semibold text-gray-700`}>
                        {formatPrice(product.price - (product.price * product.discount / 100))}
                    </span>
                    {product.discount > 0 && (
                        <del className={`${viewMode === 'grid'
                            ? 'text-xs'
                            : 'text-sm'
                            } text-gray-400`}>
                            {formatPrice(product.price)}
                        </del>
                    )}
                </div>

                <button
                    onClick={add_card}
                    className={`mt-3 w-full flex items-center justify-center gap-2 ${product.stock > 0
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-gray-400 cursor-not-allowed'
                        } text-white py-2 rounded-lg transition-colors`}
                    disabled={product.stock <= 0}
                >
                    <AiOutlineShoppingCart className="text-lg" />
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </Link>
    )
}

const Seller = () => {
    const { sellerId } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {
        sellerDetails,
        sellerProducts,
        totalProducts,
        currentPage,
        parPage,
        loadingDetails,
        loadingProducts
    } = useSelector(state => state.seller)

    const [viewMode, setViewMode] = useState('grid')
    const [showFilters, setShowFilters] = useState(false)
    const [priceRange, setPriceRange] = useState({ low: 0, high: 1000 })
    const [priceRangeValues, setPriceRangeValues] = useState([0, 1000])
    const [ratingFilter, setRatingFilter] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [sortOption, setSortOption] = useState('')
    const [sellerCategories, setSellerCategories] = useState([])

    useEffect(() => {
        dispatch(get_seller_details(sellerId)).then(({ payload }) => {
            if (payload?.seller) {
                const categories = [...new Set(payload.seller.products?.map(p => p.category))]
                setSellerCategories(categories.map(c => ({ name: c })))
                const prices = payload.seller.products?.map(p => p.price)
                setPriceRange({
                    low: Math.min(...prices),
                    high: Math.max(...prices)
                })
                setPriceRangeValues([Math.min(...prices), Math.max(...prices)])
            }
        })
    }, [dispatch, sellerId])

    useEffect(() => {
        dispatch(get_seller_products({
            sellerId,
            page: currentPage,
            parPage,
            minPrice: priceRangeValues[0],
            maxPrice: priceRangeValues[1],
            category: categoryFilter,
            rating: ratingFilter,
            sort: sortOption
        }))
    }, [currentPage, priceRangeValues, categoryFilter, ratingFilter, sortOption])

    const resetFilters = () => {
        setRatingFilter('')
        setCategoryFilter('')
        setPriceRangeValues([priceRange.low, priceRange.high])
        setSortOption('')
    }

    if (loadingDetails) return <Loader fullScreen={true} />

    return (
        <div className="min-h-screen bg-gray-50">
            <Headers />
            {/* Seller Header */}
            <div className="relative bg-gradient-to-r from-black to-indigo-900 mt-14 md:mt-[8rem] lg:mt-[7rem] shadow-lg">
                <div className="absolute inset-0 bg-noise-pattern opacity-20"></div>
                <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                    <div className="flex flex-row md:flex-row items-center gap-3 text-white">
                        {/* Seller Avatar with Glow Effect */}
                        <div className="relative group w-24 h-24 shrink-0">
                            <div className="absolute inset-0 bg-indigo-400/30 blur-lg rounded-full animate-pulse"></div>
                            <div className="relative w-24 h-24 rounded-full border-4 border-white/10 overflow-hidden shadow-xl">
                                <img
                                    src={sellerDetails?.image || '/default-seller.jpg'}
                                    alt={sellerDetails?.shopInfo?.shopName}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform"
                                    onError={(e) => e.target.src = '/default-seller.jpg'}
                                />
                            </div>
                        </div>

                        {/* Seller Info */}
                        <div className="flex-1 hidden lg:block text-center md:text-left space-y-3">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">
                                    {sellerDetails?.shopInfo?.shopName}
                                </h1>
                                {sellerDetails?.isVerified && (
                                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm flex items-center gap-1">
                                        <FiCheckCircle className="shrink-0" />
                                        Verified Seller
                                    </span>
                                )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:flex gap-1 text-sm md:text-base">
                                {/* <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                                    <MdLocationOn className="text-indigo-300 shrink-0" />
                                    <span className="line-clamp-1 hover:line-clamp-none transition-all">
                                        {[
                                            sellerDetails?.shopInfo?.sub_district,
                                            sellerDetails?.shopInfo?.district,
                                            sellerDetails?.shopInfo?.division
                                        ].filter(Boolean).join(', ') || 'Location not specified'}
                                    </span>
                                </div> */}

                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                                    <FiPackage className="text-indigo-300" />
                                    <span>{totalProducts} Products</span>
                                </div>

                                <div className="flex justify-around item-center text-left gap-2 bg-white/5 px-4 py-2 rounded-full">
                                    <FiCalendar className="text-indigo-300 text-xl" />
                                    <span className='text-sm'>Vendor since {new Date(sellerDetails?.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long'
                                    })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 block lg:hidden text-center md:text-left space-y-3">
                            <div className="flex flex-col items-center gap-1">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">
                                    {sellerDetails?.shopInfo?.shopName}
                                </h1>
                                <div className="flex justify-around item-center text-left gap-2 bg-white/5 px-4 py-2 rounded-full">
                                    <FiCalendar className="text-indigo-300 text-xl" />
                                    <span className='text-sm'>Vendor since {new Date(sellerDetails?.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long'
                                    })}</span>
                                </div>
                                {/* {sellerDetails?.isVerified && (
                                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm flex items-center gap-1">
                                        <FiCheckCircle className="shrink-0" />
                                        Verified Seller
                                    </span>
                                )} */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-1">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters Sidebar */}
                    <aside className={`w-80 lg:w-80 transform transition-all duration-300 ${showFilters
                        ? 'translate-x-0'
                        : '-translate-x-full lg:translate-x-0'
                        } fixed lg:relative inset-0 z-50 lg:z-auto bg-white lg:bg-transparent`}>
                        <div className="h-full lg:h-auto lg:sticky lg:top-6 bg-white lg:rounded-xl lg:shadow-sm p-4 lg:p-6 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                                <div className="flex gap-3">
                                    <button
                                        onClick={resetFilters}
                                        className="text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="lg:hidden bg-orange-500 px-2 text-2xl rounded-lg text-white"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-8">
                                <h3 className="font-semibold mb-4 text-gray-700">Category</h3>
                                <div className="space-y-2">
                                    {sellerCategories.map((c, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={c.name}
                                                checked={categoryFilter === c.name}
                                                onChange={(e) => setCategoryFilter(e.target.checked ? c.name : '')}
                                                className="form-checkbox h-4 w-4 text-indigo-600"
                                            />
                                            <label htmlFor={c.name} className="text-gray-600 text-sm">
                                                {c.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div className="mb-8">
                                <h3 className="font-semibold mb-4 text-gray-700">Price Range</h3>
                                <div className="mb-4">
                                    <Range
                                        step={100}
                                        min={priceRange.low}
                                        max={priceRange.high}
                                        values={priceRangeValues}
                                        onChange={setPriceRangeValues}
                                        renderTrack={({ props, children }) => (
                                            <div
                                                {...props}
                                                className="h-2 bg-gray-200 rounded-full"
                                            >
                                                {children}
                                            </div>
                                        )}
                                        renderThumb={({ props }) => (
                                            <div
                                                {...props}
                                                className="w-5 h-5 bg-indigo-600 rounded-full shadow-lg"
                                            />
                                        )}
                                    />
                                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                                        <span>₦{priceRangeValues[0]?.toLocaleString()}</span>
                                        <span>₦{priceRangeValues[1]?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rating Filter */}
                            <div className="border-t pt-6">
                                <h3 className="font-semibold mb-4 text-gray-700">Rating</h3>
                                <div className="space-y-2">
                                    {[5, 4, 3, 2, 1].map((stars) => (
                                        <button
                                            key={stars}
                                            onClick={() => setRatingFilter(ratingFilter === stars ? '' : stars)}
                                            className={`flex items-center gap-3 w-full p-2 rounded-lg ${ratingFilter === stars
                                                ? 'bg-indigo-50 border border-indigo-200'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <Ratings ratings={stars} />
                                            <span className="text-gray-600 text-sm">
                                                {stars === 5 ? '5 Stars' : `${stars}+ Stars`}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Products Section */}
                    <div className="flex-1">
                        {/* Products Header */}
                        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="lg:hidden flex items-center gap-2 bg-gray-900 text-white py-2 px-4 rounded-lg"
                                    >
                                        <MdFilterList size={18} />
                                        Filters
                                    </button>
                                    <span className="text-gray-700 font-medium text-sm md:text-base">
                                        Showing {totalProducts} products
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        className="py-2 pl-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 text-gray-700 text-sm md:text-base"
                                    >
                                        <option value="">Sort by</option>
                                        <option value="price-asc">Price: Low to High</option>
                                        <option value="price-desc">Price: High to Low</option>
                                        <option value="rating">Rating</option>
                                    </select>

                                    <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-md ${viewMode === 'grid'
                                                ? 'bg-white text-indigo-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            <BsFillGridFill size={18} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-md ${viewMode === 'list'
                                                ? 'bg-white text-indigo-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            <BsListUl size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loadingProducts ? (
                            <Loader />
                        ) : (
                            <div className={`grid ${viewMode === 'grid'
                                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
                                : 'grid-cols-1'
                                } gap-2`}>
                                {sellerProducts.map(product => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        viewMode={viewMode}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalProducts > parPage && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={Math.ceil(totalProducts / parPage)}
                                    onPageChange={(page) => dispatch(get_seller_products({
                                        sellerId,
                                        page,
                                        parPage
                                    }))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <div className='hidden lg:block'>
                <Footer />
            </div>
        </div>
    )
}

export default Seller