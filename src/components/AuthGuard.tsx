'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthData } from '@/lib/authUtils';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserType?: 'patient' | 'doctor';
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

export default function AuthGuard({ 
  children, 
  requiredUserType, 
  redirectTo = '/login',
  loadingComponent 
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authData, setAuthDataState] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Delay the auth check slightly to ensure localStorage is ready
    const checkAuth = async () => {
      // Wait for client-side hydration
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        const auth = getAuthData();
        console.log('AuthGuard - Checking authentication:', { 
          hasAuth: !!auth, 
          userType: auth?.userType, 
          requiredUserType 
        });

        if (!auth) {
          console.log('AuthGuard - No auth data found, redirecting to:', redirectTo);
          setIsAuthenticated(false);
          router.replace(redirectTo);
          return;
        }

        if (requiredUserType && auth.userType !== requiredUserType) {
          console.log('AuthGuard - Wrong user type, redirecting to:', redirectTo);
          setIsAuthenticated(false);
          router.replace(redirectTo);
          return;
        }

        console.log('AuthGuard - Authentication successful');
        setAuthDataState(auth.userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('AuthGuard - Authentication check failed:', error);
        setIsAuthenticated(false);
        router.replace(redirectTo);
      }
    };

    checkAuth();
  }, [router, requiredUserType, redirectTo]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Render children with auth data available
  return <>{children}</>;
}
