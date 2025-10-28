import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  Schedule,
  LocationOn,
  Person
} from '@mui/icons-material';
import api from '../api/api';

const TrackDelivery = ({ orderId, delivery }) => {
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusSteps = [
    { label: 'Order Placed', status: 'pending' },
    { label: 'Confirmed', status: 'confirmed' },
    { label: 'Picked Up', status: 'picked_up' },
    { label: 'In Transit', status: 'in_transit' },
    { label: 'Out for Delivery', status: 'out_for_delivery' },
    { label: 'Delivered', status: 'delivered' }
  ];

  const getActiveStep = (status) => {
    const stepIndex = statusSteps.findIndex(step => step.status === status);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  const fetchTrackingInfo = async () => {
    if (!orderId) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/seller/track-delivery/${orderId}`);
      setTrackingInfo(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingInfo();

    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchTrackingInfo, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (!delivery && !trackingInfo) {
    return null;
  }

  const currentDelivery = trackingInfo || delivery;
  const activeStep = getActiveStep(currentDelivery?.status);

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Delivery Tracking</Typography>
          </Box>
          <Chip 
            label={currentDelivery?.provider === 'kwik' ? 'Kwik Delivery' : 'Standard Delivery'} 
            color="primary" 
            size="small" 
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tracking ID */}
        {currentDelivery?.trackingNumber && (
          <Box mb={3} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2" color="text.secondary">
              Tracking Number:
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {currentDelivery.trackingNumber}
            </Typography>
            {currentDelivery.trackingUrl && (
              <Button 
                size="small" 
                href={currentDelivery.trackingUrl} 
                target="_blank"
                sx={{ mt: 1 }}
              >
                View Live Tracking
              </Button>
            )}
          </Box>
        )}

        {/* Progress Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical">
          {statusSteps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                icon={
                  index <= activeStep ? (
                    <CheckCircle color="primary" />
                  ) : (
                    <Schedule color="disabled" />
                  )
                }
              >
                {step.label}
              </StepLabel>
              <StepContent>
                {index === activeStep && currentDelivery?.status && (
                  <Typography variant="body2" color="text.secondary">
                    Current status: {currentDelivery.status.replace('_', ' ')}
                  </Typography>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Rider Information */}
        {currentDelivery?.rider && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" alignItems="center" gap={2}>
              <Person color="action" />
              <Box>
                <Typography variant="subtitle2">Delivery Rider</Typography>
                <Typography variant="body2">
                  {currentDelivery.rider.name} • {currentDelivery.rider.phone}
                </Typography>
                {currentDelivery.rider.vehicle && (
                  <Typography variant="body2" color="text.secondary">
                    Vehicle: {currentDelivery.rider.vehicle}
                  </Typography>
                )}
              </Box>
            </Box>
          </>
        )}

        {/* Package Details */}
        {currentDelivery?.package && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Package Details
              </Typography>
              <Box display="flex" gap={3} flexWrap="wrap">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Weight
                  </Typography>
                  <Typography variant="body2">
                    {currentDelivery.package.weight} kg
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Items
                  </Typography>
                  <Typography variant="body2">
                    {currentDelivery.package.item_count}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Dimensions
                  </Typography>
                  <Typography variant="body2">
                    {currentDelivery.package.length}x{currentDelivery.package.width}x{currentDelivery.package.height}cm
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}

        {/* Refresh Button */}
        <Box mt={2}>
          <Button
            onClick={fetchTrackingInfo}
            disabled={loading}
            startIcon={<LocalShipping />}
            variant="outlined"
            size="small"
          >
            {loading ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrackDelivery;