import {
    createSlice,
    createAsyncThunk
} from '@reduxjs/toolkit'
import api from '../../api/api'

export const place_order = createAsyncThunk(
    'order/place_order',
    async ({
        price,
        products,
        shipping_fee,
        shippingInfo,
        userId,
        navigate,
        items
    }, { getState }) => {
        try {
            const token = getState().auth.token
            const config = {
                headers: {
                    'authorization': `Bearer ${token}`
                }
            }
            const {
                data
            } = await api.post('/home/order/place-order', {
                price,
                products,
                shipping_fee,
                shippingInfo,
                userId,
                navigate,
                items,
            }, config)
            navigate('/payment', {
                state: {
                    price: price + shipping_fee,
                    items,
                    orderId: data.orderId
                }
            })
            console.log(data)
            return true
        } catch (error) {
            console.log(error.response)
        }
    }
)

export const order_confirm = createAsyncThunk(
    'order/order_confirm',
    async ({ orderId, transaction_id }, { getState }) => {
        try {
            const token = getState().auth.token
            const config = {
                headers: {
                    'authorization': `Bearer ${token}`
                }
            }
            await api.post(`/home/order/confirm/${orderId}`, { transaction_id }, config)
            return { orderId }
        } catch (error) {
            console.log(error.response)
            throw error.response.data
        }
    }
)


export const get_orders = createAsyncThunk(
    'order/get_orders',
    async ({
        customerId,
        status
    }, {
        rejectWithValue,
        fulfillWithValue,
        getState
    }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'authorization': `Bearer ${token}`
            }
        }
        try {
            const {
                data
            } = await api.get(`/home/customer/get-orders/${customerId}/${status}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error.response)
        }
    }
)

export const get_order = createAsyncThunk(
    'order/get_order',
    async (orderId, {
        rejectWithValue,
        fulfillWithValue,
        getState
    }) => {
        const token = getState().auth.token
        const config = {
            headers: {
                'authorization': `Bearer ${token}`
            }
        }
        try {
            const {
                data
            } = await api.get(`/home/customer/get-order/${orderId}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error.response)
        }
    }
)

export const orderReducer = createSlice({
    name: 'order',
    initialState: {
        myOrders: [],
        errorMessage: '',
        successMessage: '',
        myOrder: {}
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = ''
            state.successMessage = ''
        }
    },
    extraReducers: {
        [get_orders.fulfilled]: (state, { payload }) => {
            state.myOrders = payload.orders
        },
        [get_order.fulfilled]: (state, { payload }) => {
            state.myOrder = payload.order
        },
        [order_confirm.fulfilled]: (state, action) => {
            state.successMessage = 'Payment confirmed'
            state.myOrders = state.myOrders.map(order =>
                order._id === action.payload.orderId
                    ? { ...order, payment_status: 'paid' }
                    : order
            )
        },
        [order_confirm.rejected]: (state, action) => {
            state.errorMessage = action.error.message
        }
    }
})

export const {
    messageClear
} = orderReducer.actions
export default orderReducer.reducer