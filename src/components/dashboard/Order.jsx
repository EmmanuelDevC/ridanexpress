import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FiPackage, FiCopy, FiCheckCircle, FiTruck, FiHome, 
  FiUser, FiMapPin, FiMail, FiDownload, FiShare2, 
  FiX, FiMessageSquare, FiFacebook, FiMail as FiEmailIcon
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { get_order } from '../../store/reducers/orderReducer';

// Custom hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// ExportButton component
const ExportButton = ({ orderId, orderData }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const isMobile = useIsMobile();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setMenuOpen(false);
        setSubMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSubMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Generate PDF
  const generatePDF = useCallback(async () => {
    setGeneratingPDF(true);
    try {
      // Dynamically import heavy libraries
      const [html2canvas, jspdf] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const element = document.getElementById('order-container');
      if (!element) throw new Error('Order container not found');

      const canvas = await html2canvas.default(element, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf.default('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`order-${orderId}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    } finally {
      setGeneratingPDF(false);
      setMenuOpen(false);
    }
  }, [orderId]);

  // Share order - FIXED FUNCTION
  const shareOrder = useCallback((platform) => {
    const orderUrl = window.location.href;
    const message = `Check out my order details: ${orderUrl}`;
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(orderUrl)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=Order%20Details&body=${encodeURIComponent(message)}`;
        break;
      default:
        break;
    }
    
    toast.info(`Sharing via ${platform}`);
    setMenuOpen(false);
    setSubMenuOpen(false);
  }, []);

  // Menu variants for animations
  const menuVariants = {
    hidden: { 
      opacity: 0, 
      y: isMobile ? 50 : -20,
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: isMobile ? 50 : -20,
      scale: 0.95,
      transition: { 
        duration: 0.15 
      } 
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        aria-haspopup="true"
        aria-expanded={menuOpen}
        aria-label="Export options"
      >
        <FiDownload className="text-gray-700" />
        <span className="hidden sm:inline text-sm font-medium">Download reciept</span>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className={`absolute z-50 mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden ${
              isMobile 
                ? 'fixed bottom-0 left-0 right-0 rounded-b-none w-full max-w-md mx-auto'
                : 'right-0'
            }`}
            role="menu"
            aria-orientation="vertical"
          >
            {isMobile && (
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold text-gray-900">Export Order</h3>
                <button 
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1 hover:bg-gray-100 rounded-md"
                >
                  <FiX className="text-gray-500 text-lg" />
                </button>
              </div>
            )}
            
            <ul>
              <li>
                <button
                  onClick={generatePDF}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  role="menuitem"
                  disabled={generatingPDF}
                >
                  <FiDownload className="text-indigo-600" />
                  <span className="flex-1">
                    {generatingPDF ? 'Generating...' : 'Download as PDF'}
                  </span>
                  {generatingPDF && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                  )}
                </button>
              </li>
              
              <li 
                onMouseEnter={!isMobile ? () => setSubMenuOpen(true) : undefined}
                onClick={isMobile ? () => setSubMenuOpen(true) : undefined}
                className="relative"
              >
                {/* <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  role="menuitem"
                  aria-haspopup="true"
                  aria-expanded={subMenuOpen}
                >
                  <FiShare2 className="text-indigo-600" />
                  <span className="flex-1">Share Order</span>
                </button> */}
                
                <AnimatePresence>
                  {subMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: isMobile ? 0 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`bg-white rounded-lg shadow-lg ${
                        isMobile
                          ? 'fixed bottom-0 left-0 right-0 rounded-b-none'
                          : 'absolute top-0 right-full mr-1'
                      }`}
                      role="menu"
                    >
                      {isMobile && (
                        <div className="flex items-center gap-3 p-4 border-b">
                          <button 
                            onClick={() => setSubMenuOpen(false)}
                            aria-label="Back"
                            className="p-1"
                          >
                            <FiX className="text-lg" />
                          </button>
                          <h3 className="font-semibold">Share Via</h3>
                        </div>
                      )}
                      
                      <ul>
                        {['whatsapp', 'facebook', 'email'].map((platform) => (
                          <li key={platform}>
                            <button
                              onClick={() => shareOrder(platform)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                              role="menuitem"
                            >
                              {platform === 'whatsapp' && <FiMessageSquare className="text-green-500" />}
                              {platform === 'facebook' && <FiFacebook className="text-blue-600" />}
                              {platform === 'email' && <FiEmailIcon className="text-gray-600" />}
                              <span className="capitalize">{platform}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Order Component
const Order = () => {
  const [isCopied, setIsCopied] = useState(false);
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { myOrder } = useSelector(state => state.order);
  const { userInfo } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(get_order(orderId));
  }, [dispatch, orderId]);

  if (!myOrder?._id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing order details...</p>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setIsCopied(true);
      toast.success('Order ID copied to clipboard!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy Order ID', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
      });
      console.error('Failed to copy text: ', err);
    }
  };

  const statusStyles = {
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <FiCheckCircle className="w-4 h-4" /> },
    placed: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: <FiCheckCircle className="w-4 h-4" /> },
    pending: { bg: 'bg-orange-50', text: 'text-orange-700', icon: <FiCheckCircle className="w-4 h-4" /> },
    unpaid: { bg: 'bg-amber-50', text: 'text-amber-700' },
    cancelled: { bg: 'bg-red-200', text: 'text-amber-700' },
    delivered: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: <FiTruck className="w-4 h-4" /> },
  };

  const formatDate = dateString => {
    try {
      return dateString
        ? format(parseISO(dateString), 'MMM dd, yyyy - hh:mm a')
        : 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <motion.div
      id="order-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 lg:py-8 px-1 lg:px-8"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-[#c48a47] uppercase">
              Order Info
            </h1>
            <ExportButton orderId={orderId} orderData={myOrder} />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <div className="flex flex-col lg:flex-row gap-1">
                <h2 className="lg:text-2xl mr-4 font-bold text-gray-900 flex items-center gap-1">
                  <FiPackage className="text-indigo-600" />
                  <span>Order ID</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-gray-600">{orderId}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors group"
                    aria-label="Copy order ID"
                  >
                    {isCopied ? (
                      <FiCheckCircle className="text-emerald-500 animate-pulse" />
                    ) : (
                      <FiCopy className="text-gray-500 group-hover:text-indigo-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
              <ToastContainer />
              <p className="text-gray-500 text-sm mt-1">
                Placed on {formatDate(myOrder.createdAt)}
              </p>
            </div>

            <div className="mt-4 sm:mt-0 space-y-2">
              {['payment_status', 'delivery_status'].map(key => (
                <div key={key} className="flex gap-3 items-center">
                  <p className="text-sm lg:text-lg">
                    {key === 'payment_status' ? 'Payment Status:' : 'Delivery Status:'}
                  </p>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${statusStyles[myOrder[key]]?.bg} ${statusStyles[myOrder[key]]?.text}`}
                  >
                    {statusStyles[myOrder[key]]?.icon}
                    <span className="ml-1.5 capitalize">{myOrder[key]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Shipping Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <FiHome className="text-indigo-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Shipping Details
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Delivery information for this order
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiUser className="text-gray-500 w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Recipient Name
                  </p>
                  <p className="text-gray-900 font-medium">
                    {myOrder.shippingInfo?.name}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 transition-all hover:bg-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <FiMapPin className="text-gray-500 w-4 h-4" />
                  <p className="text-xs font-medium text-gray-500">
                    Full Address
                  </p>
                </div>
                <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm">
                  <span className="text-gray-500 font-medium">Address:</span>
                  <span className="text-gray-900">
                    {myOrder.shippingInfo?.address}
                  </span>

                  <span className="text-gray-500 font-medium">Area:</span>
                  <span className="text-gray-900">
                    {myOrder.shippingInfo?.area}
                  </span>

                  <span className="text-gray-500 font-medium">City:</span>
                  <span className="text-gray-900">
                    {myOrder.shippingInfo?.city}
                  </span>

                  <span className="text-gray-500 font-medium">Province:</span>
                  <span className="text-gray-900">
                    {myOrder.shippingInfo?.province}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiMail className="text-gray-500 w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Contact Email
                  </p>
                  <p className="text-indigo-600 font-medium break-all">
                    {userInfo.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-green-500">₦</span>
              Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  {myOrder.price && formatCurrency(myOrder.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-medium text-black">
                  {myOrder.price && formatCurrency(myOrder.price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="rounded-xl shadow-sm p-4 mb-6 bg-[#191919] sm:p-6">
          <h3 className="text-base sm:text-lg text-white font-semibold mb-4 sm:mb-6">
            Order Items ({myOrder.products?.length || 0})
          </h3>
          <div className="space-y-3 mb-20">
            {myOrder.products?.map((product, index) => {
              // Add proper fallbacks and ensure data structure
              const productData = {
                name: product.name || 'Unnamed Product',
                brand: product.brand || 'Generic Brand',
                images: product.images || [],
                price: product.price || 0,
                discount: product.discount || 0,
                quantity: product.quantity || null,
                productId: product.productId || ''
              };

              return (
                <motion.div
                  key={product._id || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                    <img
                      src={productData.images[0] || '/placeholder.png'}
                      alt={productData.name}
                      className="w-full h-full object-cover rounded-md border"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                        e.target.alt = 'Product image not available';
                      }}
                    />
                  </div>

                  <div className="ml-2 sm:ml-4 flex-1 min-w-0">
                    <Link
                      to={`/product/${productData.productId}`}
                      className="text-sm sm:text-base font-medium line-clamp-1 text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {productData.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 items-center">
                      <span className="text-xs sm:text-sm text-gray-500">
                        Brand: {productData.brand}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        Qty: {productData.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="ml-2 sm:ml-4 text-right flex-shrink-0">
                    {productData.discount > 0 && (
                      <p className="text-xs lg:text-lg font-bold text-[#c48a47] mt-1">
                        {formatCurrency(
                          productData.price - (productData.price * productData.discount) / 100)
                        }
                      </p>
                    )}
                    <p className="text-xs line-through text-gray-500">
                      {formatCurrency(productData.price)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Order;