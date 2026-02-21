// SAFE TEST - Just check what's happening without changing any code
// Copy this into browser console on the appointments page

console.log('=== DEBUGGING APPOINTMENTS PAGE ===');

// Test 1: Check if patient exists via direct API call
fetch('/api/appointments?patientId=7f8e3607-a428-4241-aa3f-10a071f584fa')
  .then(response => {
    console.log('Direct API test - Status:', response.status);
    return response.json().catch(() => response.text());
  })
  .then(data => {
    console.log('Direct API test - Response:', data);
  })
  .catch(error => {
    console.error('Direct API test - Error:', error);
  });

// Test 2: Check what's in localStorage
console.log('localStorage userType:', localStorage.getItem('userType'));
console.log('localStorage userData:', localStorage.getItem('userData'));

// Test 3: Check current URL
console.log('Current URL:', window.location.href);

// Test 4: Check if there are any network issues
console.log('Navigator online:', navigator.onLine);

console.log('=== END DEBUGGING ===');