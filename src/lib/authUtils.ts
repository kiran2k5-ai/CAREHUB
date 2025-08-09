// Utility functions for robust authentication handling
export interface AuthData {
  userData: any;
  userType: 'patient' | 'doctor';
  authToken: string;
}

// In-memory cache to prevent localStorage race conditions
let authCache: AuthData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

export const getAuthData = (): AuthData | null => {
  // Ensure we're on client side
  if (typeof window === 'undefined') {
    return null;
  }

  // Return cached data if it's fresh (within 5 seconds)
  const now = Date.now();
  if (authCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return authCache;
  }

  try {
    const userData = localStorage.getItem('userData');
    const userType = localStorage.getItem('userType');
    const authToken = localStorage.getItem('authToken');

    if (!userData || !userType || !authToken) {
      authCache = null;
      return null;
    }

    const parsedUserData = JSON.parse(userData);
    
    // Ensure patient has proper ID
    if (userType === 'patient' && !parsedUserData.id && parsedUserData.phone) {
      parsedUserData.id = `patient_${parsedUserData.phone.replace(/[^0-9]/g, '')}`;
      localStorage.setItem('userData', JSON.stringify(parsedUserData));
    }

    const authData = {
      userData: parsedUserData,
      userType: userType as 'patient' | 'doctor',
      authToken
    };

    // Cache the result
    authCache = authData;
    cacheTimestamp = now;

    return authData;
  } catch (error) {
    console.error('Error parsing auth data:', error);
    authCache = null;
    return null;
  }
};

export const isAuthenticated = (requiredUserType?: 'patient' | 'doctor'): boolean => {
  const authData = getAuthData();
  
  if (!authData) {
    return false;
  }

  if (requiredUserType && authData.userType !== requiredUserType) {
    return false;
  }

  return true;
};

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('userData');
  localStorage.removeItem('userType');
  localStorage.removeItem('authToken');
  
  // Clear cache
  authCache = null;
  cacheTimestamp = 0;
};

export const setAuthData = (userData: any, userType: 'patient' | 'doctor', authToken: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  // Ensure patient has proper ID
  if (userType === 'patient' && !userData.id && userData.phone) {
    userData.id = `patient_${userData.phone.replace(/[^0-9]/g, '')}`;
  }

  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('userType', userType);
  localStorage.setItem('authToken', authToken);
  
  // Update cache immediately
  authCache = { userData, userType, authToken };
  cacheTimestamp = Date.now();
};

// Enhanced hook for components to use authentication
export const useAuth = () => {
  const getAuth = () => getAuthData();
  const checkAuth = (requiredUserType?: 'patient' | 'doctor') => isAuthenticated(requiredUserType);
  const logout = () => clearAuthData();
  const setAuth = (userData: any, userType: 'patient' | 'doctor', authToken: string) => setAuthData(userData, userType, authToken);

  return {
    getAuth,
    checkAuth,
    logout,
    setAuth
  };
};
