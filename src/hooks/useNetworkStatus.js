// hooks/useNetworkStatus.js
import { useState, useEffect, useCallback, useRef } from 'react';

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [isStableOffline, setIsStableOffline] = useState(false);
  
  // Refs to track state without re-renders
  const isOnlineRef = useRef(navigator.onLine);
  const modalTimeoutRef = useRef(null);

  console.log('🔄 useNetworkStatus - Current state:', { 
    isOnline, 
    showOfflineModal, 
    isStableOffline,
    browserOnline: navigator.onLine 
  });

  const checkConnection = useCallback(async () => {
    try {
      console.log('🔍 Checking server connection...');
      
      // Add timestamp to avoid cache
      const response = await fetch(`/api/health-check?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('✅ Server response:', response.status);
      
      if (response.ok) {
        if (!isOnlineRef.current) {
          console.log('🎉 Connection restored - waiting for stability...');
          
          // Wait 2 seconds before hiding modal to ensure stable connection
          modalTimeoutRef.current = setTimeout(() => {
            console.log('✅ Stable connection confirmed, hiding modal');
            setIsOnline(true);
            setIsStableOffline(false);
            setShowOfflineModal(false);
          }, 2000);
        }
        isOnlineRef.current = true;
        return true;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.log('❌ Connection check failed:', error.message);
      
      // Clear any pending "online" timeouts
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
        modalTimeoutRef.current = null;
      }
      
      if (isOnlineRef.current || !isStableOffline) {
        console.log('🚨 Switching to stable offline mode');
        setIsOnline(false);
        setIsStableOffline(true);
        setShowOfflineModal(true);
      }
      isOnlineRef.current = false;
      return false;
    }
  }, []);

  useEffect(() => {
    console.log('📡 Setting up network listeners...');

    let checkInterval;

    const handleOnline = () => {
      console.log('🌐 Browser: Online event fired');
      isOnlineRef.current = true;
      // Don't immediately update state - wait for server confirmation
      checkConnection();
    };

    const handleOffline = () => {
      console.log('📵 Browser: Offline event fired');
      isOnlineRef.current = false;
      setIsOnline(false);
      setIsStableOffline(true);
      setShowOfflineModal(true);
      
      // Clear any pending online timeouts
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
        modalTimeoutRef.current = null;
      }
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkConnection();

    // Periodic checks (every 15 seconds)
    checkInterval = setInterval(checkConnection, 15000);

    return () => {
      console.log('🧹 Cleaning up network listeners');
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(checkInterval);
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
      }
    };
  }, [checkConnection]);

  return { 
    isOnline, 
    showOfflineModal, 
    setShowOfflineModal,
    isStableOffline 
  };
};

export default useNetworkStatus;