// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iephqtkmguephvajgbhz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTM5ODQsImV4cCI6MjA3NTQyOTk4NH0.8XG69Nd5c3S_HshjJa_TjhwYN5pbnMqqLIZNiAjk7js';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🧪 Testing Supabase connection...');
  
  try {
    // Test 1: Simple query
    console.log('📋 Testing simple user lookup...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', '514610d2-38bc-4f31-b607-5c787b41f03a')
      .single();
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Success:', data.name);
    }
    
    // Test 2: Complex query with joins
    console.log('📋 Testing complex query with joins...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        doctor_profiles(*),
        patient_profiles(*)
      `)
      .eq('id', '514610d2-38bc-4f31-b607-5c787b41f03a')
      .single();
    
    if (userError) {
      console.error('❌ Complex query error:', userError);
    } else {
      console.log('✅ Complex query success:', userData.name);
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

testConnection();