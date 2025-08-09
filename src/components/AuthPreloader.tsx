'use client';

import { useEffect } from 'react';
import { setAuthData } from '@/lib/authUtils';

// This component helps prevent authentication race conditions by pre-warming auth data
export default function AuthPreloader({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Pre-load and validate auth data on app start
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('userData');
        const userType = localStorage.getItem('userType');
        const authToken = localStorage.getItem('authToken');
        
        if (userData && userType && authToken) {
          const parsedUserData = JSON.parse(userData);
          // Re-set the auth data to ensure it's properly cached
          setAuthData(parsedUserData, userType as 'patient' | 'doctor', authToken);
        }
      } catch (error) {
        console.error('Auth preload error:', error);
      }
    }
  }, []);

  return <>{children}</>;
}
