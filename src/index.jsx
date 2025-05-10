import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast'; // Import toast
import store from './store/index';
import { 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiInfo, 
  FiXCircle, 
  FiShoppingCart,
  FiX // Add X icon for close button
} from 'react-icons/fi';

const EcommerceToaster = () => (
  <Toaster
    position="top-left"
    gutter={10}
    containerClassName="ecommerce-toast-container"
    toastOptions={{
      duration: 500,
      style: {
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        padding: '16px',
        color: '#1f2937',
        maxWidth: '420px'
      },
      success: {
        icon: <FiCheckCircle className="text-green-600 w-6 h-6" />,
        style: {
          background: '#f0fdf4',
          borderColor: '#16a34a'
        }
      },
      error: {
        icon: <FiXCircle className="text-red-600 w-6 h-6" />,
        style: {
          background: '#fef2f2',
          borderColor: '#dc2626'
        }
      },
      loading: {
        style: {
          background: '#f3f4f6',
          borderColor: '#9ca3af'
        }
      },
      custom: {
        icon: <FiShoppingCart className="text-orange-500 w-6 h-6" />,
        style: {
          background: '#fff7ed',
          borderColor: '#f97316'
        }
      },

      
      children: (t) => (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {t.icon}
            <span>{t.message}</span>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="hover:bg-gray-200 rounded-full p-1 transition-colors"
            aria-label="Close toast"
          >
            <FiX className="text-gray-500 w-5 h-5" />
          </button>
        </div>
      )
    }}
  />
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
    <EcommerceToaster />
  </Provider>
);

reportWebVitals();