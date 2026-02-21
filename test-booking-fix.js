// Quick test script to verify appointment booking works
console.log('🚀 Testing Doctor Booking Fix...\n');

// Test data that should work
const appointmentTestData = {
  patientId: 'patient_9042222856',
  doctorId: '1', // Dr. Prakash Das
  doctorName: 'Dr. Prakash Das',
  doctorSpecialization: 'Psychologist',
  date: '2025-01-10',
  time: '10:00 AM',
  consultationFee: 500,
  consultationType: 'in-person',
  reason: 'General consultation'
};

async function runBookingTest() {
  try {
    console.log('📋 Testing appointment booking...');
    console.log('Data being sent:', JSON.stringify(appointmentTestData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentTestData),
    });

    const result = await response.json();
    
    console.log('\n📊 Response:');
    console.log('Status:', response.status);
    console.log('Success:', result.success);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS! Appointment created successfully!');
      
      // Test fetching patient appointments
      console.log('\n📋 Testing patient appointment fetch...');
      const patientResponse = await fetch(`http://localhost:3001/api/appointments?patientId=patient_9042222856`);
      const patientData = await patientResponse.json();
      console.log('Patient appointments found:', patientData.data?.length || 0);
      
      // Test fetching doctor appointments  
      console.log('\n👨‍⚕️ Testing doctor appointment fetch...');
      const doctorResponse = await fetch(`http://localhost:3001/api/appointments?doctorId=doctor_9876543210&userType=DOCTOR`);
      const doctorData = await doctorResponse.json();
      console.log('Doctor appointments found:', doctorData.data?.length || 0);
      
    } else {
      console.log('\n❌ FAILED!');
      console.log('Error:', result.error);
      console.log('Message:', result.message);
    }
    
  } catch (error) {
    console.error('\n💥 Network Error:', error.message);
  }
}

// Run test
runBookingTest();