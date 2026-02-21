// Test new Supabase database connection and insert test data
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wbggppzxilmmsrgjdhrd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZ2dwcHp4aWxtbXNyZ2pkaHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzUyMjcsImV4cCI6MjA3NTYxMTIyN30.8tyiP8L97KvMDZHMOsDsUzxaZyQ-i53Eb2RARkdjOMw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupNewDatabase() {
  console.log('🚀 Setting up new simplified database...');
  
  try {
    // Step 1: Insert test user (patient)
    console.log('\n👤 Creating test patient...');
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .insert({
        name: 'Test Patient',
        phone: '9042222856',
        email: 'patient@test.com',
        user_type: 'PATIENT'
      })
      .select()
      .single();
    
    if (patientError) {
      console.error('❌ Patient creation error:', patientError);
      return;
    }
    console.log('✅ Patient created:', patient.name, 'ID:', patient.id);
    
    // Step 2: Insert test user (doctor)
    console.log('\n👨‍⚕️ Creating test doctor user...');
    const { data: doctorUser, error: doctorUserError } = await supabase
      .from('users')
      .insert({
        name: 'Dr. Prakash Das',
        phone: '9876543210',
        email: 'doctor@test.com',
        user_type: 'DOCTOR'
      })
      .select()
      .single();
    
    if (doctorUserError) {
      console.error('❌ Doctor user creation error:', doctorUserError);
      return;
    }
    console.log('✅ Doctor user created:', doctorUser.name, 'ID:', doctorUser.id);
    
    // Step 3: Insert doctor profile
    console.log('\n🏥 Creating doctor profile...');
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .insert({
        user_id: doctorUser.id,
        name: 'Dr. Prakash Das',
        specialization: 'Psychologist',
        experience: '8 years',
        consultation_fee: 500,
        rating: 4.8,
        phone: '9876543210',
        working_hours: '9:00 AM - 7:00 PM'
      })
      .select()
      .single();
    
    if (doctorError) {
      console.error('❌ Doctor profile creation error:', doctorError);
      return;
    }
    console.log('✅ Doctor profile created:', doctor.name, 'ID:', doctor.id);
    
    // Step 4: Create test appointment
    console.log('\n📅 Creating test appointment...');
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        patient_id: patient.id,
        doctor_id: doctor.id,
        date: '2025-10-15',
        time: '10:30',
        status: 'SCHEDULED',
        reason: 'General Checkup',
        consultation_fee: 500,
        consultation_type: 'VIDEO',
        notes: 'First appointment'
      })
      .select()
      .single();
    
    if (appointmentError) {
      console.error('❌ Appointment creation error:', appointmentError);
      return;
    }
    console.log('✅ Appointment created:', appointment.id);
    
    // Step 5: Verify all data
    console.log('\n📊 Verifying database setup...');
    
    const { data: allUsers } = await supabase.from('users').select('*');
    const { data: allDoctors } = await supabase.from('doctors').select('*');
    const { data: allAppointments } = await supabase.from('appointments').select('*');
    
    console.log(`✅ Users in DB: ${allUsers?.length || 0}`);
    console.log(`✅ Doctors in DB: ${allDoctors?.length || 0}`);
    console.log(`✅ Appointments in DB: ${allAppointments?.length || 0}`);
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('Patient ID:', patient.id);
    console.log('Doctor ID:', doctor.id);
    console.log('Appointment ID:', appointment.id);
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

setupNewDatabase();