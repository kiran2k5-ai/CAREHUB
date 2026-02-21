// Utility to clean up corrupted localStorage data
export const cleanupLocalStorage = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // Check for corrupted auth data
    const items = ['userData', 'userType', 'authToken'];
    
    for (const item of items) {
      const value = localStorage.getItem(item);
      if (value === 'undefined' || value === 'null') {
        console.log(`Removing corrupted ${item}: ${value}`);
        localStorage.removeItem(item);
      }
    }

    // Try to parse userData if it exists
    const userData = localStorage.getItem('userData');
    if (userData && userData !== 'undefined') {
      try {
        JSON.parse(userData);
      } catch (error) {
        console.log('Removing invalid JSON userData:', userData);
        localStorage.removeItem('userData');
        localStorage.removeItem('userType');
        localStorage.removeItem('authToken');
      }
    }
  } catch (error) {
    console.error('Error cleaning localStorage:', error);
  }
};

// Function to completely reset authentication state
export const resetAuthState = (): void => {
  if (typeof window === 'undefined') return;

  const authKeys = [
    'userData', 'userType', 'authToken', 
    'otpSessionId', 'otpPhone',
    'nextauth.csrf-token', 'nextauth.callback-url'
  ];

  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  console.log('Authentication state reset');
};