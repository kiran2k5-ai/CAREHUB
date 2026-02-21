// Test script to debug appointment booking
const baseUrl = 'http://localhost:3000';

async function testAppointmentBooking() {
  console.log('🔧 Testing Appointment Booking System...\n');

  // Test 1: Create appointment with correct IDs
  const appointmentData = {
    patientId: 'patient_9042222856',
    doctorId: 'doctor_9876543210',
    doctorName: 'Dr. Prakash Das',
    doctorSpecialization: 'Psychologist',
    date: '2025-01-10',
    time: '10:00 AM',
    consultationFee: 500,
    consultationType: 'in-person',
    reason: 'Test appointment - debugging booking'
  };

  console.log('📝 Creating appointment with data:', JSON.stringify(appointmentData, null, 2));

  try {
    const response = await fetch(`${baseUrl}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    const result = await response.json();
    console.log('\n✅ Appointment Creation Response:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n🎉 Appointment created successfully!');
      const appointmentId = result.data.id;

      // Test 2: Fetch patient appointments
      console.log('\n📋 Fetching patient appointments...');
      const patientResponse = await fetch(`${baseUrl}/api/appointments?patientId=patient_9042222856`);
      const patientData = await patientResponse.json();
      console.log('Patient appointments:', JSON.stringify(patientData, null, 2));

      // Test 3: Fetch doctor appointments
      console.log('\n👨‍⚕️ Fetching doctor appointments...');
      const doctorResponse = await fetch(`${baseUrl}/api/appointments?doctorId=doctor_9876543210&userType=DOCTOR`);
      const doctorData = await doctorResponse.json();
      console.log('Doctor appointments:', JSON.stringify(doctorData, null, 2));

      // Test 4: Fetch appointments for calendar view
      console.log('\n📅 Fetching appointments for calendar...');
      const calendarResponse = await fetch(`${baseUrl}/api/appointments?doctorId=doctor_9876543210&userType=DOCTOR`);
      const calendarData = await calendarResponse.json();
      console.log('Calendar appointments:', JSON.stringify(calendarData, null, 2));

      return appointmentId;
    } else {
      console.log('\n❌ Appointment creation failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('\n💥 Error during appointment booking test:', error);
    return null;
  }
}

// Test with alternative doctor ID formats
async function testAlternativeIds() {
  console.log('\n🔄 Testing alternative doctor ID formats...\n');

  const testCases = [
    { patientId: 'patient_9042222856', doctorId: 'demo', label: 'Demo doctor' },
    { patientId: 'patient_9042222856', doctorId: '1', label: 'Numeric doctor ID' },
    { patientId: 'user123', doctorId: 'demo', label: 'Legacy patient ID' },
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing ${testCase.label}...`);
    
    const appointmentData = {
      patientId: testCase.patientId,
      doctorId: testCase.doctorId,
      doctorName: 'Dr. Test',
      date: '2025-01-11',
      time: '2:00 PM',
      consultationFee: 500,
      consultationType: 'in-person',
      reason: `Test with ${testCase.label}`
    };

    try {
      const response = await fetch(`${baseUrl}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();
      console.log(`  Status: ${response.status}, Success: ${result.success}`);
      if (result.success) {
        console.log(`  ✅ Created appointment: ${result.data.id}`);
      } else {
        console.log(`  ❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`  💥 Network error: ${error.message}`);
    }
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Appointment Booking Debug Tests\n');
  console.log('Target: Patient 9042222856 books Doctor 9876543210\n');

  await testAppointmentBooking();
  await testAlternativeIds();

  console.log('\n✨ All tests completed!');
}

// Run the tests
runTests().catch(console.error);