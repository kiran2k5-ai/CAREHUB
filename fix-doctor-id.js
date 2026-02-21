// Script to fix localStorage doctor ID
console.log('🔧 Fixing localStorage doctor ID...');

// Clear problematic localStorage entries
if (typeof localStorage !== 'undefined') {
  console.log('📋 Current localStorage entries:');
  console.log('- userType:', localStorage.getItem('userType'));
  console.log('- userData:', localStorage.getItem('userData'));
  console.log('- loggedInUser:', localStorage.getItem('loggedInUser'));
  
  // Set correct doctor data
  const correctDoctorData = {
    id: '5a7ec831-cd80-42ef-ae13-9805d4293261',
    name: 'Dr. Prakash Das',
    email: 'doctor@test.com', 
    phone: '9876543210',
    specialization: 'General Physician'
  };
  
  localStorage.setItem('userType', 'doctor');
  localStorage.setItem('userData', JSON.stringify(correctDoctorData));
  localStorage.setItem('loggedInUser', correctDoctorData.id);
  
  console.log('✅ Fixed localStorage with correct doctor ID:', correctDoctorData.id);
} else {
  console.log('❌ localStorage not available (run this in browser console)');
}

// Instructions for browser console
console.log(`
🌐 Run this in browser console to fix the issue:

localStorage.setItem('userType', 'doctor');
localStorage.setItem('userData', JSON.stringify({
  id: '5a7ec831-cd80-42ef-ae13-9805d4293261',
  name: 'Dr. Prakash Das',
  email: 'doctor@test.com',
  phone: '9876543210',
  specialization: 'General Physician'
}));
localStorage.setItem('loggedInUser', '5a7ec831-cd80-42ef-ae13-9805d4293261');
window.location.reload();
`);