// Simple test for new database without auto-generated IDs
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = 'https://wbggppzxilmmsrgjdhrd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZ2dwcHp4aWxtbXNyZ2pkaHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzUyMjcsImV4cCI6MjA3NTYxMTIyN30.8tyiP8L97KvMDZHMOsDsUzxaZyQ-i53Eb2RARkdjOMw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSimpleDatabase() {
  console.log('🧪 Testing new database connection...');
  
  try {
    // Generate UUIDs manually
    const patientId = uuidv4();
    const doctorUserId = uuidv4();
    const doctorId = uuidv4();
    const appointmentId = uuidv4();
    
    console.log('📋 Generated IDs:');
    console.log('Patient:', patientId);
    console.log('Doctor User:', doctorUserId);
    console.log('Doctor Profile:', doctorId);
    
    // Step 1: Insert patient
    console.log('\n👤 Creating patient...');
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .insert({
        id: patientId,
        name: 'Test Patient',
        phone: '9042222856',
        email: 'patient@test.com',
        user_type: 'PATIENT'
      })
      .select()
      .single();
    
    if (patientError) {
      console.error('❌ Patient error:', patientError);
      return;
    }
    console.log('✅ Patient created successfully!');
    
    // Step 2: Insert doctor user
    console.log('\n👨‍⚕️ Creating doctor user...');
    const { data: doctorUser, error: doctorUserError } = await supabase
      .from('users')
      .insert({
        id: doctorUserId,
        name: 'Dr. Prakash Das',
        phone: '9876543210',
        email: 'doctor@test.com',
        user_type: 'DOCTOR'
      })
      .select()
      .single();
    
    if (doctorUserError) {
      console.error('❌ Doctor user error:', doctorUserError);
      return;
    }
    console.log('✅ Doctor user created successfully!');
    
    // Step 3: Insert doctor profile
    console.log('\n🏥 Creating doctor profile...');
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .insert({
        id: doctorId,
        user_id: doctorUserId,
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
      console.error('❌ Doctor profile error:', doctorError);
      return;
    }
    console.log('✅ Doctor profile created successfully!');
    
    // Step 4: Create appointment
    console.log('\n📅 Creating appointment...');
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        id: appointmentId,
        patient_id: patientId,
        doctor_id: doctorId,
        date: '2025-10-15',
        time: '10:30',
        status: 'SCHEDULED',
        reason: 'Console Test - General Checkup',
        consultation_fee: 500,
        consultation_type: 'VIDEO',
        notes: 'Test appointment from console'
      })
      .select()
      .single();
    
    if (appointmentError) {
      console.error('❌ Appointment error:', appointmentError);
      return;
    }
    console.log('✅ Appointment created successfully!');
    
    // Verify all data
    console.log('\n📊 Database Summary:');
    const { data: users } = await supabase.from('users').select('*');
    const { data: doctors } = await supabase.from('doctors').select('*');
    const { data: appointments } = await supabase.from('appointments').select('*');
    
    console.log(`👥 Total Users: ${users?.length || 0}`);
    console.log(`👨‍⚕️ Total Doctors: ${doctors?.length || 0}`);
    console.log(`📅 Total Appointments: ${appointments?.length || 0}`);
    
    console.log('\n🎉 New database is working perfectly!');
    console.log('🔗 You can now see this data in your Supabase dashboard!');
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

testSimpleDatabase();