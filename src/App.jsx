import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home';
import Shops from './pages/Shops';
import Card from './pages/Card';
import Details from './pages/Details';
import Register from './pages/Register';
import Login from './pages/Login';
import Shipping from './pages/Shipping';
import { useDispatch } from 'react-redux';
import { get_category } from './store/reducers/homeReducer'
import CategoryShops from './pages/CategoryShop';
import SearchProducts from './pages/SearchProducts';
import Payment from './pages/Payment';
import Dashboard from './pages/Dashboard';
import ProtectUser from './utils/ProtectUser';
import Index from './components/dashboard/Index';
import Orders from './components/dashboard/Orders';
import Wishlist from './components/dashboard/Wishlist';
import Order from './components/dashboard/Order';
import Chat from './components/dashboard/Chat';
import ConfirmOrder from './pages/ConfirmOrder';
import VerifyEmail from './pages/VerifyEmail';
import Seller from './pages/Seller';
import ErrorPage from './pages/Error';
import NotFoundPage from './pages/NotFoundPage';
import CustomerReview from './pages/CustomerReview';
import Profile from './components/dashboard/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NewArrivals from './pages/NewArrivals';
import BestSellers from './pages/BestSellers';


function App() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(get_category())
  }, [])
  return (
    <div className='max-w-screen min-h-screen'>
      <BrowserRouter>
        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path='/' element={<Home />} />
          <Route path='/shops' element={<Shops />} />
          <Route path='/new-arrivals' element={<NewArrivals />} />
          <Route path='/best-sellers' element={<BestSellers />} />
          <Route path='/seller/:sellerId' element={<Seller />} />
          <Route path='/products' element={<CategoryShops />} />
          <Route path='/product/:slug/reviews' element={<CustomerReview />} />
          <Route path='/products/search' element={<SearchProducts />} />
          <Route path='/card' element={<Card />} />
          <Route path='/order/confirm' element={<ConfirmOrder />} />
          <Route path='/shipping' element={<Shipping />} />
          <Route path='/payment' element={<Payment />} />
          <Route path='/product/details/:slug' element={<Details />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />

          <Route path='/dashboard' element={<ProtectUser />}>
            <Route path='' element={<Dashboard />}>
              <Route path='' element={<Index />} />
              <Route path='my-orders' element={<Orders />} />
              <Route path='my-wishlist' element={<Wishlist />} />
              <Route path='order/details/:orderId' element={<Order />} />
              <Route path='profile' element={<Profile />} />
              <Route path='chat' element={<Chat />} />
              <Route path='chat/:sellerId' element={<Chat />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;