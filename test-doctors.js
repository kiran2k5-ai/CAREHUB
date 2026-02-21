const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://iephqtkmguephvajgbhz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTM5ODQsImV4cCI6MjA3NTQyOTk4NH0.8XG69Nd5c3S_HshjJa_TjhwYN5pbnMqqLIZNiAjk7js');

async function testDoctors() {
  console.log('🔍 Testing doctor profiles in database...');
  
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('*, users(*)')
    .limit(5);
  
  if (error) {
    console.log('❌ Error:', error);
    return;
  }
  
  console.log('✅ Found doctor profiles:', data.length);
  data.forEach((doc, i) => {
    console.log(`${i+1}. Profile ID: ${doc.id}`);
    console.log(`   User ID: ${doc.user_id}`);
    console.log(`   Name: ${doc.users?.name}`);
    console.log(`   Specialization: ${doc.specialization}`);
    console.log('');
  });
}

testDoctors();