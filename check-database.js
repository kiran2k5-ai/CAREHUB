const { createClient } = require('@supabase/supabase-js');

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Checking database status...');
    
    const supabaseUrl = 'https://iephqtkmguephvajgbhz.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTM5ODQsImV4cCI6MjA3NTQyOTk4NH0.8XG69Nd5c3S_HshjJa_TjhwYN5pbnMqqLIZNiAjk7js';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check users table
    const { data: users, error: usersError } = await supabase.from('users').select('*');
    console.log('👥 Users table:', users ? `${users.length} users` : 'No users');
    if (users && users.length > 0) {
      console.log('   Sample user:', users[0]);
    }
    
    // Check doctor_profiles table
    const { data: doctors, error: doctorsError } = await supabase.from('doctor_profiles').select('*');
    console.log('👨‍⚕️ Doctor profiles:', doctors ? `${doctors.length} doctors` : 'No doctors');
    
    // Check patient_profiles table
    const { data: patients, error: patientsError } = await supabase.from('patient_profiles').select('*');
    console.log('👤 Patient profiles:', patients ? `${patients.length} patients` : 'No patients');
    
    // Check appointments table
    const { data: appointments, error: appointmentsError } = await supabase.from('appointments').select('*');
    console.log('📅 Appointments:', appointments ? `${appointments.length} appointments` : 'No appointments');
    
    // Check if our demo data exists
    const { data: demoDoctor } = await supabase
      .from('users')
      .select('*')
      .eq('phone', '9876543210')
      .single();
    
    console.log('🔍 Demo doctor (9876543210):', demoDoctor ? 'Found' : 'Not found');
    
    const { data: demoPatient } = await supabase
      .from('users')
      .select('*')
      .eq('phone', '9042222856')
      .single();
    
    console.log('🔍 Demo patient (9042222856):', demoPatient ? 'Found' : 'Not found');
    
    console.log('\n✅ Database status check complete!');
    
  } catch (error) {
    console.log('❌ Error checking database:', error.message);
  }
}

checkDatabaseStatus();