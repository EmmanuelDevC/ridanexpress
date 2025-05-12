import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/api'

export const get_seller_request = createAsyncThunk(
    'seller/get_seller_request',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await api.get(`/request-seller-get?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const get_seller = createAsyncThunk(
    'seller/get_seller',
    async (sellerId, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await api.get(`/get-seller/${sellerId}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

// Modified get_seller_details thunk
export const get_seller_details = createAsyncThunk(
    'seller/get_seller_details',
    async (sellerId, { rejectWithValue, fulfillWithValue, getState, dispatch }) => {
        const state = getState()
        const token = state.auth.token
        
        // Only add auth header if token exists
        const config = token ? {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        } : {}

        try {
            const { data } = await api.get(`/seller-details/${sellerId}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            if (error.response?.status === 401) {
                // dispatch(logout())
            }
            return rejectWithValue(error.response?.data || { message: 'An error occurred' })
        }
    }
)

// Modified get_seller_products thunk
export const get_seller_products = createAsyncThunk(
    'seller/get_seller_products',
    async ({ sellerId, page, parPage }, { rejectWithValue, fulfillWithValue, getState, dispatch }) => {
        const state = getState()
        const token = state.auth.token
        
        const config = token ? {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        } : {}

        try {
            const { data } = await api.get(
                `/seller-products/${sellerId}?page=${page}&parPage=${parPage}`,
                config
            )
            return fulfillWithValue(data)
        } catch (error) {
            if (error.response?.status === 401) {
                // dispatch(logout())
            }
            return rejectWithValue(error.response?.data || { message: 'An error occurred' })
        }
    }
)

export const seller_status_update = createAsyncThunk(
    'seller/seller_status_update',
    async (info, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await api.post(`/seller-status-update`, info, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


export const get_active_sellers = createAsyncThunk(
    'seller/get_active_sellers',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await api.get(`/get-sellers?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)


export const get_deactive_sellers = createAsyncThunk(
    'seller/get_active_sellers',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await api.get(`/get-deactive-sellers?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const create_stripe_connect_account = createAsyncThunk(
    'seller/create_stripe_connect_account',
    async (_, { getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data: { url } } = await api.get(`/payment/create-stripe-connect-account`, config)
            window.location.href = url
            // return fulfillWithValue(data)
        } catch (error) {
            //return rejectWithValue(error.response.data)
        }
    }
)

export const active_stripe_connect_account = createAsyncThunk(
    'seller/active_stripe_connect_account',
    async (activeCode, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        try {
            const { data } = await api.put(`/payment/active-stripe-connect-account/${activeCode}`, {}, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const sellerReducer = createSlice({
    name: 'seller',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        sellers: [],
        totalSeller: 0,
        seller: '',
        sellerDetails: null,
        sellerProducts: [],
        totalProducts: 0,
        currentPage: 1,
        parPage: 12,
        loadingProducts: false,
        loadingDetails: false
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
    },
    extraReducers: {
        [get_seller_request.fulfilled]: (state, { payload }) => {
            state.sellers = payload.sellers
            state.totalSeller = payload.totalSeller
        },
        [get_seller.fulfilled]: (state, { payload }) => {
            state.seller = payload.seller
        },
        [seller_status_update.fulfilled]: (state, { payload }) => {
            state.seller = payload.seller
            state.successMessage = payload.message
        },
        [get_active_sellers.fulfilled]: (state, { payload }) => {
            state.sellers = payload.sellers
            state.totalSeller = payload.totalSeller
        },
        [get_seller_products.pending]: (state) => {
            state.loadingProducts = true
        },
        [get_seller_products.fulfilled]: (state, { payload }) => {
            state.sellerProducts = payload.products
            state.totalProducts = payload.totalProducts
            state.currentPage = payload.currentPage
            state.parPage = payload.parPage
            state.loadingProducts = false
        },
        [get_seller_products.rejected]: (state) => {
            state.loadingProducts = false
        },

        [get_seller_details.pending]: (state) => {
            state.loadingDetails = true
        },
        [get_seller_details.fulfilled]: (state, { payload }) => {
            state.sellerDetails = payload.seller
            state.loadingDetails = false
        },
        [get_seller_details.rejected]: (state) => {
            state.loadingDetails = false
        },
        [active_stripe_connect_account.pending]: (state, { payload }) => {
            state.loader = true
        },
        [active_stripe_connect_account.rejected]: (state, { payload }) => {
            state.loader = false
            state.errorMessage = payload.message
        },
        [active_stripe_connect_account.fulfilled]: (state, { payload }) => {
            state.loader = false
            state.successMessage = payload.message
        },
    }

})
export const { messageClear } = sellerReducer.actions
export default sellerReducer.reducer