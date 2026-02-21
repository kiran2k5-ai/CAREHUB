// Simple test script to check our APIs
const http = require('http');

function testAPI(path, description) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing ${description}...`);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
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
          console.log(`📄 Raw Response:`, data.substring(0, 200) + '...');
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ Request timeout`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting API Tests...');
  
  // Test main doctors API
  await testAPI('/api/doctors', 'Main Doctors API');
  
  // Test specific doctor API
  await testAPI('/api/doctors/5a7ec831-cd80-42ef-ae13-9805d4293261', 'Specific Doctor API');
  
  console.log('\n✨ Tests completed!');
}

runTests();