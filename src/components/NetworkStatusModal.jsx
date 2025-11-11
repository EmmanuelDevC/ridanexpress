// components/NetworkStatusModal.jsx
import React, { useEffect, useState } from 'react';

const NetworkStatusModal = ({ isOpen, onClose, isOnline, isStableOffline }) => {
  const [visible, setVisible] = useState(false);
  const [autoCloseTimer, setAutoCloseTimer] = useState(null);

  console.log('🎪 Modal props:', { isOpen, isOnline, isStableOffline });

  useEffect(() => {
    if (isOpen) {
      console.log('🟢 Showing modal');
      setVisible(true);
      
      if (isOnline) {
        const timer = setTimeout(() => {
          console.log('⏰ Auto-closing online modal');
          setVisible(false);
          setTimeout(onClose, 300);
        }, 3000);
        
        setAutoCloseTimer(timer);
      } else {
        if (autoCloseTimer) {
          clearTimeout(autoCloseTimer);
          setAutoCloseTimer(null);
        }
      }
    } else {
      console.log('🔴 Hiding modal');
      setVisible(false);
    }

    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [isOpen, isOnline, onClose]);

  if (!isOpen && !visible) return null;

  // Animated SVG Components
  const OnlineAnimation = () => (
    <div className="w-20 h-20 mx-auto mb-4">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          fill="none" 
          stroke="#10b981" 
          strokeWidth="8"
          className="animate-drawCircle"
        />
        <path 
          d="M30,50 L45,65 L70,35" 
          fill="none" 
          stroke="#10b981" 
          strokeWidth="8" 
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-drawCheck"
        />
      </svg>
    </div>
  );

  const OfflineAnimation = () => (
    <div className="w-20 h-20 mx-auto mb-4">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          fill="none" 
          stroke="#ef4444" 
          strokeWidth="8"
          className="animate-pulseGlow"
        />
        <path 
          d="M35,35 L65,65 M65,35 L35,65" 
          fill="none" 
          stroke="#ef4444" 
          strokeWidth="8" 
          strokeLinecap="round"
          className="animate-drawX"
        />
        <circle 
          cx="50" 
          cy="50" 
          r="8" 
          fill="#ef4444"
          className="animate-pingSmall"
        />
      </svg>
    </div>
  );

  const ConnectionWaves = () => (
    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
      <svg width="120" height="40" viewBox="0 0 120 40" className="w-30 h-10">
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${20 + i * 30} 20 L${25 + i * 30} 10 L${30 + i * 30} 20 L${35 + i * 30} 30 L${40 + i * 30} 20`}
            fill="none"
            stroke={isOnline ? "#10b981" : "#ef4444"}
            strokeWidth="2"
            className="animate-connectionWave"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </svg>
    </div>
  );

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-[9999] p-4 transition-all duration-500 ${visible ? 'bg-opacity-95' : 'bg-opacity-0 pointer-events-none'}`}>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="absolute inset-0">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className={`relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl border transition-all duration-500 transform ${visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} ${isOnline ? 'border-green-200 shadow-green-500/10' : 'border-orange-200 shadow-orange-500/10'}`}>
        
        {/* Connection Waves */}
        <ConnectionWaves />
        
        {/* Animated Icon */}
        <div className="text-center mb-6">
          {isOnline ? <OnlineAnimation /> : <OfflineAnimation />}
        </div>
        
        {/* Content */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {isOnline ? 'Connection Restored!' : 'Connection Lost'}
          </h2>
          
          <p className="text-gray-600 leading-relaxed">
            {isOnline 
              ? 'Your internet connection has been restored. Continue your seamless shopping experience.'
              : 'Unable to connect to the internet. Some features may be unavailable while we try to reconnect.'
            }
          </p>

          {/* Progress bar for auto-close */}
          {isOnline && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-3000 ease-linear"
                style={{ 
                  width: visible ? '0%' : '100%',
                  transition: visible ? 'width 3s linear' : 'none'
                }}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mt-6">
          {!isOnline ? (
            <>
              <button
                onClick={() => {
                  console.log('🔄 Manual reconnect triggered');
                  window.location.reload();
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-orange-500/25 transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Try Again
              </button>
              <button
                onClick={() => {
                  console.log('🔕 User dismissed offline modal');
                  onClose();
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-gray-300 hover:border-gray-400"
              >
                Dismiss
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                console.log('✅ User closed online modal early');
                if (autoCloseTimer) clearTimeout(autoCloseTimer);
                setVisible(false);
                setTimeout(onClose, 300);
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5"
            >
              Continue Shopping
            </button>
          )}
        </div>

        {isOnline && (
          <p className="text-xs text-gray-500 text-center mt-4 animate-pulse">
            redirecting you back in a moment...
          </p>
        )}
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes drawCheck {
          from {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
          }
          to {
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
          }
        }
        @keyframes drawX {
          from {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
          }
          to {
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 1;
            filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.5));
          }
          50% {
            opacity: 0.8;
            filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.8));
          }
        }
        @keyframes pingSmall {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes connectionWave {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-drawCircle {
          stroke-dasharray: 251;
          stroke-dashoffset: 251;
          animation: drawCircle 1s ease-out forwards;
        }
        .animate-drawCheck {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawCheck 0.5s ease-out 0.5s forwards;
        }
        .animate-drawX {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawX 0.5s ease-out 0.3s forwards;
        }
        .animate-pulseGlow {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        .animate-pingSmall {
          animation: pingSmall 2s ease-in-out infinite;
        }
        .animate-connectionWave {
          animation: connectionWave 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NetworkStatusModal;