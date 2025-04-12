import React, { useState } from 'react';
import Headers from '../components/Headers';
import Footer from '../components/Footer';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { MdOutlineKeyboardArrowRight, MdLocationOn, MdEdit } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { place_order } from '../store/reducers/orderReducer';

const Shipping = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { userInfo } = useSelector(state => state.auth)
    const { state: { products, price, shipping_fee, items } } = useLocation()
    const [res, setRes] = useState(false)
    const [state, setState] = useState({
        name: '',
        address: '',
        phone: '',
        post: '',
        province: '',
        city: "",
        area: ""
    })
    const inputHandle = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }
    const save = (e) => {
        e.preventDefault()
        const { name, address, phone, post, province, city, area } = state;
        if (name && address && phone && post && province && city && area) {
            setRes(true)
        }
    }
    const placeOrder = () => {
        dispatch(place_order({
            price,
            products,
            shipping_fee,
            shippingInfo: state,
            userId: userInfo.id,
            navigate,
            items
        }))
    }
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Headers />

            {/* Main Content Container */}
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Progress Header */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
                        <div className="flex items-center text-sm text-gray-500">
                            <Link to="/" className="text-blue-600 hover:text-blue-700">Home</Link>
                            <MdOutlineKeyboardArrowRight className="mx-2" />
                            <span className="text-gray-600">Shipping Information</span>
                        </div>
                    </div>

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Information Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <MdLocationOn className="text-blue-600" />
                                        Shipping Details
                                    </h2>
                                    {res && (
                                        <button
                                            onClick={() => setRes(false)}
                                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                        >
                                            <MdEdit className="w-4 h-4" />
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {!res ? (
                                    <form onSubmit={save} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { id: 'name', label: 'Full Name', placeholder: 'John Doe' },
                                                { id: 'address', label: 'Street Address', placeholder: '123 Main Street' },
                                                { id: 'city', label: 'City', placeholder: 'New York' },
                                                { id: 'province', label: 'State/Province', placeholder: 'New York' },
                                                { id: 'post', label: 'ZIP/Postal Code', placeholder: '10001' },
                                                { id: 'phone', label: 'Phone Number', placeholder: '+1 234 567 890' },
                                                { id: 'area', label: 'Area', placeholder: 'Downtown' },
                                            ].map((field) => (
                                                <div key={field.id} className="space-y-1">
                                                    <label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                                                        {field.label}
                                                    </label>
                                                    <input
                                                        id={field.id}
                                                        name={field.id}
                                                        onChange={inputHandle}
                                                        value={state[field.id]}
                                                        type="text"
                                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder={field.placeholder}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                                        >
                                            Save Shipping Details
                                        </button>
                                    </form>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="font-medium text-gray-900">{state.name}</p>
                                            <p className="text-gray-600">{state.address}</p>
                                            <p className="text-gray-600">{state.city}, {state.province} {state.post}</p>
                                            <p className="text-gray-600 mt-2">{state.phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Order Items Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                <h3 className="px-6 py-4 border-b border-gray-100 text-lg font-semibold">Order Items</h3>
                                <div className="p-6 space-y-4">
                                    {products.map((p, i) => (
                                        <div key={i} className="space-y-4">
                                            <h4 className="text-sm font-medium text-gray-500">{p.shopName}</h4>
                                            {p.products.map((pt, j) => (
                                                <div key={j} className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0">
                                                    <div className="flex items-start gap-4">
                                                        <img
                                                            src={pt.productInfo.images[0]}
                                                            alt={pt.productInfo.name}
                                                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                                        />
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{pt.productInfo.name}</h4>
                                                            <p className="text-sm text-gray-500">{pt.productInfo.brand}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-gray-900">
                                                            ${pt.productInfo.price - Math.floor((pt.productInfo.price * pt.productInfo.discount) / 100)}
                                                        </p>
                                                        <p className="text-sm text-gray-500 line-through">${pt.productInfo.price}</p>
                                                        <span className="text-xs font-medium text-green-600">
                                                            Save {pt.productInfo.discount}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal ({items} items)</span>
                                        <span className="font-medium">${price}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">${shipping_fee}</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3">
                                        <div className="flex justify-between text-base font-medium">
                                            <span>Total</span>
                                            <span className="text-blue-600">${price + shipping_fee}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={placeOrder}
                                        disabled={!res}
                                        className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${res
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Complete Order
                                    </button>
                                </div>

                                {/* Security Assurance */}
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <svg
                                            className="w-5 h-5 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        Secure SSL Encryption
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Shipping