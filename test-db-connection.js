// Test database connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iephqtkmguephvajgbhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTM5ODQsImV4cCI6MjA3NTQyOTk4NH0.8XG69Nd5c3S_HshjJa_TjhwYN5pbnMqqLIZNiAjk7js';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(3);
    
    if (error) {
      console.log('❌ Database Error:', error);
      return;
    }
    
    console.log('✅ Database Connection: SUCCESS');
    console.log('📊 Found users:', data.length);
    console.log('👥 Users:', data.map(u => ({ id: u.id, name: u.name, phone: u.phone, type: u.user_type })));
    
    // Test phone lookup
    console.log('\n🔍 Testing phone lookup for 9042222856...');
    const { data: phoneData, error: phoneError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', '9042222856')
      .single();
    
    if (phoneError) {
      console.log('❌ Phone lookup error:', phoneError);
    } else {
      console.log('✅ Phone lookup success:', phoneData);
    }
    
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
  }
}

testConnection();