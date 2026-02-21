// Test with basic columns only
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = 'https://wbggppzxilmmsrgjdhrd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZ2dwcHp4aWxtbXNyZ2pkaHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzUyMjcsImV4cCI6MjA3NTYxMTIyN30.8tyiP8L97KvMDZHMOsDsUzxaZyQ-i53Eb2RARkdjOMw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBasicDatabase() {
  console.log('🧪 Testing basic database with minimal columns...');
  
  try {
    // Check existing data first
    console.log('\n📊 Checking existing data...');
    const { data: existingUsers } = await supabase.from('users').select('*');
    const { data: existingDoctors } = await supabase.from('doctors').select('*');
    const { data: existingAppointments } = await supabase.from('appointments').select('*');
    
    console.log(`Existing users: ${existingUsers?.length || 0}`);
    console.log(`Existing doctors: ${existingDoctors?.length || 0}`);
    console.log(`Existing appointments: ${existingAppointments?.length || 0}`);
    
    // Generate new IDs
    const patientId = uuidv4();
    const doctorUserId = uuidv4();
    const doctorId = uuidv4();
    const appointmentId = uuidv4();
    
    // Create patient (only if doesn't exist)
    console.log('\n👤 Creating patient...');
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .insert({
        id: patientId,
        name: 'Test Patient New',
        phone: '9042222857', // Different phone
        email: 'patient.new@test.com',
        user_type: 'PATIENT'
      })
      .select()
      .single();
    
    if (patientError) {
      console.error('❌ Patient error:', patientError);
      return;
    }
    console.log('✅ Patient created:', patient.id);
    
    // Create doctor user
    console.log('\n👨‍⚕️ Creating doctor user...');
    const { data: doctorUser, error: doctorUserError } = await supabase
      .from('users')
      .insert({
        id: doctorUserId,
        name: 'Dr. New Doctor',
        phone: '9876543211', // Different phone
        email: 'doctor.new@test.com',
        user_type: 'DOCTOR'
      })
      .select()
      .single();
    
    if (doctorUserError) {
      console.error('❌ Doctor user error:', doctorUserError);
      return;
    }
    console.log('✅ Doctor user created:', doctorUser.id);
    
    // Create doctor profile with minimal columns
    console.log('\n🏥 Creating doctor profile...');
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .insert({
        id: doctorId,
        user_id: doctorUserId,
        name: 'Dr. New Doctor',
        specialization: 'General Physician',
        experience: '5 years',
        consultation_fee: 600,
        rating: 4.5,
        phone: '9876543211'
      })
      .select()
      .single();
    
    if (doctorError) {
      console.error('❌ Doctor profile error:', doctorError);
      return;
    }
    console.log('✅ Doctor profile created:', doctor.id);
    
    // Create appointment
    console.log('\n📅 Creating appointment...');
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        id: appointmentId,
        patient_id: patientId,
        doctor_id: doctorId,
        date: '2025-10-16',
        time: '11:00',
        status: 'SCHEDULED',
        reason: 'New DB Test - Consultation',
        consultation_fee: 600,
        consultation_type: 'VIDEO',
        notes: 'Testing new simple database'
      })
      .select()
      .single();
    
    if (appointmentError) {
      console.error('❌ Appointment error:', appointmentError);
      return;
    }
    console.log('✅ Appointment created:', appointment.id);
    
    // Final verification
    console.log('\n🎉 SUCCESS! Data created in new database:');
    console.log('Patient ID:', patientId);
    console.log('Doctor ID:', doctorId);
    console.log('Appointment ID:', appointmentId);
    console.log('\n✨ Check your Supabase dashboard to see the data!');
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

testBasicDatabase();