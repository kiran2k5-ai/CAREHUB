// Test Database Connection and Add Data via Console
// Run this in your browser console after logging into the app

// Test 1: Check if Supabase is connected
console.log('🔍 Testing Supabase Connection...');
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured');

// Test 2: Fetch users from database
async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing database query...');
    
    const response = await fetch('/api/users/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database connection successful!');
      console.log('📊 Data:', data);
    } else {
      console.log('❌ Database connection failed');
      console.log('Response:', await response.text());
    }
  } catch (error) {
    console.log('❌ Error testing database:', error);
  }
}

// Test 3: Create test appointment via API
async function createTestAppointment() {
  const appointmentData = {
    patientId: 'patient_9042222856',
    doctorId: 'doctor_9876543210', 
    date: new Date().toISOString().split('T')[0], // Today
    time: '15:00',
    consultationType: 'IN_PERSON',
    consultationFee: 500,
    reason: 'Console test appointment'
  };

  try {
    console.log('🔄 Creating test appointment...');
    
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test appointment created successfully!');
      console.log('📅 Appointment:', data);
      return data;
    } else {
      console.log('❌ Failed to create appointment');
      console.log('Response:', await response.text());
    }
  } catch (error) {
    console.log('❌ Error creating appointment:', error);
  }
}

// Test 4: Fetch doctor appointments
async function fetchDoctorAppointments(doctorId = 'doctor_9876543210') {
  try {
    console.log(`🔄 Fetching appointments for doctor: ${doctorId}`);
    
    const response = await fetch(`/api/doctor/appointments?doctorId=${doctorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Doctor appointments fetched successfully!');
      console.log(`📊 Found ${data.total} appointments:`, data.data);
      return data;
    } else {
      console.log('❌ Failed to fetch appointments');
      console.log('Response:', await response.text());
    }
  } catch (error) {
    console.log('❌ Error fetching appointments:', error);
  }
}

// Test 5: Fetch patient appointments  
async function fetchPatientAppointments(patientId = 'patient_9042222856') {
  try {
    console.log(`🔄 Fetching appointments for patient: ${patientId}`);
    
    const response = await fetch(`/api/appointments?patientId=${patientId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Patient appointments fetched successfully!');
      console.log(`📊 Found ${data.data.length} appointments:`, data.data);
      return data;
    } else {
      console.log('❌ Failed to fetch patient appointments');
      console.log('Response:', await response.text());
    }
  } catch (error) {
    console.log('❌ Error fetching patient appointments:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Database Tests...');
  console.log('==============================');
  
  await testDatabaseConnection();
  console.log('');
  
  await createTestAppointment();
  console.log('');
  
  await fetchDoctorAppointments();
  console.log('');
  
  await fetchPatientAppointments();
  console.log('');
  
  console.log('✅ All tests completed!');
}

// Export functions for manual testing
window.dbTest = {
  testConnection: testDatabaseConnection,
  createAppointment: createTestAppointment,
  fetchDoctorAppointments,
  fetchPatientAppointments,
  runAll: runAllTests
};

console.log('🎯 Database test functions loaded!');
console.log('Usage:');
console.log('- dbTest.runAll() - Run all tests');
console.log('- dbTest.testConnection() - Test connection only');
console.log('- dbTest.createAppointment() - Create test appointment');
console.log('- dbTest.fetchDoctorAppointments() - Get doctor appointments');
console.log('- dbTest.fetchPatientAppointments() - Get patient appointments');
console.log('');
console.log('💡 Run: dbTest.runAll()');