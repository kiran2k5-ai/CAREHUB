// Run this in browser console to clear localStorage and test fresh login
console.log('Current localStorage before clearing:');
console.log('userType:', localStorage.getItem('userType'));
console.log('userData:', localStorage.getItem('userData'));
console.log('authToken:', localStorage.getItem('authToken'));

// Clear all authentication data
localStorage.removeItem('userType');
localStorage.removeItem('userData'); 
localStorage.removeItem('authToken');

console.log('\nLocalStorage cleared! Please login again to test the booking fix.');
console.log('Use any phone number like 9042222856 to login as a patient.');
