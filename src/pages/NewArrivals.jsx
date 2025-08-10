import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Range } from 'react-range';
import productBanner from '../assets/Images/banner/productBanner.png';
import productBanner2 from '../assets/Images/banner/productBanner2.png';
import { MdOutlineKeyboardArrowRight, MdFilterList, MdClose } from 'react-icons/md';
import Headers from '../components/Headers';
import Footer from '../components/Footer';
import { AiFillStar, AiFillHeart } from 'react-icons/ai';
import { CiStar } from 'react-icons/ci';
import { BsFillGridFill, BsListUl } from 'react-icons/bs';
import Pagination from '../components/Pagination';
import Ratings from '../components/Ratings';
import { price_range_product, query_products, get_category } from '../store/reducers/homeReducer';
import { add_to_card, messageClear, add_to_wishlist } from '../store/reducers/cardReducer';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { toast } from 'react-toastify';
import Skeleton from "@mui/material/Skeleton";

const NewArrivals = ({ isAdmin = false }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector(state => state.auth);
    const { successMessage, errorMessage } = useSelector(state => state.card);
    const { products, totalProduct, categorys, priceRange, parPage } = useSelector(state => state.home);

    const [pageNumber, setPageNumber] = useState(1);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRangeLoaded, setPriceRangeLoaded] = useState(false);
    const [priceRangeValues, setPriceRangeValues] = useState([0, 1000]);
    const [ratingFilter, setRatingFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [isLoading, setIsLoading] = useState(true);

    // Filter products based on user role and approval status
    const getVisibleProducts = () => {
        if (isAdmin) {
            return products;
        } else {
            return products.filter(p => p.status === 'approved');
        }
    };

    const visibleProducts = getVisibleProducts();

    useEffect(() => {
        dispatch(price_range_product());
        dispatch(get_category());

        // Simulate loading delay for skeletons
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [dispatch]);

    useEffect(() => {
        if (priceRange.low && priceRange.high) {
            setPriceRangeValues([priceRange.low, priceRange.high]);
            setPriceRangeLoaded(true);
        }
    }, [priceRange]);

    useEffect(() => {
        dispatch(query_products({
            low: priceRangeValues[0],
            high: priceRangeValues[1],
            category: categoryFilter,
            rating: ratingFilter,
            sortPrice: sortOption,
            pageNumber
        }));
    }, [priceRangeValues, categoryFilter, ratingFilter, pageNumber, sortOption, dispatch]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(messageClear());
        }
        if (errorMessage) {
            toast.error(errorMessage);
            dispatch(messageClear());
        }
    }, [errorMessage, successMessage, dispatch]);

    const add_card = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (userInfo) {
            dispatch(add_to_card({
                userId: userInfo.id,
                quantity: 1,
                productId: id
            }));
        } else {
            navigate('/login');
        }
    };

    const add_wishlist = (pro, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (userInfo) {
            dispatch(add_to_wishlist({
                userId: userInfo.id,
                productId: pro._id,
                name: pro.name,
                price: pro.price,
                image: pro.images[0],
                discount: pro.discount,
                rating: pro.rating,
                slug: pro.slug
            }));
        } else {
            navigate('/login');
        }
    };

    const resetFilters = () => {
        setRatingFilter('');
        setCategoryFilter('');
        if (priceRange.low && priceRange.high) {
            setPriceRangeValues([priceRange.low, priceRange.high]);
        }
        setSortOption('newest');
        // Close sidebar on mobile after resetting
        if (window.innerWidth < 1024) {
            setShowFilters(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0
        }).format(price).replace('NGN', '₦');
    };

    // Product Card Component with Admin Badges
    const ProductCard = ({ product }) => {
        const p = product;
        return (
            <Link
                to={`/product/details/${p.slug}`}
                className='relative flex-1 group'
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

                            {p.discount > 0 && (
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
        );
    };

    // Skeleton Loading Component
    const ProductSkeleton = () => (
        <div className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 ${viewMode === 'grid' ? '' : 'flex items-center gap-6 p-4'
            }`}>
            <div className={viewMode === 'grid' ? 'relative' : 'w-1/4'}>
                <Skeleton
                    variant="rectangular"
                    className={`${viewMode === 'grid' ? 'w-full h-48' : 'w-full h-32'}`}
                    animation="wave"
                />
            </div>

            <div className={viewMode === 'grid' ? 'p-4' : 'flex-1'}>
                <Skeleton variant="text" width={120} height={24} />
                <div className="flex items-center gap-1 mt-3">
                    <Skeleton variant="text" width={100} height={20} />
                </div>
                <Skeleton variant="text" width={80} height={28} className="mt-2" />
                {viewMode === 'list' && (
                    <>
                        <Skeleton variant="text" width="100%" height={16} className="mt-2" />
                        <Skeleton variant="text" width="80%" height={16} className="mt-1" />
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Headers />
            <section className='mt-0 lg:mt-[8rem]'>

                {/* Mobile Breadcrumb */}
                <div className="lg:hidden bg-gray-900 shadow-sm mt-[4rem] lg:mt-0 py-2 pb-3 px-4">
                    <div className="flex items-center text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
                        <Link to="/" className="hover:text-amber-200 text-white">Home</Link>
                        <MdOutlineKeyboardArrowRight className="mx-1 text-amber-200" />
                        <span className="hover:text-amber-200 text-white font-medium">New Arrivals</span>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 container mx-auto px-1 lg:py-10 pb-16 lg:pb-0">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Filters Sidebar - Overlay on mobile */}
                        {showFilters && (
                            <div 
                                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                                onClick={() => setShowFilters(false)}
                            />
                        )}
                        
                        <aside className={`fixed lg:static top-0 left-0 h-full w-4/5 max-w-sm lg:w-80 bg-white z-50 lg:z-0 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out ${showFilters ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                            <div className="rounded-xl p-6 h-full overflow-y-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={resetFilters}
                                            className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                                        >
                                            Reset
                                        </button>
                                        <button 
                                            onClick={() => setShowFilters(false)}
                                            className="lg:hidden text-gray-500 hover:text-gray-700"
                                        >
                                            <MdClose size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div className="mb-8">
                                    <h3 className="font-semibold mb-4 text-gray-700">Category</h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {categorys.map((c, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id={c.name}
                                                    checked={categoryFilter === c.name}
                                                    onChange={(e) => setCategoryFilter(e.target.checked ? c.name : '')}
                                                    className="form-checkbox h-4 w-4 text-orange-600"
                                                />
                                                <label htmlFor={c.name} className="text-gray-600">
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
                                        {priceRangeLoaded && priceRange.low && priceRange.high ? (
                                            <>
                                                <Range
                                                    step={100}
                                                    min={priceRange.low}
                                                    max={priceRange.high}
                                                    values={priceRangeValues}
                                                    onChange={(values) => setPriceRangeValues(values)}
                                                    renderTrack={({ props, children }) => (
                                                        <div
                                                            {...props}
                                                            className="h-2 bg-gray-200 rounded-full"
                                                            style={{ ...props.style }}
                                                        >
                                                            {children}
                                                        </div>
                                                    )}
                                                    renderThumb={({ props }) => (
                                                        <div
                                                            {...props}
                                                            className="w-5 h-5 bg-orange-600 rounded-full shadow-lg focus:outline-none"
                                                            style={{
                                                                ...props.style,
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <div className="flex justify-between mt-2 text-sm text-gray-600">
                                                    <span>{formatPrice(priceRangeValues[0])}</span>
                                                    <span>{formatPrice(priceRangeValues[1])}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                Loading price range...
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rating Filter */}
                                <div className="border-t pt-6">
                                    <h3 className="font-semibold mb-4 text-gray-700">Customer Rating</h3>
                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map((stars) => (
                                            <button
                                                key={stars}
                                                onClick={() => setRatingFilter(ratingFilter === stars ? '' : stars)}
                                                className={`flex items-center gap-3 w-full p-2 rounded-lg ${ratingFilter === stars
                                                    ? 'bg-orange-50 border border-orange-200'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) =>
                                                        i < stars ? (
                                                            <AiFillStar key={i} size={18} />
                                                        ) : (
                                                            <CiStar key={i} size={18} />
                                                        )
                                                    )}
                                                </div>
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
                            {/* Responsive Product Banner */}
                            <section className='hidden lg:block mb-3 w-full'>
                                <div className="relative md:aspect-[4/1] overflow-hidden  lg:rounded-xl lg:shadow-md">
                                    <img
                                        src={productBanner}
                                        alt="New Arrivals Banner"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </section>

                            {/* Products Header */}
                            <div className="bg-white hidden lg:block rounded-xl shadow-sm p-3 mb-3">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex  items-center gap-4">
                                        <button
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="lg:hidden flex items-center gap-2 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700"
                                        >
                                            <MdFilterList size={18} />
                                            Filters
                                        </button>
                                        <span className="text-gray-700 font-medium">
                                            {totalProduct} {totalProduct === 1 ? 'product' : 'products'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <select
                                            value={sortOption}
                                            onChange={(e) => setSortOption(e.target.value)}
                                            className="py-2 pl-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 text-gray-700"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                            <option value="low-to-high">Price: Low to High</option>
                                            <option value="high-to-low">Price: High to Low</option>
                                        </select>

                                        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`p-2 rounded-md ${viewMode === 'grid'
                                                    ? 'bg-white text-orange-600 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                <BsFillGridFill size={18} />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`p-2 rounded-md ${viewMode === 'list'
                                                    ? 'bg-white text-orange-600 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                <BsListUl size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <section className='block lg:hidden my-2 w-full'>
                                <div className="relative md:aspect-[4/1] overflow-hidden rounded-xl lg:shadow-md">
                                    <img
                                        src={productBanner2}
                                        alt="New Arrivals Banner"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </section>

                            {/* Products Grid */}
                            {isLoading ? (
                                <div className={
                                    viewMode === 'grid'
                                        ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-1'
                                        : 'space-y-4'
                                }>
                                    {[1, 2, 3, 4, 5, 6].map((_, index) => (
                                        <ProductSkeleton key={index} />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className={
                                        viewMode === 'grid'
                                            ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1'
                                            : 'space-y-4'
                                    }>
                                        {visibleProducts.length > 0 ? (
                                            visibleProducts.map((product) => (
                                                <ProductCard key={product._id} product={product} />
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-12">
                                                <p className="text-xl text-gray-500">No products found matching your filters</p>
                                                <button
                                                    onClick={resetFilters}
                                                    className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                                >
                                                    Reset Filters
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    {totalProduct > parPage && visibleProducts.length > 0 && (
                                        <div className="mt-8">
                                            <Pagination
                                                pageNumber={pageNumber}
                                                setPageNumber={setPageNumber}
                                                totalItem={totalProduct}
                                                parPage={parPage}
                                                showItem={Math.floor(totalProduct / parPage)}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>

                {/* Sticky Filter Button for Mobile */}
                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg py-3 px-4 flex justify-center lg:hidden z-30 border-t">
                    <button
                        onClick={() => setShowFilters(true)}
                        className="w-full max-w-md flex items-center justify-center gap-2 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700"
                    >
                        <MdFilterList size={20} />
                        Show Filters
                    </button>
                </div>
            </section>

            <div className="hidden lg:block">
                <Footer />
            </div>
        </div>
    );
};

export default NewArrivals;