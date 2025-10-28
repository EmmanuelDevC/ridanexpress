import api from './api';

class ShippingService {
  // ==================== MAPBOX GEOCODING METHODS ====================

  async geocodeAddress(address) {
    try {
      const response = await api.post('/order/mapbox/geocode', { address });
      return response.data;
    } catch (error) {
      console.error('[MAPBOX] Geocode address failed:', error);
      throw error;
    }
  }

  async reverseGeocode(latitude, longitude) {
    try {
      const response = await api.post('/order/mapbox/reverse-geocode', {
        latitude,
        longitude
      });
      return response.data;
    } catch (error) {
      console.error('[MAPBOX] Reverse geocode failed:', error);
      throw error;
    }
  }

  async validateAddress(address) {
    try {
      const response = await api.post('/order/mapbox/validate-address', { address });
      return response.data;
    } catch (error) {
      console.error('[MAPBOX] Address validation failed:', error);
      throw error;
    }
  }

  async calculateRoute(origin, destination, profile = 'driving') {
    try {
      const response = await api.post('/order/mapbox/calculate-route', {
        origin,
        destination,
        profile
      });
      return response.data;
    } catch (error) {
      console.error('[MAPBOX] Route calculation failed:', error);
      throw error;
    }
  }

  async batchGeocode(addresses) {
    try {
      const response = await api.post('/order/mapbox/batch-geocode', { addresses });
      return response.data;
    } catch (error) {
      console.error('[MAPBOX] Batch geocode failed:', error);
      throw error;
    }
  }

  // ==================== SHIPPING CALCULATION ====================

  async calculateShipping(sellers) {
    try {
      const response = await api.post('/shipping/calculate', { sellers });
      return response.data;
    } catch (error) {
      console.error('[SHIPPING] Calculate shipping failed:', error);
      throw error;
    }
  }

  async calculateSingleShipping(pickup, delivery, options = {}) {
    try {
      const response = await api.post('/shipping/calculate-single', {
        pickup,
        delivery,
        options
      });
      return response.data;
    } catch (error) {
      console.error('[SHIPPING] Single shipping calculation failed:', error);
      throw error;
    }
  }

  // ==================== VEHICLE & LOADER OPTIONS ====================

  async getVehicleOptions(size = 0) {
    try {
      const response = await api.get(`/shipping/vehicles?size=${size}`);
      return response.data;
    } catch (error) {
      console.error('[SHIPPING] Get vehicle options failed:', error);
      throw error;
    }
  }

  async getLoaderOptions() {
    try {
      const response = await api.get('/shipping/loaders');
      return response.data;
    } catch (error) {
      console.error('[SHIPPING] Get loader options failed:', error);
      throw error;
    }
  }

  // ==================== SERVICE AVAILABILITY ====================

  async getServiceAvailability(pickup, delivery) {
    try {
      const response = await api.get('/shipping/availability', {
        params: { pickup, delivery }
      });
      return response.data;
    } catch (error) {
      console.error('[SHIPPING] Service availability check failed:', error);
      throw error;
    }
  }

  // ==================== SHIPPING RATES ====================

  async getShippingRates(weight, distance, vehicleType, options = {}) {
    try {
      const response = await api.post('/shipping/rates', {
        weight,
        distance,
        vehicleType,
        options
      });
      return response.data;
    } catch (error) {
      console.error('[SHIPPING] Shipping rates calculation failed:', error);
      throw error;
    }
  }

  // ==================== SELLER ADDRESSES ====================

  async getSellerAddresses(sellerIds) {
    try {
      const response = await api.post('/home/order/seller-addresses', { sellerIds });
      return response.data;
    } catch (error) {
      console.error('[SHIPPING] Get seller addresses failed:', error);
      throw error;
    }
  }

  // ==================== HEALTH CHECKS ====================

  async healthCheck() {
    try {
      const response = await api.get('/shipping/health');
      return response.data;
    } catch (error) {
      console.error('[SHIPPING] Health check failed:', error);
      throw error;
    }
  }

  async mapboxHealthCheck() {
    try {
      const response = await api.get('/order/mapbox/health');
      return response.data;
    } catch (error) {
      console.error('[MAPBOX] Health check failed:', error);
      throw error;
    }
  }
}

export default new ShippingService();