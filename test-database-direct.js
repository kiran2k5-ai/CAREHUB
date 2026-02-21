const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection directly
const supabaseUrl = 'https://wbggppzxilmmsrgjdhrd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZ2dwcHp4aWxtbXNyZ2pkaHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzNTIyNywiZXhwIjoyMDc1NjExMjI3fQ.9vwrw9A7ps0lWh8hs6oSV1M8h0rfakLKbsSmMa6jYbU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseConnection() {
    try {
        console.log('🔍 Testing direct database connection...');
        
        // Test 1: Simple query to users table
        console.log('\n1. Testing users table...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, user_type')
            .limit(5);
            
        if (usersError) {
            console.error('❌ Users error:', usersError);
        } else {
            console.log(`✅ Found ${users.length} users`);
            users.forEach(user => console.log(`   - ${user.name} (${user.user_type})`));
        }
        
        // Test 2: Query doctors table (not doctor_profiles)
        console.log('\n2. Testing doctors table...');
        const { data: profiles, error: profilesError } = await supabase
            .from('doctors')
            .select('id, name, specialization')
            .limit(5);
            
        if (profilesError) {
            console.error('❌ Doctors error:', profilesError);
        } else {
            console.log(`✅ Found ${profiles.length} doctors`);
            profiles.forEach(profile => console.log(`   - ${profile.name} - ${profile.specialization}`));
        }
        
        // Test 3: Check table structure
        console.log('\n3. Testing doctors table structure...');
        const { data: doctorsStructure, error: structureError } = await supabase
            .from('doctors')
            .select('*')
            .limit(1);
            
        if (structureError) {
            console.error('❌ Structure error:', structureError);
        } else {
            console.log(`✅ Doctors table structure:`, Object.keys(doctorsStructure[0] || {}));
        }
        
    } catch (error) {
        console.error('❌ Connection test failed:', error);
    }
}

testDatabaseConnection();