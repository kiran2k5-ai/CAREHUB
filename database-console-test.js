// Database Console Test - Test appointment data retrieval
// Run this file to verify what appointments exist in the database

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["'](.*)["']$/, '$1');
          process.env[key] = value;
        }
      }
    });
    console.log('✅ Environment variables loaded from .env.local');
  } catch (error) {
    console.log('⚠️ Could not load .env.local file:', error.message);
  }
}

// Load environment variables
loadEnvFile();

// Supabase configuration (you may need to add environment variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please check environment variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');
  
  try {
    // Test 1: Check if we can connect to the database
    console.log('1. Testing basic connection...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, phone, user_type')
      .limit(3);
    
    if (usersError) {
      console.log('❌ Users table error:', usersError);
    } else {
      console.log('✅ Users table accessible. Sample users:');
      users.forEach(user => console.log(`   - ${user.name} (${user.phone}) - ${user.user_type}`));
    }
    
    console.log('\n2. Testing doctors table...');
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('*')
      .limit(5);
    
    if (doctorsError) {
      console.log('❌ Doctors table error:', doctorsError);
    } else {
      console.log('✅ Doctors table accessible. Found doctors:');
      doctors.forEach(doctor => console.log(`   - ${doctor.id}: ${doctor.name} (${doctor.specialization})`));
    }
    
    console.log('\n3. Testing appointments table...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .limit(10);
    
    if (appointmentsError) {
      console.log('❌ Appointments table error:', appointmentsError);
    } else {
      console.log('✅ Appointments table accessible. Found appointments:');
      if (appointments.length === 0) {
        console.log('   ⚠️ No appointments found in database');
      } else {
        appointments.forEach(apt => console.log(`   - ${apt.id}: Patient ${apt.patient_id} → Doctor ${apt.doctor_id} on ${apt.date} at ${apt.time}`));
      }
    }
    
    console.log('\n4. Testing specific doctor appointment lookup...');
    const doctorIds = [
      '5a7ec831-cd80-42ef-ae13-9805d4293261', // Dr. Prakash Das (REAL ID from DB)
      'b8f7c123-9d45-4e67-8f91-234567890abc', // Dr. Sarah Johnson (REAL ID from DB)
      'c9e8d234-ae56-4f78-9a02-345678901bcd', // Dr. Michael Chen (REAL ID from DB)
      '550e8400-e29b-41d4-a716-446655440001'  // Old demo doctor ID (should have 0)
    ];
    
    for (const doctorId of doctorIds) {
      const { data: doctorAppts, error: doctorError } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId);
      
      if (doctorError) {
        console.log(`❌ Error fetching appointments for doctor ${doctorId}:`, doctorError.message);
      } else {
        console.log(`📊 Doctor ${doctorId}: ${doctorAppts.length} appointments`);
        doctorAppts.forEach(apt => console.log(`     - ${apt.date} ${apt.time} (${apt.status})`));
      }
    }
    
    console.log('\n5. Testing doctor_profiles table (if exists)...');
    const { data: doctorProfiles, error: profilesError } = await supabase
      .from('doctor_profiles')
      .select('*')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ Doctor profiles table error:', profilesError.message);
    } else {
      console.log('✅ Doctor profiles table accessible. Found profiles:');
      doctorProfiles.forEach(profile => console.log(`   - ${profile.id}: User ${profile.user_id} (${profile.specialization})`));
    }
    
  } catch (error) {
    console.error('💥 Unexpected error during database test:', error);
  }
}

async function testAppointmentCreation() {
  console.log('\n🏗️ Testing Appointment Creation...\n');
  
  try {
    // Create a test appointment
    const testAppointment = {
      id: crypto.randomUUID(), // Generate proper UUID
      patient_id: '7f8e3607-a428-4241-aa3f-10a071f584fa', // Known patient ID
      doctor_id: '5a7ec831-cd80-42ef-ae13-9805d4293261',   // REAL Dr. Prakash Das ID from DB
      date: '2025-10-11', // Today
      time: '10:00',
      consultation_type: 'IN_PERSON',
      consultation_fee: 500,
      status: 'SCHEDULED',
      reason: 'Console test appointment',
      notes: 'Created via database console test'
    };
    
    console.log('Creating test appointment...');
    const { data: newAppointment, error: createError } = await supabase
      .from('appointments')
      .insert([testAppointment])
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Failed to create test appointment:', createError);
    } else {
      console.log('✅ Test appointment created successfully:');
      console.log('   ID:', newAppointment.id);
      console.log('   Date:', newAppointment.date);
      console.log('   Time:', newAppointment.time);
      console.log('   Status:', newAppointment.status);
      
      // Now try to fetch it back
      console.log('\nFetching created appointment...');
      const { data: fetchedAppt, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', newAppointment.id)
        .single();
      
      if (fetchError) {
        console.log('❌ Failed to fetch created appointment:', fetchError);
      } else {
        console.log('✅ Successfully fetched created appointment');
        console.log('   Full data:', JSON.stringify(fetchedAppt, null, 2));
      }
    }
    
  } catch (error) {
    console.error('💥 Error during appointment creation test:', error);
  }
}

async function runAllTests() {
  console.log('📋 DATABASE CONSOLE TEST REPORT');
  console.log('='.repeat(50));
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Target Date: 2025-10-11 (today for appointment testing)`);
  console.log('='.repeat(50));
  
  await testDatabaseConnection();
  await testAppointmentCreation();
  
  console.log('\n✅ Database console test completed!');
  console.log('📝 Use this information to understand what data exists and fix the frontend accordingly.');
}

// Run the tests
runAllTests().catch(console.error);