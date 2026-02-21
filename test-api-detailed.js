// Test patients API with detailed logging
const fetch = require('node-fetch');

async function testPatientsAPI() {
  console.log('🧪 Testing Patients API Endpoint...\n');
  
  try {
    // Test basic patients endpoint
    console.log('1. Testing GET /api/patients');
    const response = await fetch('http://localhost:3000/api/patients');
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (!data.success) {
      console.log('\n❌ API returned error. Let\'s check with a specific doctorId...');
      
      // Test with doctor ID
      const doctorResponse = await fetch('http://localhost:3000/api/patients?doctorId=5a7ec831-cd80-42ef-ae13-9805d4293261');
      const doctorData = await doctorResponse.json();
      
      console.log('2. Testing with doctorId:');
      console.log('Status:', doctorResponse.status);
      console.log('Response:', JSON.stringify(doctorData, null, 2));
    }
    
    console.log('\n🔍 Next steps:');
    console.log('1. Check if Next.js dev server is running');
    console.log('2. Check environment variables in .env.local');
    console.log('3. Verify Supabase connection');
    console.log('4. Check if users table exists with patient records');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure Next.js server is running on port 3000');
    console.log('2. Check network connectivity');
    console.log('3. Verify API endpoint exists');
  }
}

testPatientsAPI();