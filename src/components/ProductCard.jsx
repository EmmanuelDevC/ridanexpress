import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Ratings from './Ratings';
import { add_to_card, messageClear } from '../store/reducers/cardReducer';

const ProductCard = ({ product, isAdmin = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const { successMessage, errorMessage } = useSelector(state => state.card);

  // Generate product URL based on available data
  const getProductUrl = () => {
    if (product.slug) {
      return `/product/details/${product.slug}`;
    } else if (product.id || product._id) {
      // Fallback to ID if slug is not available
      return `/product/details/id/${product.id || product._id}`;
    }
    return '#'; // Return a fallback URL if neither is available
  };

  // Add to cart handler
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

  // Toast notifications
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

  return (
    <div className='bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col'>
      <Link to={getProductUrl()} className='relative flex-1'>

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className='absolute right-1 top-1 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-semibold z-10'>
            {product.discount}% OFF
          </div>
        )}

        {/* Product Image */}
        <div className='aspect-square overflow-hidden'>
          <img
            src={product.images ? product.images[0] : product.image}
            alt={product.name}
            className='w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105'
            loading='lazy'
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="relative py-3 px-2 text-gray-700">
        <Link to={getProductUrl()} className='hover:text-orange-600'>
          <h2 className="text-sm md:text-base font-semibold line-clamp-1">{product.name}</h2>
        </Link>

        {/* Ratings */}
        <div className="flex items-center my-1 gap-1">
          <Ratings ratings={product.rating} />
          <span className="text-xs text-gray-500">({product.rating})</span>
        </div>

        {/* Price Section */}
        <div className="flex flex-row flex-wrap items-center gap-2 md:gap-1">
          <span className="text-[15px] font-base text-black">
            ₦ {(product.price - (product.price * product.discount) / 100).toLocaleString()}
          </span>
          {product.discount > 0 && (
            <del className="text-gray-500 text-[13px] font-base">
              ₦ {product.price.toLocaleString()}
            </del>
          )}
        </div>

        {/* Stock Info */}
        <p className="text-sm text-gray-500 mt-1">{product.stock} in stock</p>

        {/* Add to Cart Button */}
        <div className='flex flex-col gap-2 mt-2'>
          <button
            onClick={(e) => add_card(product._id || product.id, e)}
            className='px-4 py-2 flex items-center justify-center gap-2 bg-gray-700 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:bg-orange-600 hover:shadow-xl active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-white font-medium'
            aria-label="Add to cart"
          >
            <span>Add to cart</span>
            <ShoppingCartOutlinedIcon className='w-5 h-5' />
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProductCard;