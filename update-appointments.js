// Script to update appointment statuses to 'completed' for testing records page
// Run this in browser console to simulate completed appointments

// Update the first few appointments to completed status
fetch('/api/appointments/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ status: 'completed' })
})
.then(response => response.json())
.then(data => {
  console.log('Updated appointment 1:', data);
  
  // Update second appointment
  return fetch('/api/appointments/2', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'completed' })
  });
})
.then(response => response.json())
.then(data => {
  console.log('Updated appointment 2:', data);
  console.log('Appointments updated to completed status! Now check the Records page.');
})
.catch(error => {
  console.error('Error:', error);
});
