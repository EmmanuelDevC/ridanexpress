import React, { useState, useEffect, useRef } from 'react';
// import Footer from '../components/Footer';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  MdLocationOn,
  MdEdit,
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
  MdPerson,
  MdHome,
  MdLocationCity,
  MdMap
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { place_order } from '../store/reducers/orderReducer';
import api from '../api/api';
import { Alert, CircularProgress, Snackbar } from '@mui/material';

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

  const showNotification = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

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

  const openLocationModal = () => {
    setShowLocationModal(true);
    setSearchQuery('');
    setSearchResults([]);
  };

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

  const getEnhancedCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      };

      if (geolocationWatchId.current) {
        navigator.geolocation.clearWatch(geolocationWatchId.current);
      }

      let positionReceived = false;
      let bestPosition = null;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          if (accuracy <= 50) {
            resolve({
              latitude,
              longitude,
              accuracy,
              timestamp: position.timestamp,
              source: 'high_accuracy'
            });
          } else {
            bestPosition = { latitude, longitude, accuracy, timestamp: position.timestamp };
            
            geolocationWatchId.current = navigator.geolocation.watchPosition(
              (watchPosition) => {
                const watchAccuracy = watchPosition.coords.accuracy;
                
                if (watchAccuracy <= 25 || !positionReceived) {
                  positionReceived = true;
                  navigator.geolocation.clearWatch(geolocationWatchId.current);
                  
                  resolve({
                    latitude: watchPosition.coords.latitude,
                    longitude: watchPosition.coords.longitude,
                    accuracy: watchAccuracy,
                    timestamp: watchPosition.timestamp,
                    source: 'watch_improved'
                  });
                }
              },
              (error) => {
                if (bestPosition) {
                  resolve({
                    ...bestPosition,
                    source: 'fallback_accuracy'
                  });
                } else {
                  handleGeolocationError(error, reject);
                }
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );

            setTimeout(() => {
              if (!positionReceived && bestPosition) {
                navigator.geolocation.clearWatch(geolocationWatchId.current);
                resolve({
                  ...bestPosition,
                  source: 'timeout_fallback'
                });
              }
            }, 8000);
          }
        },
        (error) => {
          handleGeolocationError(error, reject);
        },
        options
      );

      setTimeout(() => {
        if (!positionReceived && bestPosition) {
          navigator.geolocation.clearWatch(geolocationWatchId.current);
          resolve({
            ...bestPosition,
            source: 'final_timeout'
          });
        } else if (!positionReceived) {
          navigator.geolocation.clearWatch(geolocationWatchId.current);
          reject(new Error('Location detection timed out. Please try again or enter address manually.'));
        }
      }, 20000);
    });
  };

  const handleGeolocationError = (error, reject) => {
    let errorMessage = 'Unable to retrieve your location';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied. Please enable location permissions in your browser settings and try again.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable. Please check your device location services and try again in an open area.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Please ensure you have good GPS signal and try again.';
        break;
      default:
        errorMessage = 'An unknown error occurred while getting location. Please try entering your address manually.';
        break;
    }
    reject(new Error(errorMessage));
  };

  const reverseGeocodeWithMapbox = async (latitude, longitude) => {
    try {
      if (!isMapboxConfigured()) {
        throw new Error('Mapbox service is not configured properly.');
      }

      const params = new URLSearchParams({
        access_token: MAPBOX_CONFIG.token,
        limit: 3,
        types: 'address,poi,neighborhood,locality',
        country: 'NG'
      });

      const response = await fetch(
        `${MAPBOX_CONFIG.baseUrl}/${longitude},${latitude}.json?${params}`
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        let bestFeature = data.features[0];
        
        for (const feature of data.features) {
          if (feature.place_type.includes('address') || 
              feature.properties?.address ||
              feature.text?.match(/\d/)) {
            bestFeature = feature;
            break;
          }
        }
        
        return {
          address: bestFeature.place_name,
          coordinates: { latitude, longitude },
          fullFeature: bestFeature
        };
      }

      return {
        address: `Location near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        coordinates: { latitude, longitude }
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        address: `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        coordinates: { latitude, longitude }
      };
    }
  };

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
      showNotification('Getting your current location with high accuracy...', 'info');

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
        source: location.source || 'browser_geolocation',
        coordinates: result.coordinates,
        accuracy: location.accuracy,
        timestamp: location.timestamp
      });

      setShowLocationModal(false);
      setAutoCalculationAttempted(false);
      setLocationRetryCount(0);

      const accuracyMessage = location.accuracy <= 25 
        ? 'High accuracy location found!' 
        : `Location found (accuracy: ±${Math.round(location.accuracy)}m)`;

      showNotification(accuracyMessage, 'success');

    } catch (error) {
      console.error('Current location error:', error);

      const newRetryCount = locationRetryCount + 1;
      setLocationRetryCount(newRetryCount);

      let finalErrorMessage = error.message;

      if (finalErrorMessage.includes('permission') || finalErrorMessage.includes('denied')) {
        finalErrorMessage += ' Please check your browser location settings and refresh the page.';
      } else if (finalErrorMessage.includes('unavailable')) {
        finalErrorMessage += ' Try moving to an open area with better signal.';
      } else if (newRetryCount >= 2) {
        finalErrorMessage += ' Please try entering your address manually for better accuracy.';
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

  const searchAddressWithMapbox = async (query) => {
    try {
      if (!isMapboxConfigured()) {
        throw new Error('Mapbox service is not configured properly.');
      }

      const params = new URLSearchParams({
        access_token: MAPBOX_CONFIG.token,
        limit: MAPBOX_CONFIG.limit,
        country: MAPBOX_CONFIG.country,
        types: MAPBOX_CONFIG.types,
        proximity: '3.3792,6.5244'
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

  const getAddressSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsVerifying(true);
    setLocationStatus(prev => ({ ...prev, loading: true }));

    try {
      const results = await searchAddressWithMapbox(query);
      
      const filteredResults = results.filter(feature => {
        const address = feature.place_name;
        return !address.includes(', Nigeria, Nigeria') && 
               !address.endsWith(', Nigeria') ||
               address.match(/\d/);
      });

      if (filteredResults.length > 0) {
        setAddressSuggestions(filteredResults);
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

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

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

  useEffect(() => {
    return () => {
      if (geolocationWatchId.current) {
        navigator.geolocation.clearWatch(geolocationWatchId.current);
      }
    };
  }, []);

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
    <div className="min-h-screen bg-white">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center text-orange-600 font-medium">
              <MdHome className="w-5 h-5 mr-1" />
              Home
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            <div className="w-20"></div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-4">
            <div className={`flex items-center ${res ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${res ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-300'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Shipping</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
            <div className={`flex items-center ${res ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${res ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-300'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Shipping Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MdLocationOn className="text-orange-600 w-5 h-5 mr-2" />
                    <h2 className="text-lg font-semibold">
                      {!res ? 'Shipping Information' : 'Shipping Confirmed'}
                    </h2>
                  </div>
                  {res && (
                    <button
                      onClick={() => setRes(false)}
                      className="text-orange-600 text-sm font-medium flex items-center"
                    >
                      <MdEdit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4">
                {!res ? (
                  <form onSubmit={save} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { 
                          id: 'name', 
                          label: 'Full Name', 
                          placeholder: 'John Doe', 
                          icon: MdPerson,
                          required: true 
                        },
                        { 
                          id: 'phone', 
                          label: 'Phone Number', 
                          placeholder: '08012345678', 
                          type: 'tel',
                          icon: MdPhone,
                          required: true 
                        },
                        { 
                          id: 'city', 
                          label: 'City', 
                          placeholder: 'Lagos', 
                          icon: MdLocationCity,
                          required: true 
                        },
                        { 
                          id: 'province', 
                          label: 'State', 
                          placeholder: 'Lagos State', 
                          icon: MdMap,
                          required: true 
                        },
                        { 
                          id: 'post', 
                          label: 'Postal Code', 
                          placeholder: '100001', 
                          required: true 
                        },
                        { 
                          id: 'area', 
                          label: 'Area', 
                          placeholder: 'Ikeja', 
                          required: true 
                        },
                      ].map((field) => (
                        <div key={field.id}>
                          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <div className="relative">
                            {field.icon && (
                              <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                            )}
                            <input
                              id={field.id}
                              name={field.id}
                              onChange={inputHandle}
                              value={state[field.id]}
                              type={field.type || 'text'}
                              className={`w-full ${field.icon ? 'pl-10' : 'pl-3'} pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white`}
                              placeholder={field.placeholder}
                              required={field.required}
                            />
                          </div>
                          {field.id === 'phone' && state.phone && !validatePhoneNumber(state.phone) && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <MdWarning className="w-3 h-3 mr-1" />
                              Please enter a valid Nigerian phone number
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Address Field */}
                    <div ref={suggestionsRef}>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="address"
                          name="address"
                          onChange={inputHandle}
                          value={state.address}
                          type="text"
                          className="w-full pl-3 pr-24 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white"
                          placeholder="Enter your full delivery address"
                          required
                          autoComplete="off"
                        />
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <button
                            type="button"
                            onClick={openLocationModal}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs font-medium flex items-center"
                          >
                            <MdSearch className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={locationStatus.loading}
                            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-2 py-1 rounded text-xs font-medium flex items-center"
                          >
                            {locationStatus.loading ? (
                              <CircularProgress size={12} className="text-white" />
                            ) : (
                              <MdMyLocation className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Status Indicators */}
                      {locationStatus.loading && (
                        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded text-orange-700 text-sm mt-1">
                          <CircularProgress size={14} className="text-orange-600" />
                          Getting your location...
                        </div>
                      )}

                      {locationStatus.success && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded text-green-700 text-sm mt-1">
                          <MdCheckCircle className="text-green-500 text-sm" />
                          Address verified successfully
                        </div>
                      )}

                      {locationStatus.error && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded text-red-700 text-sm mt-1">
                          <MdWarning className="text-red-500 text-sm" />
                          {locationStatus.error}
                        </div>
                      )}

                      {/* Address Suggestions */}
                      {showSuggestions && addressSuggestions.length > 0 && (
                        <div className="absolute z-10 w-auto mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
                          {addressSuggestions.map((feature, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSelectSuggestion(feature)}
                              className="w-full p-2 text-left hover:bg-gray-50 border-b border-gray-100 text-sm"
                            >
                              <div className="flex items-start gap-2">
                                <MdPlace className="text-orange-600 mt-0.5 flex-shrink-0 text-sm" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-gray-800 font-medium truncate">
                                    {feature.place_name}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!locationStatus.success || calculatingShipping}
                      className={`w-full py-3 px-4 rounded font-medium text-sm transition-colors flex items-center justify-center gap-2
                        ${locationStatus.success && !calculatingShipping
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      {calculatingShipping ? (
                        <>
                          <CircularProgress size={16} className="text-white" />
                          Calculating Shipping...
                        </>
                      ) : (
                        <>
                          <MdCheckCircle className="w-4 h-4" />
                          Continue to Payment
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                      <div className="flex items-center gap-3">
                        <MdCheckCircle className="text-green-500 text-xl" />
                        <div>
                          <h3 className="font-semibold text-green-800">Shipping Details Confirmed</h3>
                          <p className="text-green-600 text-sm">Your information is ready for order completion</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 text-sm mb-2">Contact Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MdPerson className="text-gray-400 text-sm" />
                            <span className="text-sm">{state.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MdPhone className="text-gray-400 text-sm" />
                            <span className="text-sm">{state.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 text-sm mb-2">Delivery Address</h4>
                        <div className="flex items-start gap-2">
                          <MdLocationOn className="text-gray-400 text-sm mt-0.5" />
                          <div>
                            <p className="text-sm">{state.address}</p>
                            <p className="text-gray-600 text-xs">
                              {state.city}, {state.area}, {state.province} {state.post}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold flex items-center gap-2">
                  <MdShoppingCart className="text-orange-600 w-4 h-4" />
                  Order Summary
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items ({totalPackage.totalItems})</span>
                    <span className="font-medium">₦{price?.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping Fee</span>
                    <span className="font-medium">
                      {shippingCalculated ? `₦${shippingFee.toLocaleString()}` : '- -'}
                    </span>
                  </div>

                  {calculatingShipping && (
                    <div className="flex items-center gap-2 text-orange-600 text-xs">
                      <CircularProgress size={12} />
                      Calculating shipping costs...
                    </div>
                  )}

                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span className="text-orange-600">
                        {shippingCalculated ? `₦${totalAmount.toLocaleString()}` : '--'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Package Weight:</span>
                    <span className="font-medium">{totalPackage.totalWeight} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sellers:</span>
                    <span className="font-medium">{totalPackage.totalSellers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{totalPackage.totalItems}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {!res ? (
                    <button
                      onClick={save}
                      disabled={!locationStatus.success || calculatingShipping}
                      className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2
                        ${locationStatus.success && !calculatingShipping
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      <MdCheckCircle className="w-4 h-4" />
                      Continue to Payment
                    </button>
                  ) : (
                    <button
                      onClick={placeOrder}
                      disabled={!shippingCalculated}
                      className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2
                        ${shippingCalculated
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      <MdPayment className="w-4 h-4" />
                      Place Order
                    </button>
                  )}
                  
                  <Link
                    to="/cart"
                    className="w-full py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    <MdShoppingCart className="w-4 h-4" />
                    Back to Cart
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold flex items-center gap-2">
                  <MdLocalShipping className="text-green-600 w-4 h-4" />
                  Delivery Info
                </h3>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <MdScale className="text-orange-600 w-4 h-4" />
                  <div>
                    <p className="font-medium">Package Weight</p>
                    <p className="text-gray-600">{totalPackage.totalWeight} kg total</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MdCheckCircle className="text-green-600 w-4 h-4" />
                  <div>
                    <p className="font-medium">Real-time Tracking</p>
                    <p className="text-gray-600">Track your package</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Search Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Search Address</h3>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleAddressSearch(e.target.value);
                    }}
                    placeholder="Enter your address..."
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <MdSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {isSearching && (
                  <div className="flex items-center justify-center py-4">
                    <CircularProgress size={20} />
                    <span className="ml-2 text-gray-600">Searching...</span>
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto">
                  {searchResults.map((feature, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAddress(feature)}
                      className="w-full p-2 text-left hover:bg-orange-50 border-b border-gray-100 last:border-b-0 text-sm"
                    >
                      <div className="flex items-start gap-2">
                        <MdPlace className="text-orange-600 mt-0.5 flex-shrink-0 text-sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 font-medium">
                            {feature.place_name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={handleUseCurrentLocation}
                    disabled={locationStatus.loading}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors disabled:bg-gray-400 text-sm"
                  >
                    {locationStatus.loading ? (
                      <CircularProgress size={16} className="text-white" />
                    ) : (
                      <MdMyLocation className="w-4 h-4" />
                    )}
                    Use Current Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipping;