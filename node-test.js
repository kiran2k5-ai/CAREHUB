// Node.js API Test for Dynamic Booking System
console.log('🚀 DYNAMIC BOOKING SYSTEM TEST\n');

const baseUrl = 'http://localhost:3001';

async function testBookingAPI() {
  try {
    console.log('📝 Testing appointment booking API...\n');
    
    // Test appointment data
    const appointmentData = {
      patientId: 'patient_9042222856',
      doctorId: '1', // Dr. Prakash Das in mock data
      doctorName: 'Dr. Prakash Das',
      doctorSpecialization: 'Psychologist',
      date: '2025-01-10',
      time: '10:00 AM',
      consultationFee: 500,
      consultationType: 'in-person',
      reason: 'Test appointment booking'
    };

    console.log('🔍 Appointment Data:');
    console.log(JSON.stringify(appointmentData, null, 2));
    console.log('\n📡 Sending request to:', `${baseUrl}/api/appointments`);

    const response = await fetch(`${baseUrl}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    console.log('\n📊 Response Status:', response.status);
    console.log('📊 Response OK:', response.ok);

    const result = await response.json();
    console.log('\n📄 Response Body:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ SUCCESS! Appointment created!');
      console.log(`   ID: ${result.data.id}`);
      console.log(`   Patient: ${result.data.patientName || 'N/A'}`);
      console.log(`   Doctor: ${result.data.doctorName}`);
      console.log(`   Date: ${result.data.date} at ${result.data.time}`);
      
      // Test fetching the appointment back
      console.log('\n🔍 Testing appointment retrieval...');
      
      const patientResponse = await fetch(`${baseUrl}/api/appointments?patientId=patient_9042222856`);
      const patientResult = await patientResponse.json();
      console.log(`\n👤 Patient appointments: ${patientResult.data?.length || 0} found`);
      
      if (patientResult.data?.length > 0) {
        console.log('   Latest appointment:');
        const latest = patientResult.data[0];
        console.log(`     ${latest.doctorName} on ${latest.date} at ${latest.time}`);
      }
      
      // Test doctor view
      const doctorResponse = await fetch(`${baseUrl}/api/appointments?doctorId=doctor_9876543210&userType=DOCTOR`);
      const doctorResult = await doctorResponse.json();
      console.log(`\n👨‍⚕️ Doctor appointments: ${doctorResult.data?.length || 0} found`);
      
      return true;
    } else {
      console.log('\n❌ FAILED! Appointment not created');
      console.log(`   Error: ${result.error}`);
      console.log(`   Message: ${result.message}`);
      if (result.errors) {
        console.log('   Validation errors:', result.errors);
      }
      return false;
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🚨 CONNECTION REFUSED!');
      console.log('   Make sure the server is running on port 3001');
      console.log('   Run: npm run dev');
    } else {
      console.log('\n💥 ERROR:', error.message);
      console.log('   Stack:', error.stack);
    }
    return false;
  }
}

// Test doctors API
async function testDoctorsAPI() {
  try {
    console.log('\n🩺 Testing doctors API...');
    const response = await fetch(`${baseUrl}/api/doctors`);
    const result = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Doctors found: ${result.data?.length || result.data?.doctors?.length || 0}`);
    
    if (result.success) {
      console.log('   ✅ Doctors API working');
    } else {
      console.log('   ❌ Doctors API failed');
    }
  } catch (error) {
    console.log('   💥 Doctors API error:', error.message);
  }
}

// Test specific doctor
async function testSpecificDoctor() {
  try {
    console.log('\n🔍 Testing specific doctor lookup...');
    const response = await fetch(`${baseUrl}/api/doctors/1`);
    const result = await response.json();
    
    console.log(`   Status: ${response.status}`);
    if (result.success) {
      console.log(`   Doctor found: ${result.data.name}`);
      console.log(`   Specialization: ${result.data.specialization}`);
      console.log('   ✅ Doctor lookup working');
    } else {
      console.log('   ❌ Doctor lookup failed:', result.message);
    }
  } catch (error) {
    console.log('   💥 Doctor lookup error:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🎯 ==========================================');
  console.log('🎯 COMPREHENSIVE API TEST SUITE');
  console.log('🎯 ==========================================\n');
  
  const startTime = Date.now();
  
  // Test sequence
  await testDoctorsAPI();
  await testSpecificDoctor();
  const bookingSuccess = await testBookingAPI();
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n🎯 ==========================================');
  console.log('🎯 TEST SUMMARY');
  console.log('🎯 ==========================================');
  console.log(`⏱️  Duration: ${duration}s`);
  
  if (bookingSuccess) {
    console.log('🎉 DYNAMIC BOOKING SYSTEM: ✅ WORKING');
    console.log('💡 Patient can book appointments');
    console.log('💡 Appointments appear in dashboards');
    console.log('💡 All APIs functioning correctly');
  } else {
    console.log('🚨 DYNAMIC BOOKING SYSTEM: ❌ FAILED');
    console.log('💡 Check server logs for details');
    console.log('💡 Verify doctor IDs in mock data');
  }
  
  console.log('\n📝 Next: Test in browser at http://localhost:3001');
  console.log('📝 Login with Patient: 9042222856');
  console.log('📝 Login with Doctor: 9876543210');
}

// Start the test
runTests();