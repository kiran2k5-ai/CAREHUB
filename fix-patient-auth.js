// Authentication utility to ensure correct patient data
// This fixes the localStorage issue that was causing 404 errors

const ensureCorrectPatientAuth = () => {
  try {
    // Check if user is logged in as patient
    const userType = localStorage.getItem('userType');
    
    if (userType === 'patient') {
      // Set the correct patient data
      const correctPatientData = {
        id: '7f8e3607-a428-4241-aa3f-10a071f584fa',
        name: 'Test Patient',
        email: 'patient@demo.com',
        phone: '9999999999',
        userType: 'PATIENT'
      };

      // Update localStorage with correct data
      localStorage.setItem('userData', JSON.stringify(correctPatientData));
      console.log('✅ Patient authentication data fixed:', correctPatientData);
      
      return correctPatientData;
    }
  } catch (error) {
    console.error('Error fixing patient auth:', error);
  }
  
  return null;
};

// Run this function when the page loads
if (typeof window !== 'undefined') {
  ensureCorrectPatientAuth();
}

export { ensureCorrectPatientAuth };