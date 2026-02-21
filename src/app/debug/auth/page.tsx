'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthData } from '@/lib/authUtils';

export default function AuthDebugPage() {
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authData = getAuthData();
        
        const debugInfo = {
          isClientSide: typeof window !== 'undefined',
          hasLocalStorage: typeof localStorage !== 'undefined',
          authData: authData,
          rawLocalStorage: {
            userData: localStorage.getItem('userData'),
            userType: localStorage.getItem('userType'),
            authToken: localStorage.getItem('authToken')
          },
          userAgent: navigator.userAgent,
          currentUrl: window.location.href,
          timestamp: new Date().toISOString()
        };
        
        setAuthInfo(debugInfo);
      } catch (error) {
        setAuthInfo({
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleTestBookingPage = () => {
    router.push('/book-appointment');
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication Debug</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Authentication Status</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(authInfo, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleTestBookingPage}
                className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Test Booking Page
              </button>
              <button
                onClick={handleLoginRedirect}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Refresh
              </button>
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>Instructions:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>This page shows your current authentication state</li>
                <li>If authData is null, you need to login first</li>
                <li>Use "Test Booking Page" to see if authentication works</li>
                <li>Check the console for additional debug information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
