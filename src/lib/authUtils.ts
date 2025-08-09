// Utility functions for robust authentication handling
export interface AuthData {
  userData: any;
  userType: 'patient' | 'doctor';
  authToken: string;
}

export const getAuthData = (): AuthData | null => {
  // Ensure we're on client side
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const userData = localStorage.getItem('userData');
    const userType = localStorage.getItem('userType');
    const authToken = localStorage.getItem('authToken');

    if (!userData || !userType || !authToken) {
      return null;
    }

    const parsedUserData = JSON.parse(userData);
    
    // Ensure patient has proper ID
    if (userType === 'patient' && !parsedUserData.id && parsedUserData.phone) {
      parsedUserData.id = `patient_${parsedUserData.phone.replace(/[^0-9]/g, '')}`;
      localStorage.setItem('userData', JSON.stringify(parsedUserData));
    }

    return {
      userData: parsedUserData,
      userType: userType as 'patient' | 'doctor',
      authToken
    };
  } catch (error) {
    console.error('Error parsing auth data:', error);
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
};

// Hook for components to use authentication
export const useAuth = () => {
  const getAuth = () => getAuthData();
  const checkAuth = (requiredUserType?: 'patient' | 'doctor') => isAuthenticated(requiredUserType);
  const logout = () => clearAuthData();

  return {
    getAuth,
    checkAuth,
    logout
  };
};
