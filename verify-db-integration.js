// Database Integration Verification Script
// This script tests all API endpoints to ensure database integration is working

const BASE_URL = 'http://localhost:3000';

// Test data - using the users we created in database
const testPatient = {
  phone: '9042222856',
  id: 'a1b2c3d4-e5f6-4321-9876-12345678901a'
};

const testDoctor = {
  phone: '9876543210', 
  id: 'f1e2d3c4-b5a6-7890-1234-567890abcdef'
};

async function testAPI(endpoint, options = {}) {
  try {
    console.log(`\n🔍 Testing: ${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    return { success: true, data, status: response.status };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function verifyDatabaseIntegration() {
  console.log('🚀 Starting Database Integration Verification');
  console.log('=' * 50);

  // Test 1: Get all appointments (should show our test appointments)
  await testAPI('/api/appointments');

  // Test 2: Get appointments for specific patient
  await testAPI(`/api/appointments?patientId=${testPatient.id}`);

  // Test 3: Get appointments for specific doctor  
  await testAPI(`/api/appointments?doctorId=${testDoctor.id}`);

  // Test 4: Get calendar format for doctor
  await testAPI(`/api/appointments?doctorId=${testDoctor.id}&format=calendar`);

  // Test 5: Get all doctors
  await testAPI('/api/doctors');

  // Test 6: Get specific doctor
  await testAPI(`/api/doctors/${testDoctor.id}`);

  // Test 7: Get specialties (should be generated from database)
  await testAPI('/api/specialties');

  // Test 8: Create new appointment
  const newAppointment = {
    patientId: testPatient.id,
    doctorId: testDoctor.id,
    appointmentDate: '2024-12-25',
    appointmentTime: '10:00',
    reason: 'API Integration Test Appointment',
    status: 'scheduled'
  };

  await testAPI('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(newAppointment)
  });

  console.log('\n🎯 Database Integration Test Complete!');
  console.log('All endpoints should now be using Supabase database instead of mock data');
}

// Run the verification
verifyDatabaseIntegration().catch(console.error);