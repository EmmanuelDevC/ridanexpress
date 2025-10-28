import React, { useState, useEffect, useRef } from 'react';
import Headers from '../components/Headers';
import Footer from '../components/Footer';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  MdOutlineKeyboardArrowRight,
  MdLocationOn,
  MdEdit,
  MdStore,
  MdLocalShipping,
  MdCheckCircle,
  MdWarning,
  MdPhone,
  MdMyLocation,
  MdSearch,
  MdPlace,
  MdScale,
  MdShoppingCart,
  MdPayment,
  MdGpsFixed,
  MdGpsNotFixed
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { place_order } from '../store/reducers/orderReducer';
import api from '../api/api';
import {
  Box,
  Alert,
  CircularProgress,
  Chip,
  Typography,
  Card,
  CardContent,
  Snackbar
} from '@mui/material';

// Enhanced Mapbox configuration
const getMapboxConfig = () => {
  const mapboxToken = typeof process !== 'undefined' && process.env && process.env.REACT_APP_MAPBOX_TOKEN
    ? process.env.REACT_APP_MAPBOX_TOKEN
    : "pk.eyJ1IjoiZW1tYW51ZWxkZXYiLCJhIjoiY21oM2U3bG10MHF0dTJqczc1aXY3YXdkeCJ9.t3RnpzcgeMENOAO4lNcjrQ";

  return {
    token: mapboxToken,
    baseUrl: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
    country: 'NG',
    limit: 5,
    types: 'address,place,poi,neighborhood,locality'
  };
};

const MAPBOX_CONFIG = getMapboxConfig();

const Shipping = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const { state: { products, price, items } } = useLocation();

  const [res, setRes] = useState(false);
  const [sellerAddresses, setSellerAddresses] = useState([]);
  const [sellerPhones, setSellerPhones] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [autoCalculationAttempted, setAutoCalculationAttempted] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Enhanced Location state
  const [locationStatus, setLocationStatus] = useState({
    loading: false,
    success: false,
    error: null,
    source: null,
    coordinates: null,
    accuracy: null,
    timestamp: null
  });

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [locationRetryCount, setLocationRetryCount] = useState(0);

  const suggestionsRef = useRef(null);
  const addressInputRef = useRef(null);
  const geolocationWatchId = useRef(null);

  // Show snackbar notification
  const showNotification = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Load customer data from localStorage
  const loadCustomerData = () => {
    try {
      const storedData = localStorage.getItem('customerShippingInfo');
      if (storedData) {
        const data = JSON.parse(storedData);
        return {
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          post: data.post || '',
          province: data.province || '',
          city: data.city || "",
          area: data.area || ""
        };
      }
    } catch (error) {
      console.error('Error loading customer data from localStorage:', error);
    }
    return {
      name: userInfo?.name || '',
      address: '',
      phone: userInfo?.phone || '',
      post: '',
      province: '',
      city: "",
      area: ""
    };
  };

  const [state, setState] = useState(loadCustomerData());

  // ADD THE MISSING FUNCTION - Open location modal
  const openLocationModal = () => {
    setShowLocationModal(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Save customer data to localStorage whenever state changes
  useEffect(() => {
    const saveCustomerData = () => {
      try {
        localStorage.setItem('customerShippingInfo', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving customer data to localStorage:', error);
      }
    };

    const timeoutId = setTimeout(saveCustomerData, 500);
    return () => clearTimeout(timeoutId);
  }, [state]);

  // Enhanced Mapbox configuration check
  const isMapboxConfigured = () => {
    const token = MAPBOX_CONFIG.token;
    const isDefaultToken = token === "pk.eyJ1IjoiZW1tYW51ZWxkZXYiLCJhIjoiY21oM2U3bG10MHF0dTJqczc1aXY3YXdkeCJ9.t3RnpzcgeMENOAO4lNcjrQ";

    if (isDefaultToken) {
      console.warn('Using default Mapbox token - please set REACT_APP_MAPBOX_TOKEN for production');
    }

    if (!token) {
      console.error('Mapbox token is missing');
      return false;
    }

    return token.startsWith('pk.') || token.startsWith('sk.');
  };

  // Enhanced geolocation with better accuracy
  const getEnhancedCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true, // Request high accuracy
        timeout: 20000, // Increased timeout
        maximumAge: 60000 // Don't use cached position older than 1 minute
      };

      // Clear any existing watcher
      if (geolocationWatchId.current) {
        navigator.geolocation.clearWatch(geolocationWatchId.current);
      }

      let positionReceived = false;

      // Use watchPosition for continuous updates until we get a good fix
      geolocationWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Accept position if accuracy is good enough, or after 10 seconds
          if (accuracy < 100 || !positionReceived) { // Accept if accuracy < 100m
            positionReceived = true;
            
            // Clear the watcher
            if (geolocationWatchId.current) {
              navigator.geolocation.clearWatch(geolocationWatchId.current);
            }

            resolve({
              latitude,
              longitude,
              accuracy,
              timestamp: position.timestamp
            });
          }
        },
        (error) => {
          // Clear watcher on error
          if (geolocationWatchId.current) {
            navigator.geolocation.clearWatch(geolocationWatchId.current);
          }

          let errorMessage = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions in your browser settings and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your device location services.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please ensure you have good GPS signal and try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location.';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );

      // Fallback timeout
      setTimeout(() => {
        if (!positionReceived && geolocationWatchId.current) {
          navigator.geolocation.clearWatch(geolocationWatchId.current);
          reject(new Error('Location detection taking too long. Please try again or enter address manually.'));
        }
      }, 15000);
    });
  };

  // Enhanced reverse geocoding with better address parsing
  const reverseGeocodeWithMapbox = async (latitude, longitude) => {
    try {
      if (!isMapboxConfigured()) {
        throw new Error('Mapbox service is not configured properly.');
      }

      const params = new URLSearchParams({
        access_token: MAPBOX_CONFIG.token,
        limit: 1,
        types: 'address,place,neighborhood,locality'
      });

      const response = await fetch(
        `${MAPBOX_CONFIG.baseUrl}/${longitude},${latitude}.json?${params}`
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return {
          address: data.features[0].place_name,
          coordinates: { latitude, longitude }
        };
      }

      return {
        address: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        coordinates: { latitude, longitude }
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        address: `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        coordinates: { latitude, longitude }
      };
    }
  };

  // Enhanced current location handler with retry logic
  const handleUseCurrentLocation = async () => {
    setLocationStatus({ 
      loading: true, 
      success: false, 
      error: null, 
      source: null,
      coordinates: null,
      accuracy: null 
    });

    try {
      showNotification('Getting your current location...', 'info');
      
      const location = await getEnhancedCurrentLocation();
      const result = await reverseGeocodeWithMapbox(location.latitude, location.longitude);

      setState(prev => ({
        ...prev,
        address: result.address
      }));

      setLocationStatus({
        loading: false,
        success: true,
        error: null,
        source: 'browser_geolocation',
        coordinates: result.coordinates,
        accuracy: location.accuracy,
        timestamp: location.timestamp
      });

      setShowLocationModal(false);
      setAutoCalculationAttempted(false);
      setLocationRetryCount(0);

      showNotification('Location found successfully!', 'success');
      console.log('📍 Enhanced current location obtained:', result);

    } catch (error) {
      console.error('Current location error:', error);
      
      const newRetryCount = locationRetryCount + 1;
      setLocationRetryCount(newRetryCount);

      let finalErrorMessage = error.message;
      
      // Suggest manual entry after multiple failures
      if (newRetryCount >= 2) {
        finalErrorMessage += ' Please try entering your address manually.';
      }

      setLocationStatus({
        loading: false,
        success: false,
        error: finalErrorMessage,
        source: null,
        coordinates: null,
        accuracy: null
      });

      showNotification(finalErrorMessage, 'error');
    }
  };

  // Enhanced address search with better error handling
  const searchAddressWithMapbox = async (query) => {
    try {
      if (!isMapboxConfigured()) {
        throw new Error('Mapbox service is not configured properly.');
      }

      const params = new URLSearchParams({
        access_token: MAPBOX_CONFIG.token,
        limit: MAPBOX_CONFIG.limit,
        country: MAPBOX_CONFIG.country,
        types: MAPBOX_CONFIG.types
      });

      const response = await fetch(
        `${MAPBOX_CONFIG.baseUrl}/${encodeURIComponent(query)}.json?${params}`
      );

      if (!response.ok) {
        throw new Error(`Address search failed: ${response.status}`);
      }

      const data = await response.json();
      return data.features || [];
    } catch (error) {
      console.error('Mapbox search error:', error);
      throw error;
    }
  };

  // Handle address search in modal
  const handleAddressSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchAddressWithMapbox(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      showNotification('Failed to search addresses: ' + error.message, 'error');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Select address from search results
  const handleSelectAddress = (feature) => {
    const [longitude, latitude] = feature.center;
    const address = feature.place_name;

    setState(prev => ({
      ...prev,
      address: address
    }));

    setLocationStatus({
      loading: false,
      success: true,
      error: null,
      source: 'mapbox_search',
      coordinates: { latitude, longitude }
    });

    setSearchQuery('');
    setSearchResults([]);
    setShowLocationModal(false);
    setAutoCalculationAttempted(false);

    showNotification('Address selected successfully!', 'success');
  };

  // Select address from automatic suggestions
  const handleSelectSuggestion = (feature) => {
    const [longitude, latitude] = feature.center;
    const address = feature.place_name;

    setState(prev => ({
      ...prev,
      address: address
    }));

    setLocationStatus({
      loading: false,
      success: true,
      error: null,
      source: 'mapbox_autocomplete',
      coordinates: { latitude, longitude }
    });

    setShowSuggestions(false);
    setAddressSuggestions([]);
    setAutoCalculationAttempted(false);

    showNotification('Address selected from suggestions!', 'success');
  };

  // Enhanced address suggestions with debouncing
  const getAddressSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsVerifying(true);
    setLocationStatus(prev => ({ ...prev, loading: true }));

    try {
      const results = await searchAddressWithMapbox(query);
      if (results.length > 0) {
        setAddressSuggestions(results);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Address suggestions error:', error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsVerifying(false);
      setLocationStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Enhanced address input handling
  const handleAddressInputChange = (e) => {
    const value = e.target.value;
    setState(prev => ({
      ...prev,
      address: value
    }));

    if (value.length > 0) {
      setLocationStatus({
        loading: false,
        success: false,
        error: null,
        source: null,
        coordinates: null
      });
      setAutoCalculationAttempted(false);
      setShippingCalculated(false);
    }

    clearTimeout(addressInputRef.current);
    addressInputRef.current = setTimeout(() => {
      getAddressSuggestions(value);
    }, 500);
  };

  // Rest of the existing functions (calculateSellerPackageDetails, determineVehicleId, etc.)
  const calculateSellerPackageDetails = (sellerProducts) => {
    let totalWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let maxHeight = 0;
    let totalItems = 0;
    let totalVolume = 0;

    sellerProducts.forEach(product => {
      const weight = product.productInfo?.weight || 0.5;
      const length = product.productInfo?.length || 10;
      const width = product.productInfo?.width || 10;
      const height = product.productInfo?.height || 10;
      const quantity = product.quantity;

      totalWeight += weight * quantity;
      maxLength = Math.max(maxLength, length);
      maxWidth = Math.max(maxWidth, width);
      maxHeight = Math.max(maxHeight, height);
      totalItems += quantity;
      totalVolume += length * width * height * quantity;
    });

    const dimensionalWeight = totalVolume / 5000;

    return {
      weight: Math.max(totalWeight, dimensionalWeight),
      dimensions: {
        length: maxLength,
        width: maxWidth,
        height: maxHeight
      },
      itemCount: totalItems,
      actualWeight: totalWeight,
      dimensionalWeight: dimensionalWeight,
      volume: totalVolume
    };
  };

  const determineVehicleId = (weight, dimensions) => {
    const volume = dimensions.length * dimensions.width * dimensions.height;
    if (weight > 20 || volume > 1000000) return 3;
    if (weight > 10 || volume > 500000) return 2;
    if (weight > 5 || volume > 100000) return 1;
    return 0;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateEnhancedFallbackShipping = () => {
    if (!locationStatus.coordinates || sellerAddresses.length === 0) {
      return 1500;
    }

    let totalFee = 0;
    sellerAddresses.forEach(seller => {
      if (seller.coordinates) {
        const distance = calculateDistance(
          seller.coordinates.latitude,
          seller.coordinates.longitude,
          locationStatus.coordinates.latitude,
          locationStatus.coordinates.longitude
        );

        const sellerProducts = products.find(p => p.sellerId === seller.sellerId)?.products || [];
        const packageDetails = calculateSellerPackageDetails(sellerProducts);

        let sellerFee = 750;
        sellerFee += Math.max(distance * 75, 250);
        sellerFee += (packageDetails.weight - 1) * 120;

        const volume = packageDetails.dimensions.length * packageDetails.dimensions.width * packageDetails.dimensions.height;
        if (volume > 100000) {
          sellerFee += 200;
        }

        totalFee += Math.max(sellerFee, 750);
      }
    });

    return Math.min(totalFee, 10000);
  };

  // Enhanced automatic shipping calculation
  useEffect(() => {
    const calculateAutomaticShipping = async () => {
      if (locationStatus.success &&
        locationStatus.coordinates &&
        state.address &&
        sellerAddresses.length > 0 &&
        !autoCalculationAttempted) {

        setCalculatingShipping(true);
        setAutoCalculationAttempted(true);

        try {
          const shippingData = sellerAddresses.map(seller => {
            const sellerProducts = products.find(p => p.sellerId === seller.sellerId)?.products || [];
            const packageDetails = calculateSellerPackageDetails(sellerProducts);

            return {
              sellerId: seller.sellerId,
              pickup: {
                address: seller.address,
                latitude: seller.coordinates?.latitude,
                longitude: seller.coordinates?.longitude,
                name: seller.name,
                phone: seller.phone,
                email: seller.email
              },
              delivery: {
                address: state.address,
                latitude: locationStatus.coordinates.latitude,
                longitude: locationStatus.coordinates.longitude,
                name: state.name || 'Customer',
                phone: state.phone,
                email: ''
              },
              options: {
                weight: packageDetails.weight,
                dimensions: packageDetails.dimensions,
                itemCount: packageDetails.itemCount,
                vehicleId: determineVehicleId(packageDetails.weight, packageDetails.dimensions),
                isInsured: true,
                isCOD: false,
                loadersCount: packageDetails.weight > 10 ? 1 : 0,
                parcel_amount: sellerProducts.reduce((total, product) => total + (product.price || 0), 0),
                useRealTimeRouting: true,
                packageType: packageDetails.weight > 5 ? 'parcel' : 'document'
              }
            };
          });

          const response = await api.post('/shipping/calculate', { sellers: shippingData });

          if (response.data && response.data.totalFee) {
            const calculatedFee = parseFloat(response.data.totalFee);
            setShippingFee(calculatedFee);
            setShippingCalculated(true);
            showNotification(`Shipping calculated: ₦${calculatedFee.toLocaleString()}`, 'success');
          } else {
            throw new Error('Invalid response from shipping API');
          }

        } catch (error) {
          console.error('Shipping calculation failed:', error);
          const fallbackFee = calculateEnhancedFallbackShipping();
          setShippingFee(fallbackFee);
          setShippingCalculated(true);
          showNotification(`Using estimated shipping: ₦${fallbackFee.toLocaleString()}`, 'info');
        } finally {
          setCalculatingShipping(false);
        }
      }
    };

    calculateAutomaticShipping();
  }, [locationStatus, state.address, sellerAddresses, autoCalculationAttempted, products]);

  // Phone validation
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // Input handler
  const inputHandle = (e) => {
    const { name, value } = e.target;

    if (name === 'address') {
      handleAddressInputChange(e);
    } else {
      setState({
        ...state,
        [name]: value
      });
    }
  };

  // Save shipping details
  const save = async (e) => {
    e.preventDefault();
    const { name, address, phone, post, province, city, area } = state;

    if (name && address && phone && post && province && city && area) {
      if (!validatePhoneNumber(phone)) {
        showNotification('Please provide a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)', 'error');
        return;
      }

      if (!locationStatus.success || !locationStatus.coordinates) {
        showNotification('Please verify your location before proceeding. Use the location tools to select or confirm your address.', 'warning');
        return;
      }

      if (!shippingCalculated) {
        setCalculatingShipping(true);
        try {
          const fallbackFee = calculateEnhancedFallbackShipping();
          setShippingFee(fallbackFee);
          setShippingCalculated(true);
          showNotification(`Shipping calculated: ₦${fallbackFee.toLocaleString()}`, 'success');
        } catch (error) {
          console.error('Manual shipping calculation failed:', error);
          showNotification('Failed to calculate shipping costs', 'error');
        } finally {
          setCalculatingShipping(false);
        }
      }

      setRes(true);
      showNotification('Shipping details saved successfully!', 'success');
    } else {
      showNotification('Please fill in all required fields', 'error');
    }
  };

  // Place order
  const placeOrder = () => {
    if (!shippingCalculated) {
      showNotification('Please wait for shipping costs to be calculated before placing order', 'warning');
      return;
    }

    if (!locationStatus.success || !locationStatus.coordinates) {
      showNotification('Please ensure your delivery address is verified with coordinates', 'error');
      return;
    }

    if (!validatePhoneNumber(state.phone)) {
      showNotification('Please provide a valid Nigerian phone number for delivery', 'error');
      return;
    }

    dispatch(place_order({
      price: price + shippingFee,
      products,
      shipping_fee: shippingFee,
      shippingInfo: {
        ...state,
        coordinates: locationStatus.coordinates,
        validated: true,
        serviceable: true,
        geocodingSource: locationStatus.source
      },
      userId: userInfo.id,
      navigate,
      items
    }));
  };

  // Fetch seller data
  useEffect(() => {
    const fetchSellerData = async () => {
      if (products && products.length > 0) {
        setLoadingAddresses(true);
        try {
          const sellerIds = products.map(p => p.sellerId);
          const [addressResponse, phoneResponse] = await Promise.all([
            api.post('/home/order/seller-addresses', { sellerIds }),
            api.post('/home/order/seller-phones', { sellerIds })
          ]);

          if (addressResponse.data?.sellerAddresses) {
            setSellerAddresses(addressResponse.data.sellerAddresses);
          }
          if (phoneResponse.data?.sellerPhones) {
            setSellerPhones(phoneResponse.data.sellerPhones);
          }
        } catch (error) {
          console.error('Error fetching seller data:', error);
          showNotification('Failed to load seller information', 'error');
        } finally {
          setLoadingAddresses(false);
        }
      }
    };

    fetchSellerData();
  }, [products]);

  // Click outside suggestions handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup geolocation watcher
  useEffect(() => {
    return () => {
      if (geolocationWatchId.current) {
        navigator.geolocation.clearWatch(geolocationWatchId.current);
      }
    };
  }, []);

  // Calculate total package details
  const calculateTotalPackageDetails = () => {
    let totalWeight = 0;
    let totalItems = 0;
    let totalSellers = products.length;

    products.forEach(seller => {
      const sellerProducts = seller.products || [];
      const packageDetails = calculateSellerPackageDetails(sellerProducts);
      totalWeight += packageDetails.weight;
      totalItems += packageDetails.itemCount;
    });

    return {
      totalWeight: totalWeight.toFixed(1),
      totalItems,
      totalSellers
    };
  };

  const totalPackage = calculateTotalPackageDetails();
  const totalAmount = price + shippingFee;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* <Headers /> */}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          className="w-full"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-1">
          {/* Progress Header */}
          <div className="mb-2 mt-6 sm:mt-8 lg:mt-12 lg:mb-5 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
            <div className="flex items-center text-sm sm:text-sm text-gray-600">
              <Link to="/" className="text-orange-600 hover:text-orange-700 font-medium">Home</Link>
              <MdOutlineKeyboardArrowRight className="mx-1 sm:mx-2" />
              <span className="text-gray-800 font-medium">Shipping Information</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full ${!res ? 'bg-orange-500 text-white shadow-lg' : 'bg-green-500 text-white shadow-lg'}`}>
                  {!res ? <span className="text-sm sm:text-sm lg:text-base">1</span> : <MdCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
                </div>
                <div className={`ml-2 text-sm sm:text-sm font-medium ${!res ? 'text-orange-600' : 'text-green-600'}`}>
                  Shipping Details
                </div>
              </div>

              <div className="w-12 sm:w-16 lg:w-20 h-1 mx-2 sm:mx-3 lg:mx-4 bg-gray-300 rounded-full"></div>

              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full ${res ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-300 text-gray-500'}`}>
                  <span className="text-sm sm:text-sm lg:text-base">2</span>
                </div>
                <div className={`ml-2 text-sm sm:text-sm font-medium ${res ? 'text-orange-600' : 'text-gray-500'}`}>
                  Complete Order
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - Shipping Form */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Shipping Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2 sm:gap-3">
                    {!res ? (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MdLocationOn className="text-orange-600 text-lg sm:text-xl" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <MdCheckCircle className="text-green-500 text-lg sm:text-xl" />
                      </div>
                    )}
                    <span className="text-sm sm:text-base lg:text-lg">{!res ? 'Shipping Details' : 'Shipping Details Confirmed'}</span>
                  </h2>
                  {res && (
                    <button
                      onClick={() => setRes(false)}
                      className="text-orange-600 hover:text-orange-700 text-sm flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-orange-200 hover:border-orange-300 transition-colors"
                    >
                      <MdEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-sm sm:text-sm">Edit</span>
                    </button>
                  )}
                </div>

                {!res ? (
                  <form onSubmit={save} className="space-y-4 sm:space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { id: 'name', label: 'Full Name', placeholder: 'John Doe', required: true },
                        { id: 'phone', label: 'Phone Number', placeholder: '08012345678 or +2348012345678', type: 'tel', required: true },
                        { id: 'city', label: 'City', placeholder: 'Lagos', required: true },
                        { id: 'province', label: 'State/Province', placeholder: 'Lagos State', required: true },
                        { id: 'post', label: 'ZIP/Postal Code', placeholder: '100001', required: true },
                        { id: 'area', label: 'Area/LGA', placeholder: 'Ikeja', required: true },
                      ].map((field) => (
                        <div key={field.id} className="space-y-1 sm:space-y-2">
                          <label htmlFor={field.id} className="text-sm sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                            {field.label}
                            {field.required && <span className="text-red-500">*</span>}
                          </label>
                          <div className="relative">
                            {field.id === 'phone' && (
                              <MdPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            )}
                            <input
                              id={field.id}
                              name={field.id}
                              onChange={inputHandle}
                              value={state[field.id]}
                              type={field.type || 'text'}
                              className={`w-full px-3 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${field.id === 'phone' ? 'pl-10' : ''
                                } ${field.id === 'phone' && state.phone && !validatePhoneNumber(state.phone) ? 'border-red-300 bg-red-50' : 'bg-white'}`}
                              placeholder={field.placeholder}
                              required={field.required}
                            />
                          </div>
                          {field.id === 'phone' && state.phone && !validatePhoneNumber(state.phone) && (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                              <MdWarning className="w-3 h-3" />
                              Please enter a valid Nigerian phone number
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Address Field with Enhanced Location Tools */}
                    <div className="space-y-2 sm:space-y-3" ref={suggestionsRef}>
                      <label htmlFor="address" className="block text-sm sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                        Delivery Address <span className="text-red-500">*</span>
                      </label>
                      
                      <div className="relative">
                        <input
                          id="address"
                          name="address"
                          onChange={inputHandle}
                          value={state.address}
                          type="text"
                          className="w-full pl-4 pr-20 sm:pr-24 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                          placeholder="Enter your complete delivery address"
                          required
                          autoComplete="off"
                        />
                        
                        {/* Location Action Buttons */}
                        <div className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 flex gap-1 sm:gap-2">
                          <button
                            type="button"
                            onClick={openLocationModal}
                            className="bg-orange-500 hover:bg-orange-700 text-white p-1 sm:p-2 rounded-lg shadow-md transition-all duration-300 flex items-center gap-1 text-sm font-medium"
                            title="Search for address"
                          >
                            <MdSearch className="w-3 h-3" />
                            <span className="hidden xs:inline">Search</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={locationStatus.loading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-1 sm:p-2 rounded-lg shadow-md transition-all duration-300 flex items-center gap-1 text-sm font-medium"
                            title="Use current location"
                          >
                            {locationStatus.loading ? (
                              <CircularProgress size={10} className="text-white" />
                            ) : (
                              <MdMyLocation className="w-3 h-3" />
                            )}
                            <span className="hidden xs:inline">Current</span>
                          </button>
                        </div>
                      </div>

                      {/* Enhanced Address Suggestions */}
                      {showSuggestions && addressSuggestions.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-48 sm:max-h-60 overflow-y-auto">
                          <div className="p-2 sm:p-3 bg-gray-50 border-b border-gray-200">
                            <p className="text-gray-700 text-sm sm:text-sm font-semibold flex items-center gap-1 sm:gap-2">
                              <MdSearch className="text-orange-500" />
                              <span>Select Address ({addressSuggestions.length} found)</span>
                            </p>
                          </div>
                          <div className="divide-y divide-gray-200">
                            {addressSuggestions.map((feature, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleSelectSuggestion(feature)}
                                className="w-full p-2 sm:p-3 text-left hover:bg-orange-50 transition-colors duration-200"
                              >
                                <div className="flex items-start gap-2 sm:gap-3">
                                  <MdPlace className="text-orange-500 mt-0.5 sm:mt-1 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-gray-800 text-sm sm:text-sm font-medium truncate">{feature.place_name}</p>
                                    <p className="text-gray-500 text-sm mt-0.5 sm:mt-1">
                                      {feature.properties?.address || feature.text}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Location Status Indicators */}
                      {locationStatus.loading && (
                        <div className="p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <CircularProgress size={14} />
                            <span className="text-blue-700 text-sm sm:text-sm font-medium">
                              {locationRetryCount > 0 ? 
                                `Getting location (attempt ${locationRetryCount + 1})...` : 
                                'Getting your location...'
                              }
                            </span>
                          </div>
                        </div>
                      )}

                      {locationStatus.success && (
                        <div className="p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                          {/* <div className="flex items-center gap-1 sm:gap-2">
                            <MdCheckCircle className="text-green-500" />
                            <span className="text-green-700 text-sm sm:text-sm font-medium">Address verified with coordinates</span>
                          </div> */}
                          {/* {locationStatus.coordinates && (
                            <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1 text-sm text-green-600">
                              <p className="text-sm">Coordinates: {locationStatus.coordinates.latitude.toFixed(6)}, {locationStatus.coordinates.longitude.toFixed(6)}</p>
                              {locationStatus.accuracy && (
                                <p className="text-sm">Accuracy: ±{Math.round(locationStatus.accuracy)} meters</p>
                              )}
                            </div>
                          )} */}
                          {/* Shipping Calculation Status */}
                          {calculatingShipping && (
                            <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 text-blue-600 text-sm sm:text-sm">
                              <CircularProgress size={14} />
                              <span>Calculating shipping costs...</span>
                            </div>
                          )}
                          {shippingCalculated && !calculatingShipping && (
                            <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 text-green-600 text-sm sm:text-sm">
                              <MdCheckCircle className="text-green-500" />
                              <span>Shipping cost calculated: ₦{shippingFee.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {locationStatus.error && (
                        <div className="p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <MdWarning className="text-red-500" />
                            <div>
                              <span className="text-red-700 text-sm sm:text-sm font-medium">Location Error</span>
                              <p className="text-red-600 text-sm mt-0.5 sm:mt-1">{locationStatus.error}</p>
                            </div>
                          </div>
                          {locationRetryCount > 0 && (
                            <button
                              onClick={handleUseCurrentLocation}
                              className="mt-1 sm:mt-2 text-red-700 hover:text-red-800 text-sm sm:text-sm font-medium flex items-center gap-1"
                            >
                              <MdGpsFixed className="w-3 h-3 sm:w-4 sm:h-4" />
                              Try again
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      type="submit"
                      disabled={!locationStatus.success || calculatingShipping}
                      className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 ${locationStatus.success && !calculatingShipping
                          ? 'bg-orange-500 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      {calculatingShipping ? (
                        <>
                          <CircularProgress size={18} className="text-white" />
                          <span>Calculating Shipping...</span>
                        </>
                      ) : (
                        <>
                          <MdCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Save Shipping Details & Continue</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Confirmed Shipping Details View */
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <MdCheckCircle className="text-green-500 text-lg sm:text-xl lg:text-2xl" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-green-800">Shipping Details Confirmed</h3>
                          <p className="text-green-600 text-sm sm:text-sm">Your shipping information has been saved and verified</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3">
                          <h4 className="font-semibold text-gray-700 text-sm sm:text-base">Contact Information</h4>
                          <div className="space-y-1 sm:space-y-2">
                            <p className="text-gray-800 text-sm sm:text-base">{state.name}</p>
                            <p className="text-gray-600 text-sm flex items-center gap-1 sm:gap-2">
                              <MdPhone className="text-gray-400" />
                              {state.phone}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <h4 className="font-semibold text-gray-700 text-sm sm:text-base">Delivery Address</h4>
                          <div className="space-y-0.5 sm:space-y-1">
                            <p className="text-gray-800 text-sm sm:text-base">{state.address}</p>
                            <p className="text-gray-600 text-sm">{state.city}, {state.province} {state.post}</p>
                            <p className="text-gray-600 text-sm">{state.area}</p>
                          </div>
                        </div>
                      </div>

                      {locationStatus.coordinates && (
                        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white rounded border border-green-200">
                          <p className="text-green-700 text-sm sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                            <MdGpsFixed className="w-3 h-3 sm:w-4 sm:h-4" />
                            Location Verified
                          </p>
                          <p className="text-green-600 text-sm mt-0.5 sm:mt-1">
                            Coordinates: {locationStatus.coordinates.latitude.toFixed(6)}, {locationStatus.coordinates.longitude.toFixed(6)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <button
                        onClick={() => setRes(false)}
                        className="flex-1 py-2 sm:py-3 px-4 sm:px-6 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 sm:gap-2"
                      >
                        <MdEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Edit Shipping Details</span>
                      </button>
                      <button
                        onClick={placeOrder}
                        className="flex-1 py-2 sm:py-3 px-4 sm:px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm sm:text-base transition-colors flex items-center justify-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl"
                      >
                        <MdPayment className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Complete Order</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 sticky top-4 sm:top-6">
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Order Summary</h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between text-sm sm:text-sm">
                    <span className="text-gray-600">Subtotal ({items} items)</span>
                    <span className="font-medium text-gray-900">₦{price.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm sm:text-sm">
                    <span className="text-gray-600">Shipping Fee</span>
                    <span className="font-medium text-gray-900">
                      {shippingCalculated ? (
                        <span className="flex items-center gap-1">
                          ₦{shippingFee.toLocaleString()}
                        </span>
                      ) : calculatingShipping ? (
                        <span className="flex items-center gap-1 text-blue-600">
                          <CircularProgress size={10} />
                          <span className="text-sm">Calculating...</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not calculated</span>
                      )}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 sm:pt-4">
                    <div className="flex justify-between text-base sm:text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-orange-600">
                        {shippingCalculated ? `₦${totalAmount.toLocaleString()}` : '--'}
                      </span>
                    </div>
                  </div>

                  {!res ? (
                    <button
                      onClick={save}
                      disabled={!locationStatus.success || calculatingShipping}
                      className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium text-sm sm:text-base transition-all mt-3 sm:mt-4 flex items-center justify-center gap-1 sm:gap-2 ${locationStatus.success && !calculatingShipping
                          ? 'bg-orange-500 hover:bg-orange-700 text-white shadow-md'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {calculatingShipping ? (
                        <>
                          <CircularProgress size={14} />
                          <span>Calculating...</span>
                        </>
                      ) : (
                        <span>Save Shipping Details</span>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={placeOrder}
                      disabled={!shippingCalculated}
                      className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium text-sm sm:text-base transition-all mt-3 sm:mt-4 flex items-center justify-center gap-1 sm:gap-2 ${shippingCalculated
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <MdPayment className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Complete Order</span>
                    </button>
                  )}
                </div>

                {/* Package Summary */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <h3 className="text-sm sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Package Summary</h3>
                  <div className="space-y-1 sm:space-y-2 text-sm sm:text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1 sm:gap-2">
                        <MdScale className="text-orange-500" />
                        <span>Total Weight:</span>
                      </span>
                      <span className="font-medium text-gray-900">{totalPackage.totalWeight}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Items:</span>
                      <span className="font-medium text-gray-900">{totalPackage.totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1 sm:gap-2">
                        <MdStore className="text-orange-500" />
                        <span>Number of Sellers:</span>
                      </span>
                      <span className="font-medium text-gray-900">{totalPackage.totalSellers}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Status */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <h3 className="text-sm sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Shipping Status</h3>
                  <div className="space-y-1 sm:space-y-2 text-sm sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location Verified:</span>
                      <span className={`font-medium ${locationStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                        {locationStatus.success ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Calculated:</span>
                      <span className={`font-medium ${shippingCalculated ? 'text-green-600' : 'text-yellow-600'}`}>
                        {shippingCalculated ? '✓ Yes' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Location Search Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-1 sm:gap-2">
                <MdLocationOn className="text-orange-600" />
                <span>Find Your Location</span>
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 sm:p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Search Section */}
              <div className="space-y-3 sm:space-y-4">
                <div className="relative">
                  <MdSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base sm:text-lg" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (isMapboxConfigured()) {
                        handleAddressSearch(e.target.value);
                      }
                    }}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base bg-white border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm"
                    placeholder="Search for an address, place, or landmark..."
                    disabled={!isMapboxConfigured()}
                  />
                  {isSearching && (
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                      <CircularProgress size={16} />
                    </div>
                  )}
                </div>

                {/* Enhanced Current Location Button */}
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <button
                    onClick={handleUseCurrentLocation}
                    disabled={locationStatus.loading}
                    className="w-full py-2 sm:py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold text-sm sm:text-base rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 sm:gap-3"
                  >
                    {locationStatus.loading ? (
                      <>
                        <CircularProgress size={16} className="text-white" />
                        <span>Getting Your Location...</span>
                      </>
                    ) : (
                      <>
                        <MdMyLocation className="text-base sm:text-lg" />
                        <span>Use My Current Location</span>
                      </>
                    )}
                  </button>
                  <div className="mt-1 sm:mt-2 text-blue-600 text-sm space-y-0.5 sm:space-y-1">
                    <p className="flex items-center gap-1">
                      <MdGpsFixed className="w-3 h-3" />
                      Uses your device's GPS for precise location
                    </p>
                    {locationRetryCount > 0 && (
                      <p className="text-orange-600">
                        Previous attempts: {locationRetryCount}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="max-h-48 sm:max-h-60 overflow-y-auto border border-gray-300 rounded-lg shadow-sm">
                  <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200">
                    <p className="text-gray-700 text-sm sm:text-sm font-semibold">Search Results</p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {searchResults.map((feature, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectAddress(feature)}
                        className="w-full p-3 sm:p-4 text-left hover:bg-orange-50 transition-colors duration-200"
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <MdPlace className="text-orange-500 mt-0.5 sm:mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 text-sm sm:text-sm font-medium truncate">{feature.place_name}</p>
                            <p className="text-gray-500 text-sm mt-0.5 sm:mt-1">
                              {feature.properties?.address || feature.text}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !isSearching && isMapboxConfigured() && (
                <div className="p-3 sm:p-4 text-center border border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-gray-600 text-sm sm:text-sm">No results found for "{searchQuery}"</p>
                  <p className="text-gray-500 text-sm mt-0.5 sm:mt-1">Try a different address or landmark</p>
                </div>
              )}

              {/* Instructions */}
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-gray-700 text-sm sm:text-sm font-semibold mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                  <MdLocationOn className="text-orange-500" />
                  <span>How to find your location</span>
                </h4>
                <ul className="text-gray-600 text-sm space-y-1 sm:space-y-2">
                  <li className="flex items-center gap-1 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></div>
                    <span>Search for any address, business, or landmark</span>
                  </li>
                  <li className="flex items-center gap-1 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                    <span>Use "Current Location" for your exact GPS coordinates</span>
                  </li>
                  <li className="flex items-center gap-1 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                    <span>Shipping costs are calculated automatically when address is verified</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='hidden lg:block'>
        <Footer />
      </div>
    </div>
  );
}

export default Shipping;