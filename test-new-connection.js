// Test new database with existing data
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wbggppzxilmmsrgjdhrd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZ2dwcHp4aWxtbXNyZ2pkaHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzUyMjcsImV4cCI6MjA3NTYxMTIyN30.8tyiP8L97KvMDZHMOsDsUzxaZyQ-i53Eb2RARkdjOMw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNewDatabase() {
  console.log('🧪 Testing new simplified database...');
  
  try {
    // Test 1: Fetch all users
    console.log('\n👥 Fetching users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Users error:', usersError);
      return;
    }
    
    console.log(`✅ Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.user_type}) - ${user.phone}`);
    });
    
    // Test 2: Fetch all doctors
    console.log('\n👨‍⚕️ Fetching doctors...');
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('*');
    
    if (doctorsError) {
      console.error('❌ Doctors error:', doctorsError);
      return;
    }
    
    console.log(`✅ Found ${doctors.length} doctors:`);
    doctors.forEach(doctor => {
      console.log(`  - ${doctor.name} (${doctor.specialization}) - Fee: ₹${doctor.consultation_fee}`);
    });
    
    // Test 3: Fetch appointments with patient info
    console.log('\n📅 Fetching appointments...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*');
    
    if (appointmentsError) {
      console.error('❌ Appointments error:', appointmentsError);
      return;
    }
    
    console.log(`✅ Found ${appointments.length} appointments:`);
    appointments.forEach(apt => {
      console.log(`  - ${apt.date} at ${apt.time} - ${apt.reason} (${apt.status})`);
      console.log(`    Patient: ${apt.patient_id}`);
      console.log(`    Doctor: ${apt.doctor_id}`);
    });
    
    // Test 4: Test specific patient lookup (for login)
    console.log('\n🔐 Testing patient login lookup...');
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', '9042222856')
      .eq('user_type', 'PATIENT')
      .single();
    
    if (patientError) {
      console.error('❌ Patient lookup error:', patientError);
    } else {
      console.log(`✅ Patient login test: Found ${patient.name} with ID ${patient.id}`);
    }
    
    // Test 5: Test doctor lookup by ID
    console.log('\n👨‍⚕️ Testing doctor lookup by ID...');
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', '5a7ec831-cd80-42ef-ae13-9805d4293261')
      .single();
    
    if (doctorError) {
      console.error('❌ Doctor lookup error:', doctorError);
    } else {
      console.log(`✅ Doctor lookup test: Found ${doctor.name} (${doctor.specialization})`);
    }
    
    console.log('\n🎉 New database is working perfectly!');
    console.log('📱 You can now test the application with:');
    console.log('   Phone: 9042222856 (Patient login)');
    console.log('   Doctor ID: 5a7ec831-cd80-42ef-ae13-9805d4293261');
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

testNewDatabase();