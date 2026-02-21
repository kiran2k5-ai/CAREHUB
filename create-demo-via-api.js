// Test creating demo data through our API endpoints
async function createDemoDataViaAPI() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🚀 Creating demo data via API...');
  
  // Test API connectivity first
  try {
    console.log('🔍 Testing API connectivity...');
    const response = await fetch(`${baseUrl}/api/db-test`);
    const result = await response.json();
    console.log('✅ API test result:', result.success ? 'Success' : 'Failed');
  } catch (error) {
    console.log('❌ API connectivity failed:', error.message);
    return;
  }
  
  // Create demo appointment
  const appointmentData = {
    patientId: 'patient_9042222856',
    doctorId: 'doctor_9876543210',
    date: '2025-10-10',
    time: '10:00',
    consultationType: 'IN_PERSON',
    consultationFee: 800,
    reason: 'Demo appointment for testing'
  };
  
  try {
    console.log('📅 Creating demo appointment...');
    const response = await fetch(`${baseUrl}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Demo appointment created:', result.id);
    } else {
      const error = await response.text();
      console.log('❌ Failed to create appointment:', error);
    }
  } catch (error) {
    console.log('❌ Error creating appointment:', error.message);
  }
  
  console.log('\n🎯 Demo data creation complete!');
  console.log('💡 Try logging in with these credentials:');
  console.log('   Doctor: 9876543210');
  console.log('   Patient: 9042222856');
}

// Check if we're running in Node.js or browser
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  createDemoDataViaAPI();
} else {
  // Browser environment
  window.createDemoData = createDemoDataViaAPI;
  console.log('💡 Run: createDemoData()');
}