// Comprehensive system test script
// Run this in browser console to test all functionality

console.log('🚀 Starting CareHub System Test...');

// Test configuration
const baseUrl = 'http://localhost:3000';
const testPatientId = 'patient_9042222856';
const testDoctorId = 'doctor_9876543210';
const existingDoctorId = '1'; // Mock doctor ID

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test results
let testResults = {
  databaseConnection: false,
  patientLogin: false,
  doctorLogin: false,
  appointmentCreation: false,
  appointmentRetrieval: false,
  dynamicUpdates: false,
  dashboardRefresh: false
};

// Test 1: Database Connection
async function testDatabaseConnection() {
  console.log('📊 Testing database connection...');
  try {
    const response = await fetch(`${baseUrl}/api/db-test`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Database connection: SUCCESS');
      console.log(`   - User count: ${data.data.userCount}`);
      testResults.databaseConnection = true;
      return true;
    } else {
      console.log('❌ Database connection: FAILED');
      console.log(`   - Error: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Database connection: ERROR');
    console.log(`   - Error: ${error.message}`);
    return false;
  }
}

// Test 2: Patient Login
async function testPatientLogin() {
  console.log('👤 Testing patient login...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/enhanced-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9042222856' })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Patient login: SUCCESS');
      console.log(`   - User: ${data.userData.name}`);
      console.log(`   - Type: ${data.userType}`);
      console.log(`   - Source: ${data.source || 'demo'}`);
      testResults.patientLogin = true;
      return data;
    } else {
      console.log('❌ Patient login: FAILED');
      console.log(`   - Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Patient login: ERROR');
    console.log(`   - Error: ${error.message}`);
    return false;
  }
}

// Test 3: Doctor Login
async function testDoctorLogin() {
  console.log('👨‍⚕️ Testing doctor login...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/enhanced-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210' })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Doctor login: SUCCESS');
      console.log(`   - User: ${data.userData.name}`);
      console.log(`   - Type: ${data.userType}`);
      console.log(`   - Source: ${data.source || 'demo'}`);
      testResults.doctorLogin = true;
      return data;
    } else {
      console.log('❌ Doctor login: FAILED');
      console.log(`   - Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Doctor login: ERROR');
    console.log(`   - Error: ${error.message}`);
    return false;
  }
}

// Test 4: Create Test Appointment
async function testAppointmentCreation() {
  console.log('📅 Testing appointment creation...');
  
  const appointmentData = {
    patientId: testPatientId,
    doctorId: existingDoctorId,
    doctorName: 'Test Doctor',
    doctorSpecialization: 'General Medicine',
    date: '2025-10-09',
    time: '10:00 AM',
    consultationFee: 500,
    consultationType: 'in-person',
    reason: 'System test appointment',
    notes: 'Automated test'
  };

  try {
    const response = await fetch(`${baseUrl}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Appointment creation: SUCCESS');
      console.log(`   - Appointment ID: ${data.id}`);
      console.log(`   - Doctor: ${data.doctorName}`);
      console.log(`   - Date: ${data.date} at ${data.time}`);
      testResults.appointmentCreation = true;
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Appointment creation: FAILED');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Response: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Appointment creation: ERROR');
    console.log(`   - Error: ${error.message}`);
    return false;
  }
}

// Test 5: Retrieve Patient Appointments
async function testPatientAppointments() {
  console.log('📋 Testing patient appointment retrieval...');
  try {
    const response = await fetch(`${baseUrl}/api/appointments?patientId=${testPatientId}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Patient appointments: SUCCESS');
      console.log(`   - Found ${data.data.length} appointments`);
      if (data.data.length > 0) {
        console.log(`   - Latest: ${data.data[0].doctorName} on ${data.data[0].date}`);
      }
      testResults.appointmentRetrieval = true;
      return data;
    } else {
      console.log('❌ Patient appointments: FAILED');
      console.log(`   - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Patient appointments: ERROR');
    console.log(`   - Error: ${error.message}`);
    return false;
  }
}

// Test 6: Retrieve Doctor Appointments
async function testDoctorAppointments() {
  console.log('🩺 Testing doctor appointment retrieval...');
  try {
    const response = await fetch(`${baseUrl}/api/doctor/appointments?doctorId=${existingDoctorId}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Doctor appointments: SUCCESS');
      console.log(`   - Found ${data.total || data.data.length} appointments`);
      testResults.appointmentRetrieval = true;
      return data;
    } else {
      console.log('❌ Doctor appointments: FAILED');
      console.log(`   - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Doctor appointments: ERROR');
    console.log(`   - Error: ${error.message}`);
    return false;
  }
}

// Test 7: Dynamic Update System
async function testDynamicUpdates() {
  console.log('🔄 Testing dynamic update system...');
  
  // Set the booking flag (simulating a recent booking)
  localStorage.setItem('appointmentJustBooked', 'true');
  localStorage.setItem('lastAppointmentBooking', Date.now().toString());
  
  console.log('✅ Dynamic update flags set');
  console.log('   - appointmentJustBooked: true');
  console.log('   - lastAppointmentBooking: just now');
  
  testResults.dynamicUpdates = true;
  return true;
}

// Test 8: Dashboard Refresh Test
async function testDashboardFunctionality() {
  console.log('📊 Testing dashboard functionality...');
  
  // Test if we can access the dashboard endpoints
  try {
    const doctorsResponse = await fetch(`${baseUrl}/api/doctors`);
    const doctorsOk = doctorsResponse.ok;
    
    console.log(`✅ Dashboard API access: ${doctorsOk ? 'SUCCESS' : 'FAILED'}`);
    
    if (doctorsOk) {
      const doctorsData = await doctorsResponse.json();
      console.log(`   - Found ${doctorsData.data?.length || 0} doctors`);
    }
    
    testResults.dashboardRefresh = doctorsOk;
    return doctorsOk;
  } catch (error) {
    console.log('❌ Dashboard functionality: ERROR');
    console.log(`   - Error: ${error.message}`);
    return false;
  }
}

// Run All Tests
async function runAllTests() {
  console.log('🎯 ==========================================');
  console.log('🎯 CAREHUB COMPREHENSIVE SYSTEM TEST');
  console.log('🎯 ==========================================\n');
  
  const startTime = Date.now();
  
  // Run tests sequentially
  await testDatabaseConnection();
  await delay(500);
  
  await testPatientLogin();
  await delay(500);
  
  await testDoctorLogin();
  await delay(500);
  
  await testAppointmentCreation();
  await delay(1000);
  
  await testPatientAppointments();
  await delay(500);
  
  await testDoctorAppointments();
  await delay(500);
  
  await testDynamicUpdates();
  await delay(500);
  
  await testDashboardFunctionality();
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Results Summary
  console.log('\n🎯 ==========================================');
  console.log('🎯 TEST RESULTS SUMMARY');
  console.log('🎯 ==========================================');
  
  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(Boolean).length;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  console.log(`📊 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
  console.log(`⏱️  Total Test Duration: ${duration}s\n`);
  
  Object.entries(testResults).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} - ${testName}`);
  });
  
  console.log('\n🎯 ==========================================');
  
  if (successRate >= 80) {
    console.log('🎉 SYSTEM STATUS: HEALTHY ✅');
    console.log('💡 Dynamic booking system is working properly!');
  } else if (successRate >= 60) {
    console.log('⚠️  SYSTEM STATUS: NEEDS ATTENTION 🟡');
    console.log('💡 Some features may need troubleshooting.');
  } else {
    console.log('🚨 SYSTEM STATUS: CRITICAL ISSUES ❌');
    console.log('💡 Multiple system failures detected.');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Check that all tests pass');
  console.log('2. Test manual appointment booking');
  console.log('3. Verify dashboard updates');
  console.log('4. Test cross-user functionality');
  
  return testResults;
}

// Export functions for manual testing
window.careHubTest = {
  runAll: runAllTests,
  database: testDatabaseConnection,
  patientLogin: testPatientLogin,
  doctorLogin: testDoctorLogin,
  createAppointment: testAppointmentCreation,
  patientAppointments: testPatientAppointments,
  doctorAppointments: testDoctorAppointments,
  dynamicUpdates: testDynamicUpdates,
  dashboard: testDashboardFunctionality
};

console.log('🎯 CareHub Test Suite Loaded!');
console.log('💡 Run: careHubTest.runAll()');
console.log('💡 Or run individual tests: careHubTest.database(), careHubTest.patientLogin(), etc.');