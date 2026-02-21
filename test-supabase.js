const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const supabaseUrl = 'https://iephqtkmguephvajgbhz.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTM5ODQsImV4cCI6MjA3NTQyOTk4NH0.8XG69Nd5c3S_HshjJa_TjhwYN5pbnMqqLIZNiAjk7js';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      if (error.message.includes('relation "users" does not exist')) {
        console.log('⚠️  Database schema not deployed yet');
        console.log('📋 Next steps:');
        console.log('1. Go to: https://iephqtkmguephvajgbhz.supabase.co');
        console.log('2. Click SQL Editor');
        console.log('3. Copy content from database-schema.sql');
        console.log('4. Paste and run in SQL Editor');
        console.log('5. Then copy content from sample-data.sql');
        console.log('6. Paste and run in SQL Editor');
        return false;
      } else {
        console.log('❌ Database error:', error.message);
        return false;
      }
    }
    
    console.log('✅ Database connection successful!');
    console.log('📊 Users found:', data ? data.length : 0);
    
    if (data && data.length > 0) {
      console.log('🎉 Sample data is already loaded!');
    } else {
      console.log('📋 Database schema exists but no sample data');
      console.log('💡 Load sample data by running sample-data.sql in Supabase');
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    return false;
  }
}

// Run the test
testSupabaseConnection();