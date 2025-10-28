import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Grid,
    Chip,
    Divider,
    Tooltip,
    IconButton,
    Collapse,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    LocalShipping,
    Calculate,
    LocationOn,
    CheckCircle,
    Error,
    Info,
    Refresh,
    ExpandMore,
    ExpandLess,
    MyLocation,
    Map,
    Schedule
} from '@mui/icons-material';
import api from '../api/api';
import { debounce } from 'lodash';

const ShippingCalculator = ({
    sellers = [],
    onShippingCalculated,
    defaultDeliveryAddress = '',
    customerPhone = '',
    sellerPhones = [],
    variant = 'full'
}) => {
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [addresses, setAddresses] = useState({
        delivery: defaultDeliveryAddress,
        pickup: ''
    });
    const [sellerAddresses, setSellerAddresses] = useState([]);
    const [options, setOptions] = useState({
        weight: 1,
        vehicleId: 0,
        isInsured: true,
        isCOD: false,
        loadersCount: 0,
        useRealTimeRouting: true
    });
    const [vehicles, setVehicles] = useState([]);
    const [loaders, setLoaders] = useState([]);
    const [addressValidation, setAddressValidation] = useState({});
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [routeDetails, setRouteDetails] = useState(null);

    // Load vehicle and loader options
    useEffect(() => {
        loadVehicleOptions();
        loadLoaderOptions();
    }, []);

    // Load seller addresses when sellers change
    useEffect(() => {
        if (sellers.length > 0) {
            loadSellerAddresses();
        }
    }, [sellers]);

    // Update delivery address when prop changes
    useEffect(() => {
        if (defaultDeliveryAddress) {
            setAddresses(prev => ({
                ...prev,
                delivery: defaultDeliveryAddress
            }));
        }
    }, [defaultDeliveryAddress]);

    const loadVehicleOptions = async () => {
        try {
            const response = await api.get('/shipping/vehicles');
            setVehicles(response.data.vehicles || []);
        } catch (err) {
            console.error('Failed to load vehicle options:', err);
            // Fallback vehicles
            setVehicles([
                { id: 0, name: 'Auto Select', base_fare: 0 },
                { id: 1, name: 'Bike', base_fare: 400 },
                { id: 2, name: 'Small Van', base_fare: 650 },
                { id: 3, name: 'Large Van', base_fare: 950 }
            ]);
        }
    };

    const loadLoaderOptions = async () => {
        try {
            const response = await api.get('/shipping/loaders');
            setLoaders(response.data.loaders || []);
        } catch (err) {
            console.error('Failed to load loader options:', err);
            // Fallback loaders
            setLoaders([
                { id: 1, name: '1 Loader', amount: 250 },
                { id: 2, name: '2 Loaders', amount: 500 }
            ]);
        }
    };

    const loadSellerAddresses = async () => {
        try {
            const sellerIds = sellers.map(seller => seller.sellerId);
            const response = await api.post('/home/order/seller-addresses', { sellerIds });
            setSellerAddresses(response.data.sellerAddresses || []);
        } catch (err) {
            console.error('Failed to load seller addresses:', err);
        }
    };

    // Calculate shipping automatically when addresses are ready
    useEffect(() => {
        if (variant === 'auto' && 
            addresses.delivery && 
            sellerAddresses.length > 0 && 
            !calculating && 
            !result) {
            calculateShipping();
        }
    }, [addresses.delivery, sellerAddresses, variant]);

    const calculateShipping = async () => {
        if (!addresses.delivery || !sellerAddresses.length) {
            setError('Please provide delivery address and ensure seller addresses are loaded');
            return;
        }

        setCalculating(true);
        setError('');
        setResult(null);

        try {
            const shippingData = sellerAddresses.map(seller => {
                const sellerProducts = sellers.find(s => s.sellerId === seller.sellerId)?.products || [];
                const totalPrice = sellerProducts.reduce((sum, product) => 
                    sum + (product.productInfo?.price || 0) * (product.quantity || 1), 0);

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
                        address: addresses.delivery,
                        latitude: seller.coordinates?.latitude, // In real app, get from Mapbox
                        longitude: seller.coordinates?.longitude,
                        name: 'Customer',
                        phone: customerPhone,
                        email: ''
                    },
                    options: {
                        weight: options.weight,
                        vehicleId: options.vehicleId,
                        isInsured: options.isInsured,
                        isCOD: options.isCOD,
                        loadersCount: options.loadersCount,
                        parcel_amount: totalPrice,
                        useRealTimeRouting: options.useRealTimeRouting
                    }
                };
            });

            const response = await api.post('/shipping/calculate', { sellers: shippingData });
            
            if (response.data) {
                setResult(response.data);
                if (onShippingCalculated) {
                    onShippingCalculated(response.data);
                }
            } else {
                throw new Error('Invalid response from shipping API');
            }
        } catch (err) {
            console.error('Shipping calculation error:', err);
            setError(err.response?.data?.error || 'Failed to calculate shipping');
            
            // Fallback calculation
            const fallbackResult = calculateFallbackShipping();
            setResult(fallbackResult);
            if (onShippingCalculated) {
                onShippingCalculated(fallbackResult);
            }
        } finally {
            setCalculating(false);
        }
    };

    const calculateFallbackShipping = () => {
        // Simple fallback calculation based on number of sellers and distance
        const baseFee = 750;
        const perSellerFee = 250;
        const totalFee = baseFee + (sellerAddresses.length * perSellerFee);
        
        return {
            totalFee: totalFee.toFixed(2),
            breakdown: sellerAddresses.map(seller => ({
                sellerId: seller.sellerId,
                fee: perSellerFee.toFixed(2),
                serviceable: true,
                fallback: true
            })),
            currency: 'NGN',
            hasFallback: true,
            note: 'Estimated shipping fee (Kwik service unavailable)'
        };
    };

    const handleAddressChange = (type, value) => {
        setAddresses(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const getValidationColor = (type) => {
        const validation = addressValidation[type];
        if (!validation) return 'default';
        if (validation.valid && validation.serviceable) return 'success';
        if (validation.valid && !validation.serviceable) return 'warning';
        return 'error';
    };

    const getValidationIcon = (type) => {
        const validation = addressValidation[type];
        if (!validation) return <LocationOn color="disabled" />;
        if (validation.valid && validation.serviceable) return <CheckCircle color="success" />;
        if (validation.valid && !validation.serviceable) return <Error color="warning" />;
        return <Error color="error" />;
    };

    const getValidationText = (type) => {
        const validation = addressValidation[type];
        if (!validation) return 'Enter address to validate';
        if (validation.valid && validation.serviceable) return 'Valid and serviceable address';
        if (validation.valid && !validation.serviceable) return 'Valid address but outside service area';
        return validation.error || 'Invalid address format';
    };

    const canCalculate = addresses.delivery && sellerAddresses.length > 0;

    // For auto variant, don't render anything
    if (variant === 'auto') {
        return null;
    }

    // Simple variant for minimal display
    if (variant === 'simple') {
        return (
            <Card sx={{ maxWidth: 400 }}>
                <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                        <LocalShipping sx={{ mr: 1 }} />
                        <Typography variant="h6">Shipping Calculator</Typography>
                    </Box>

                    <TextField
                        fullWidth
                        label="Delivery Address"
                        value={addresses.delivery}
                        onChange={(e) => handleAddressChange('delivery', e.target.value)}
                        margin="normal"
                        size="small"
                        InputProps={{
                            startAdornment: getValidationIcon('delivery')
                        }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={calculateShipping}
                        disabled={!canCalculate || calculating}
                        startIcon={calculating ? <CircularProgress size={20} /> : <Calculate />}
                        sx={{ mt: 2 }}
                    >
                        {calculating ? 'Calculating...' : 'Calculate Shipping'}
                    </Button>

                    {result && (
                        <Box mt={2}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Total: ₦{result.totalFee}
                            </Typography>
                            {result.hasFallback && (
                                <Chip 
                                    label="Estimated" 
                                    size="small" 
                                    color="warning" 
                                    variant="outlined"
                                    sx={{ mt: 1 }}
                                />
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Full variant with all options
    return (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box display="flex" alignItems="center">
                        <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">Shipping Calculator</Typography>
                        <Chip 
                            label="Kwik Delivery" 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            sx={{ ml: 2 }}
                        />
                    </Box>
                    <Tooltip title="Refresh options">
                        <IconButton onClick={loadVehicleOptions} size="small">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Delivery Address */}
                <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                        Delivery Address
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="Enter complete Nigerian delivery address"
                        value={addresses.delivery}
                        onChange={(e) => handleAddressChange('delivery', e.target.value)}
                        InputProps={{
                            startAdornment: getValidationIcon('delivery')
                        }}
                    />
                </Box>

                {/* Seller Addresses */}
                {sellerAddresses.length > 0 && (
                    <Box mb={3}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Typography variant="subtitle2">
                                Seller Pickup Locations ({sellerAddresses.length})
                            </Typography>
                            <Chip 
                                label={`${sellerAddresses.filter(s => s.serviceable).length} serviceable`}
                                size="small"
                                color="success"
                                variant="outlined"
                            />
                        </Box>
                        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                            {sellerAddresses.map((seller, index) => (
                                <Box 
                                    key={seller.sellerId} 
                                    mb={1} 
                                    p={1} 
                                    bgcolor={seller.serviceable ? 'success.light' : 'warning.light'} 
                                    borderRadius={1}
                                >
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Typography variant="body2" fontWeight="medium">
                                            {seller.shopName}
                                        </Typography>
                                        <Chip 
                                            label={seller.serviceable ? 'Ready' : 'Check'} 
                                            size="small" 
                                            color={seller.serviceable ? 'success' : 'warning'}
                                        />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                                        {seller.address}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Advanced Options */}
                <Box mb={2}>
                    <Button
                        startIcon={advancedOpen ? <ExpandLess /> : <ExpandMore />}
                        onClick={() => setAdvancedOpen(!advancedOpen)}
                        size="small"
                        color="primary"
                    >
                        Advanced Options
                    </Button>
                </Box>

                <Collapse in={advancedOpen}>
                    <Grid container spacing={2} mb={3}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Vehicle Type</InputLabel>
                                <Select
                                    value={options.vehicleId}
                                    label="Vehicle Type"
                                    onChange={(e) => setOptions(prev => ({ ...prev, vehicleId: e.target.value }))}
                                >
                                    <MenuItem value={0}>Auto Select (Recommended)</MenuItem>
                                    {vehicles.map(vehicle => (
                                        <MenuItem key={vehicle.id} value={vehicle.id}>
                                            {vehicle.name} - ₦{vehicle.base_fare}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Package Weight (kg)"
                                type="number"
                                size="small"
                                value={options.weight}
                                onChange={(e) => setOptions(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1 }))}
                                inputProps={{ min: 0.1, step: 0.1 }}
                                helperText="Total weight of all items"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Loaders</InputLabel>
                                <Select
                                    value={options.loadersCount}
                                    label="Loaders"
                                    onChange={(e) => setOptions(prev => ({ ...prev, loadersCount: e.target.value }))}
                                >
                                    <MenuItem value={0}>No Loaders</MenuItem>
                                    {loaders.slice(0, 5).map((loader, index) => (
                                        <MenuItem key={index} value={index + 1}>
                                            {index + 1} Loader{index > 0 ? 's' : ''}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={options.isInsured}
                                        onChange={(e) => setOptions(prev => ({ ...prev, isInsured: e.target.checked }))}
                                        color="primary"
                                    />
                                }
                                label="Package Insurance"
                            />
                        </Grid>
                    </Grid>
                </Collapse>

                {/* Calculate Button */}
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={calculateShipping}
                    disabled={!canCalculate || calculating}
                    startIcon={calculating ? <CircularProgress size={20} /> : <Calculate />}
                >
                    {calculating ? 'Calculating Shipping...' : 'Calculate Shipping Cost'}
                </Button>

                {/* Error Display */}
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Results Display */}
                {result && (
                    <Box mt={3} p={2} bgcolor="success.light" borderRadius={1}>
                        <Box display="flex" alignItems="center" mb={1}>
                            <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                            <Typography variant="h6">Shipping Calculated</Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body1">Total Shipping Fee:</Typography>
                            <Typography variant="h6" color="primary.main">
                                ₦{result.totalFee}
                            </Typography>
                        </Box>

                        {result.hasFallback && (
                            <Alert severity="warning" sx={{ mt: 1 }}>
                                Some fees are estimated due to service unavailability
                            </Alert>
                        )}

                        {/* Enhanced Breakdown */}
                        {result.breakdown && result.breakdown.length > 0 && (
                            <Box mt={2}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Seller Breakdown:
                                </Typography>
                                {result.breakdown.map((item, index) => {
                                    const seller = sellerAddresses.find(s => s.sellerId === item.sellerId);
                                    return (
                                        <Box key={index} mb={1} p={1} bgcolor="white" borderRadius={1}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2" fontWeight="medium">
                                                    {seller?.shopName || `Seller ${index + 1}`}
                                                </Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    ₦{item.fee || '0.00'}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {item.serviceable ? '✓ Serviceable' : '⚠ Check address'}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}

                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                            <Chip
                                label="Powered by Kwik"
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default ShippingCalculator;