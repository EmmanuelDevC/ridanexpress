import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center bg-white rounded-2xl shadow-xl p-8 space-y-8 relative overflow-hidden">
        {/* Animated Human Character */}
        <div className="absolute -bottom-4 -right-20 rotate-12 opacity-20 md:opacity-30 lg:opacity-40">
          <svg className="w-96 h-96 animate-float" viewBox="0 0 200 200">
            <g transform="translate(100 100)">
              {/* Body */}
              <path d="M -30 60 L 30 60 L 30 90 L -30 90 Z" fill="#4f46e5" />
              {/* Head */}
              <circle cx="0" cy="40" r="20" fill="#fbbf24" />
              {/* Hair */}
              <path d="M -15 25 Q 0 15 15 25" stroke="#78350f" strokeWidth="3" fill="none" />
              {/* Shopping Bag */}
              <g transform="translate(-40 70) rotate(-10)">
                <path d="M 0 0 L 20 0 L 25 30 L -5 30 Z" fill="#10b981" />
                <path d="M 5 5 L 15 5 L 18 25 L 2 25 Z" fill="#059669" />
                <path d="M 8 0 L 12 0 L 12 5 L 8 5 Z" fill="#d1d5db" />
              </g>
              {/* Magnifying Glass */}
              <g transform="translate(40 50) rotate(20)" className="animate-swing">
                <circle cx="15" cy="15" r="10" fill="none" stroke="#ef4444" strokeWidth="3" />
                <path d="M 25 25 L 35 35" stroke="#ef4444" strokeWidth="3" />
              </g>
            </g>
          </svg>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-4">
            <h1 className="text-8xl font-black text-orange-500 animate-pulse">404</h1>
            <h2 className="text-3xl font-bold text-gray-800">Lost in the Shopping Aisles?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Looks like this product went out of stock! Don't worry, we've got plenty more amazing items waiting for you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Link 
              to="/" 
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl 
                        font-semibold shadow-lg hover:shadow-xl transition-all duration-300
                        flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </Link> */}
            
            <Link 
              to="/" 
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl 
                        font-semibold shadow-lg hover:shadow-xl transition-all duration-300
                        flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Continue Shopping
            </Link>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <p className="text-gray-500">Popular Categories:</p>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {['Electronics', 'Fashion', 'Home Decor', 'Beauty', 'Sports'].map((category) => (
                <Link
                  key={category}
                  to={`/products?category=${category.toLowerCase()}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 
                            transition-colors duration-200 text-sm font-medium"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;