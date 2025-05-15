import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'
import jwt from 'jwt-decode'

export const customer_register = createAsyncThunk(
    'auth/customer_register',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/customer-register', info)
            // Removed automatic login after registration
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const customer_login = createAsyncThunk(
    'auth/customer_login',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/customer-login', info)
            localStorage.setItem('customerToken', data.token)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

// New async action for resending verification
export const resend_verification = createAsyncThunk(
    'auth/resend_verification',
    async (email, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/resend-verification', { email })
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)



const decodeToken = (token) => {
    try {
        return token ? jwt(token) : null;
    } catch (error) {
        console.error('Token decoding failed:', error);
        return null;
    }
};

const getInitialState = () => ({
    loader: false,
    userInfo: decodeToken(localStorage.getItem('customerToken')),
    token: localStorage.getItem('customerToken') || null,
    errorMessage: '',
    successMessage: '',
    verificationSent: false
});

export const authReducer = createSlice({
    name: 'auth',
    initialState: getInitialState(),
    reducers: {
        messageClear: (state) => {
            state.errorMessage = '';
            state.successMessage = '';
        },
        user_reset: (state) => {
            localStorage.removeItem('customerToken');
            state.userInfo = null;
            state.token = null;
        },
        verification_sent: (state, action) => {
            state.verificationSent = action.payload;
        }
    },
    extraReducers: {
        [customer_register.pending]: (state) => {
            state.loader = true;
        },
        [customer_register.fulfilled]: (state, { payload }) => {
            state.loader = false;
            state.successMessage = payload.message;
            state.verificationSent = true;
        },
        [customer_register.rejected]: (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Registration failed';
            state.verificationSent = false;
        },

        [customer_login.pending]: (state) => {
            state.loader = true;
        },
        [customer_login.fulfilled]: (state, { payload }) => {
            if (payload.token) {
                localStorage.setItem('customerToken', payload.token);
                state.token = payload.token;
                state.userInfo = decodeToken(payload.token);
            }
            state.loader = false;
            state.successMessage = payload?.message || 'Login successful';
        },
        [customer_login.rejected]: (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Login failed';
        },

        [resend_verification.pending]: (state) => {
            state.loader = true;
        },
        [resend_verification.fulfilled]: (state, { payload }) => {
            state.loader = false;
            state.successMessage = payload?.message || 'Verification email resent';
            state.verificationSent = true;
        },
        [resend_verification.rejected]: (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload?.error || 'Failed to resend verification';
        }
    }
});

export const { messageClear, user_reset, verification_sent } = authReducer.actions;
export default authReducer.reducer;