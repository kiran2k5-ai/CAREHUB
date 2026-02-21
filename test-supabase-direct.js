// Test Supabase connection directly
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing Direct Supabase Connection');
console.log('==========================================');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing');
console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing');

// Test direct connection using Supabase client like in the app
async function testSupabaseClient() {
  try {
    console.log('\n🔗 Testing Supabase client connection...');
    
    // Import Supabase like the app does
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('📋 Supabase client created');
    
    // Test the exact query from DatabaseService
    console.log('🚀 Querying appointments for doctor: 5a7ec831-cd80-42ef-ae13-9805d4293261');
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', '5a7ec831-cd80-42ef-ae13-9805d4293261')
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ Supabase Error:', error);
    } else {
      console.log('✅ Success! Appointments found:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('📋 All appointments:');
        data.forEach((apt, index) => {
          const dateOnly = apt.date.split('T')[0]; // Convert to YYYY-MM-DD
          console.log(`  ${index + 1}. Date: ${dateOnly}, Time: ${apt.time}, Status: ${apt.status}`);
        });
        
        // Check for today's appointments specifically
        const today = '2025-10-11';
        const todayApts = data.filter(apt => apt.date.split('T')[0] === today);
        console.log(`\n🎯 Today (${today}) appointments:`, todayApts.length);
        
        if (todayApts.length > 0) {
          console.log('📋 Today appointments details:');
          todayApts.forEach(apt => {
            console.log(`  - ${apt.time} (${apt.status})`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Client Error:', error.message);
    console.error('📋 Error details:', error);
  }
}

testSupabaseClient();