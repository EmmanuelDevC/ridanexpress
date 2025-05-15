import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const get_dashboard_index_data = createAsyncThunk(
  'dashboard/get_dashboard_index_data',
  async (_, { rejectWithValue, fulfillWithValue, getState }) => { // Remove userId parameter
    const { auth } = getState();
    const token = auth.token;
    const userId = auth.userInfo?.id; // Get ID from auth state

    if (!userId) {
      return rejectWithValue({ error: 'User not authenticated' });
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}` // Capital 'A' in Authorization
      }
    };

    try {
      const { data } = await api.get(
        `/home/customer/get-dashboard-data/${userId}`,
        config
      );
      return fulfillWithValue(data);
    } catch (error) {
      console.error('Dashboard data error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: 'Server error' });
    }
  }
);

export const update_profile = createAsyncThunk(
  'dashboard/update_profile',
  async ({ userId, updates }, { rejectWithValue, getState }) => {
    const { auth } = getState();
    const token = auth.token;

    const config = {
      headers: { 'Authorization': `Bearer ${token}` }
    };

    try {
      const { data } = await api.patch(
        `/customer/update/${userId}`,
        updates,
        config
      );
      return data;
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data || { error: 'Update failed' }
      );
    }
  }
);


export const dashboardReducer = createSlice({
  name: 'dashboard',
  initialState: {
    recentOrders: [],
    errorMessage: '',
    successMessage: '',
    totalOrder: 0,
    pendingOrder: 0,
    cancelledOrder: 0,
    loading: false
  },
  reducers: {
    messageClear: (state) => {
      state.errorMessage = '';
      state.successMessage = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(get_dashboard_index_data.fulfilled, (state, { payload }) => {
        state.totalOrder = payload.totalOrder;
        state.pendingOrder = payload.pendingOrder;
        state.cancelledOrder = payload.cancelledOrder;
        state.recentOrders = payload.recentOrders;
      })
      .addCase(update_profile.pending, (state) => {
        state.loading = true;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(update_profile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.successMessage = payload.message;
      })
      .addCase(update_profile.rejected, (state, { payload }) => {
        state.loading = false;
        state.errorMessage = payload?.error || 'Update failed';
        console.log('Update error payload:', payload);
      });
  }
});

export const { messageClear } = dashboardReducer.actions;
export default dashboardReducer.reducer;