// Simple Database Connection Test
const https = require('https');

console.log('🚀 Testing Supabase Database Connection...');
console.log('='.repeat(50));

const supabaseUrl = 'https://iephqtkmguephvajgbhz.supabase.co';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTM5ODQsImV4cCI6MjA3NTQyOTk4NH0.8XG69Nd5c3S_HshjJa_TjhwYN5pbnMqqLIZNiAjk7js';

console.log('📍 Database URL:', supabaseUrl);
console.log('🔑 API Key Preview:', apiKey.substring(0, 20) + '...');
console.log('');

// Test the REST API endpoint
const options = {
  hostname: 'iephqtkmguephvajgbhz.supabase.co',
  port: 443,
  path: '/rest/v1/users?select=count',
  method: 'GET',
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'count=exact'
  }
};

console.log('🔍 Testing database connection...');

const req = https.request(options, (res) => {
  console.log(`📡 Response Status: ${res.statusCode}`);
  console.log(`📋 Response Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📄 Raw Response:', data);
    
    if (res.statusCode === 200 || res.statusCode === 206) {
      console.log('✅ SUCCESS: Database connection is working!');
      console.log('✅ Your Supabase credentials are correct');
      console.log('✅ Database is accessible');
      
      try {
        const parsed = JSON.parse(data);
        console.log('📊 Database Response:', parsed);
      } catch (e) {
        console.log('📊 Response Data:', data);
      }
      
      console.log('\n🎯 Next Steps:');
      console.log('1. ✅ Database credentials verified');
      console.log('2. 🔄 Restart your Next.js server: npm run dev');
      console.log('3. 🌐 Test the booking system');
      
    } else {
      console.log('❌ FAILED: Database connection issue');
      console.log('❌ Status Code:', res.statusCode);
      console.log('❌ Response:', data);
      
      if (res.statusCode === 401) {
        console.log('🔑 Issue: Invalid API key or authentication problem');
      } else if (res.statusCode === 404) {
        console.log('🔍 Issue: Database URL or table not found');
      } else {
        console.log('⚠️ Issue: Unknown error - check Supabase dashboard');
      }
    }
  });
});

req.on('error', (error) => {
  console.error('💥 Connection Error:', error.message);
  console.log('❌ Failed to connect to Supabase');
  console.log('🔍 Check your internet connection and database URL');
});

req.end();