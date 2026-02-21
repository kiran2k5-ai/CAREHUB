// Test the calendar view API to verify appointments are loading
const doctorId = '5a7ec831-cd80-42ef-ae13-9805d4293261';
const apiUrl = `http://localhost:3001/api/doctor/appointments?doctorId=${doctorId}`;

console.log('🗓️ Testing Calendar View API...');
console.log('📍 URL:', apiUrl);

fetch(apiUrl)
  .then(response => {
    console.log('📊 Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('\n📋 Calendar API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('\n✅ Calendar Test Results:');
      
      if (data.data.today) {
        // Grouped response
        const allAppointments = [
          ...(data.data.today || []),
          ...(data.data.upcoming || []),
          ...(data.data.past || []),
          ...(data.data.cancelled || [])
        ];
        
        console.log('- Today appointments:', data.data.today?.length || 0);
        console.log('- Upcoming appointments:', data.data.upcoming?.length || 0);
        console.log('- Past appointments:', data.data.past?.length || 0);
        console.log('- Total for calendar:', allAppointments.length);
        
        if (allAppointments.length > 0) {
          console.log('\n📅 Sample Calendar Event:');
          const apt = allAppointments[0];
          console.log('- Patient:', apt.patientName || apt.patient?.name || 'Unknown');
          console.log('- Date:', apt.date);
          console.log('- Time:', apt.time);
          console.log('- Type:', apt.consultationType || apt.type);
          console.log('- Status:', apt.status);
        }
      } else if (Array.isArray(data.data)) {
        console.log('- Total appointments:', data.data.length);
      }
    }
  })
  .catch(error => {
    console.error('❌ Calendar API Test Error:', error.message);
  });