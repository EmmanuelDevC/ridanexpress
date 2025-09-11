import {
    createSlice,
    createAsyncThunk
} from '@reduxjs/toolkit'
import api from '../../api/api'

export const add_to_card = createAsyncThunk(
    'card/add_to_card',
    async (info, {
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
            } = await api.post('/home/product/add-to-card', info, config)
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error.response)
            return rejectWithValue(error.response.data)
        }
    }
)

// New thunk for adding products directly from chat
export const add_to_card_from_chat = createAsyncThunk(
    'card/add_to_card_from_chat',
    async (product, {
        rejectWithValue,
        fulfillWithValue,
        getState,
        dispatch
    }) => {
        const token = getState().auth.token
        
        if (token) {
            // User is authenticated - make API call
            const config = {
                headers: {
                    'authorization': `Bearer ${token}`
                }
            }
            try {
                const { data } = await api.post('/home/product/add-to-card', {
                    productId: product.id,
                    price: product.price,
                    quantity: 1
                }, config)
                return fulfillWithValue(data)
            } catch (error) {
                console.log(error.response)
                return rejectWithValue(error.response.data)
            }
        } else {
            // User is not authenticated - update local state only
            return fulfillWithValue({
                message: 'Product added to cart (local)',
                product: {
                    ...product,
                    _id: `chat-${Date.now()}`,
                    quantity: 1
                }
            })
        }
    }
)

export const get_card_products = createAsyncThunk(
    'card/get_card_products',
    async (userId, {
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
            } = await api.get(`/home/product/get-card-product/${userId}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const delete_card_product = createAsyncThunk(
    'card/delete_card_product',
    async (card_id, {
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
            } = await api.delete(`/home/product/delete-card-product/${card_id}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const quantity_inc = createAsyncThunk(
    'card/quantity_inc',
    async (card_id, {
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
            } = await api.put(`/home/product/quantity-inc/${card_id}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const quantity_dec = createAsyncThunk(
    'card/quantity_dec',
    async (card_id, {
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
            } = await api.put(`/home/product/quantity-dec/${card_id}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const add_to_wishlist = createAsyncThunk(
    'wishlist/add_to_wishlist',
    async (info, {
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
            } = await api.post('/home/product/add-to-wishlist', info, config)
            console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const get_wishlist_products = createAsyncThunk(
    'wishlist/get_wishlist_products',
    async (userId, {
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
            } = await api.get(`/home/product/get-wishlist-products/${userId}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const remove_wishlist = createAsyncThunk(
    'wishlist/remove_wishlist',
    async (wishlistId, {
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
            } = await api.delete(`/home/product/delete-wishlist-product/${wishlistId}`, config)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)

export const cardReducer = createSlice({
    name: 'card',
    initialState: {
        card_products: [],
        card_product_count: 0,
        buy_product_item: 0,
        wishlist_count: 0,
        wishlist: [],
        price: 0,
        errorMessage: '',
        successMessage: '',
        shipping_fee: 0,
        outofstock_products: [],
        // New state for chat cart
        chat_cart: [],
        chat_cart_count: 0
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = ''
            state.successMessage = ''
        },
        reset_count: (state, _) => {
            state.card_product_count = 0
            state.wishlist_count = 0
        },
        // New reducers for chat cart management
        add_to_chat_cart: (state, action) => {
            const product = action.payload;
            const existingItem = state.chat_cart.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.chat_cart.push({
                    ...product,
                    quantity: 1,
                    _id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                });
                state.chat_cart_count += 1;
            }
            
            // Update total price
            state.price = state.chat_cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        remove_from_chat_cart: (state, action) => {
            const productId = action.payload;
            state.chat_cart = state.chat_cart.filter(item => item.id !== productId);
            state.chat_cart_count = state.chat_cart.length;
            
            // Update total price
            state.price = state.chat_cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        update_chat_cart_quantity: (state, action) => {
            const { productId, quantity } = action.payload;
            const item = state.chat_cart.find(item => item.id === productId);
            
            if (item) {
                item.quantity = quantity;
                
                // Update total price
                state.price = state.chat_cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            }
        },
        clear_chat_cart: (state) => {
            state.chat_cart = [];
            state.chat_cart_count = 0;
            state.price = 0;
        },
        // Sync chat cart with main cart when user logs in
        sync_chat_cart: (state, action) => {
            const { token } = action.payload;
            
            if (token) {
                // User is now authenticated, move chat cart items to main cart
                state.card_products = [...state.card_products, ...state.chat_cart];
                state.card_product_count += state.chat_cart_count;
                
                // Clear chat cart
                state.chat_cart = [];
                state.chat_cart_count = 0;
            }
        }
    },
    extraReducers: {
        [add_to_card.rejected]: (state, {
            payload
        }) => {
            state.errorMessage = payload.error
        },
        [add_to_card.fulfilled]: (state, {
            payload
        }) => {
            state.successMessage = payload.message
            state.card_product_count = state.card_product_count + 1
        },
        [add_to_card_from_chat.rejected]: (state, { payload }) => {
            state.errorMessage = payload?.error || 'Failed to add product to cart'
        },
        [add_to_card_from_chat.fulfilled]: (state, { payload }) => {
            if (payload.product) {
                // Local cart update for unauthenticated users
                const existingItem = state.chat_cart.find(item => item.id === payload.product.id);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    state.chat_cart.push(payload.product);
                    state.chat_cart_count += 1;
                }
                
                // Update total price
                state.price = state.chat_cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            }
            state.successMessage = payload.message
        },
        [get_card_products.fulfilled]: (state, {
            payload
        }) => {
            state.card_products = payload.card_products
            state.price = payload.price
            state.card_product_count = payload.card_product_count
            state.shipping_fee = payload.shipping_fee
            state.outofstock_products = payload.outOfStockProduct
            state.buy_product_item = payload.buy_product_item
        },
        [delete_card_product.fulfilled]: (state, {
            payload
        }) => {
            state.successMessage = payload.message
        },
        [quantity_inc.fulfilled]: (state, {
            payload
        }) => {
            state.successMessage = payload.message
        },
        [quantity_dec.fulfilled]: (state, {
            payload
        }) => {
            state.successMessage = payload.message
        },
        [add_to_wishlist.rejected]: (state, {
            payload
        }) => {
            state.errorMessage = payload.error
        },
        [add_to_wishlist.fulfilled]: (state, {
            payload
        }) => {
            state.successMessage = payload.message
            state.wishlist_count = state.wishlist_count > 0 ? state.wishlist_count + 1 : 1
        },
        [get_wishlist_products.fulfilled]: (state, {
            payload
        }) => {
            state.wishlist = payload.wishlists
            state.wishlist_count = payload.wishlistCount
        },
        [remove_wishlist.fulfilled]: (state, {
            payload
        }) => {
            state.successMessage = payload.message
            state.wishlist = state.wishlist.filter(p => p._id !== payload.wishlistId)
            state.wishlist_count = state.wishlist_count - 1
        }
    }
})

export const {
    messageClear,
    reset_count,
    add_to_chat_cart,
    remove_from_chat_cart,
    update_chat_cart_quantity,
    clear_chat_cart,
    sync_chat_cart
} = cardReducer.actions
export default cardReducer.reducer