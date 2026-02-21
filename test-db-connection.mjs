// Simple database connection test
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://wbggppzxilmmsrgjdhrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZ2dwcHp4aWxtbXNyZ2pkaHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzNTIyNywiZXhwIjoyMDc1NjExMjI3fQ.9vwrw9A7ps0lWh8hs6oSV1M8h0rfakLKbsSmMa6jYbU'
);

async function testDatabaseConnection() {
  console.log('🔌 Testing Supabase Database Connection...\n');
  
  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (tablesError) {
      console.error('❌ Connection error:', tablesError);
      return;
    }
    
    console.log('✅ Database connection successful!');
    console.log(`📊 Users table has ${tables || 'unknown'} records\n`);
    
    // Check for patients
    console.log('2. Checking for patients...');
    const { data: patients, error: patientsError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('user_type', 'patient')
      .limit(5);
    
    if (patientsError) {
      console.error('❌ Error fetching patients:', patientsError);
      return;
    }
    
    console.log(`📋 Found ${patients?.length || 0} patients:`);
    if (patients && patients.length > 0) {
      patients.forEach((patient, index) => {
        console.log(`   ${index + 1}. ${patient.name} (${patient.email})`);
      });
    } else {
      console.log('   No patients found in database\n');
      
      // Let's create some test patients
      console.log('3. Creating test patients...');
      const testPatients = [
        { name: 'John Smith', email: 'john.smith@example.com', phone: '+1-555-0123', user_type: 'patient' },
        { name: 'Sarah Johnson', email: 'sarah.johnson@example.com', phone: '+1-555-0124', user_type: 'patient' },
        { name: 'Michael Brown', email: 'michael.brown@example.com', phone: '+1-555-0125', user_type: 'patient' },
        { name: 'Emily Davis', email: 'emily.davis@example.com', phone: '+1-555-0126', user_type: 'patient' },
        { name: 'David Wilson', email: 'david.wilson@example.com', phone: '+1-555-0127', user_type: 'patient' }
      ];
      
      const { data: newPatients, error: insertError } = await supabaseAdmin
        .from('users')
        .insert(testPatients)
        .select();
      
      if (insertError) {
        console.error('❌ Error creating patients:', insertError);
      } else {
        console.log(`✅ Successfully created ${newPatients?.length || 0} test patients!`);
        newPatients?.forEach((patient, index) => {
          console.log(`   ${index + 1}. ${patient.name} (${patient.email})`);
        });
      }
    }
    
    // Check for doctors
    console.log('\n4. Checking for doctors...');
    const { data: doctors, error: doctorsError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('user_type', 'doctor')
      .limit(3);
    
    if (doctorsError) {
      console.error('❌ Error fetching doctors:', doctorsError);
    } else {
      console.log(`👨‍⚕️ Found ${doctors?.length || 0} doctors:`);
      if (doctors && doctors.length > 0) {
        doctors.forEach((doctor, index) => {
          console.log(`   ${index + 1}. ${doctor.name} (${doctor.email})`);
        });
      } else {
        console.log('   No doctors found, creating test doctor...');
        
        const { data: newDoctor, error: doctorInsertError } = await supabaseAdmin
          .from('users')
          .insert({
            name: 'Dr. Demo',
            email: 'doctor@demo.com',
            phone: '+1-555-9999',
            user_type: 'doctor'
          })
          .select()
          .single();
        
        if (doctorInsertError) {
          console.error('❌ Error creating doctor:', doctorInsertError);
        } else {
          console.log(`✅ Created test doctor: ${newDoctor.name} (${newDoctor.email})`);
        }
      }
    }
    
    console.log('\n🎯 Database setup complete! Try the patients API now.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabaseConnection();