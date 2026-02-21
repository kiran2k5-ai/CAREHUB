// Test appointments API specifically
const http = require('http');

function testAppointmentsAPI(userId) {
  return new Promise((resolve) => {
    console.log(`🧪 Testing Appointments API for user: ${userId}...`);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/appointments?userId=${userId}&userType=PATIENT`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(data);
          console.log(`📄 Response:`, JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log(`📄 Raw Response:`, data.substring(0, 500) + '...');
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.log(`⏰ Request timeout`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function runAppointmentsTest() {
  console.log('🚀 Testing Appointments API...');
  
  // Test with real patient UUID
  await testAppointmentsAPI('514610d2-38bc-4f31-b607-5c787b41f03a');
  
  console.log('\n✨ Appointments test completed!');
}

runAppointmentsTest();