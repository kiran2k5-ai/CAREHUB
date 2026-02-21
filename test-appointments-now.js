// Test the doctor appointments API endpoint directly
const doctorId = '5a7ec831-cd80-42ef-ae13-9805d4293261';
const apiUrl = `http://localhost:3001/api/doctor/appointments?doctorId=${doctorId}`;

console.log('🧪 Testing Doctor Appointments API...');
console.log('📍 URL:', apiUrl);

fetch(apiUrl)
  .then(response => {
    console.log('📊 Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('\n📋 Full API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('\n✅ API Test Results:');
      console.log('- Total appointments:', data.data.total);
      console.log('- Today appointments:', data.data.today?.length || 0);
      console.log('- Upcoming appointments:', data.data.upcoming?.length || 0);
      console.log('- Past appointments:', data.data.past?.length || 0);
      
      if (data.data.today?.length > 0) {
        console.log('\n📅 Today\'s Appointment:');
        console.log('- Patient:', data.data.today[0].patientName);
        console.log('- Time:', data.data.today[0].time);
        console.log('- Type:', data.data.today[0].consultationType);
        console.log('- Status:', data.data.today[0].status);
      }
    }
  })
  .catch(error => {
    console.error('❌ API Test Error:', error.message);
  });