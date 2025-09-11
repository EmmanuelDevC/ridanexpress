import React from 'react';
import { useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';

const CartPreview = ({ onClose, onCheckout, onViewCart }) => {
  const { userInfo } = useSelector(state => state.auth);
  const { card_products, chat_cart } = useSelector(state => state.card);
  
  // Use appropriate cart based on authentication
  const cart = userInfo ? card_products : chat_cart;
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Your Cart</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        
        <div className="max-h-64 overflow-y-auto mb-4">
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <div key={index} className="flex items-center border-b py-3">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md mr-3"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <div className="flex justify-between items-center">
                    <p className="text-indigo-600">${item.price} x {item.quantity}</p>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              Your cart is empty
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold text-lg mb-4">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onViewCart}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                View Cart
              </button>
              <button 
                onClick={onCheckout}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPreview;