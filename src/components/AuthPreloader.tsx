'use client';

import { useEffect, useState } from 'react';
import { setAuthData } from '@/lib/authUtils';
import { cleanupLocalStorage } from '@/lib/storageUtils';

interface AuthPreloaderProps {
  children: React.ReactNode;
}

export function AuthPreloader({ children }: AuthPreloaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Clean up any corrupted data first
    cleanupLocalStorage();
    
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('userData');
        const userType = localStorage.getItem('userType');
        const authToken = localStorage.getItem('authToken');
        
        // Check if values exist and are not the string "undefined"
        if (userData && userData !== 'undefined' && 
            userType && userType !== 'undefined' && 
            authToken && authToken !== 'undefined') {
          const parsedUserData = JSON.parse(userData);
          // Re-set the auth data to ensure it's properly cached
          setAuthData(parsedUserData, userType as 'patient' | 'doctor', authToken);
        }
      } catch (error) {
        console.error('Auth preload error:', error);
        // Clear invalid data
        localStorage.removeItem('userData');
        localStorage.removeItem('userType');
        localStorage.removeItem('authToken');
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Render children immediately but mark as loaded after auth check
  return <div suppressHydrationWarning={true}>{children}</div>;
}
