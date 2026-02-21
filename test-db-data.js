const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://iephqtkmguephvajgbhz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg1Mzk4NCwiZXhwIjoyMDc1NDI5OTg0fQ.546pGZFOzAMl-eSifUls_jieNO6MFzE8-Uwd5g0xenI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseData() {
  console.log('🔍 Testing Database Data Flow');
  console.log('=' + '='.repeat(50));

  try {
    // 1. Check current users
    console.log('\n📊 1. CHECKING CURRENT USERS IN DATABASE:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.phone}) - ${user.user_type} - ID: ${user.id}`);
    });

    // 2. Get our test users
    console.log('\n👤 2. GETTING TEST USERS:');
    const { data: patient } = await supabase
      .from('users')
      .select('*')
      .eq('phone', '9042222856')
      .single();

    const { data: doctor } = await supabase
      .from('users')
      .select('*')
      .eq('phone', '9876543210')
      .single();

    if (!patient || !doctor) {
      console.log('❌ Test users not found. Running setup...');
      // Create test users if they don't exist
      await setupTestUsers();
      return testDatabaseData(); // Retry
    }

    console.log(`✅ Patient: ${patient.name} (ID: ${patient.id})`);
    console.log(`✅ Doctor: ${doctor.name} (ID: ${doctor.id})`);

    // 3. Check current appointments
    console.log('\n📅 3. CURRENT APPOINTMENTS IN DATABASE:');
    const { data: currentAppointments } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:users!appointments_patient_id_fkey(name, phone),
        doctor:users!appointments_doctor_id_fkey(name, phone)
      `)
      .order('created_at', { ascending: false });

    console.log(`Found ${currentAppointments?.length || 0} existing appointments:`);
    currentAppointments?.forEach((apt, index) => {
      console.log(`  ${index + 1}. ${apt.patient?.name} → ${apt.doctor?.name}`);
      console.log(`     Date: ${apt.date.split('T')[0]} at ${apt.time}`);
      console.log(`     Reason: ${apt.reason}`);
      console.log(`     Status: ${apt.status}`);
      console.log(`     ID: ${apt.id}`);
      console.log('');
    });

    // 4. Create test appointments
    console.log('\n📝 4. CREATING TEST APPOINTMENTS:');
    
    const testAppointments = [
      {
        patient_id: patient.id,
        doctor_id: doctor.id,
        date: '2025-10-15T00:00:00.000Z',
        time: '09:00',
        reason: 'Database Test - Morning Consultation',
        consultation_type: 'IN_PERSON',
        consultation_fee: 500,
        status: 'SCHEDULED'
      },
      {
        patient_id: patient.id,
        doctor_id: doctor.id,
        date: '2025-10-16T00:00:00.000Z',
        time: '14:30',
        reason: 'Database Test - Follow-up Visit',
        consultation_type: 'VIDEO',
        consultation_fee: 500,
        status: 'SCHEDULED'
      },
      {
        patient_id: patient.id,
        doctor_id: doctor.id,
        date: '2025-10-17T00:00:00.000Z',
        time: '11:15',
        reason: 'Database Test - Checkup',
        consultation_type: 'IN_PERSON',
        consultation_fee: 500,
        status: 'SCHEDULED'
      }
    ];

    for (let i = 0; i < testAppointments.length; i++) {
      const aptData = testAppointments[i];
      console.log(`Creating appointment ${i + 1}...`);
      
      const { data: newApt, error: aptError } = await supabase
        .from('appointments')
        .insert([aptData])
        .select(`
          *,
          patient:users!appointments_patient_id_fkey(name, phone),
          doctor:users!appointments_doctor_id_fkey(name, phone)
        `)
        .single();

      if (aptError) {
        console.log(`❌ Error creating appointment ${i + 1}:`, aptError.message);
      } else {
        console.log(`✅ Created: ${newApt.patient.name} → ${newApt.doctor.name}`);
        console.log(`   Date: ${newApt.date.split('T')[0]} at ${newApt.time}`);
        console.log(`   ID: ${newApt.id}`);
      }
    }

    // 5. Verify API endpoints
    console.log('\n🔌 5. TESTING API ENDPOINTS:');
    
    // Test patient appointments
    console.log('Testing patient appointments API...');
    try {
      const patientResponse = await fetch('http://localhost:3000/api/appointments?userId=9042222856&userType=PATIENT');
      const patientData = await patientResponse.json();
      
      if (patientData.success) {
        console.log(`✅ Patient API: Found ${patientData.data.length} appointments`);
        patientData.data.forEach((apt, index) => {
          console.log(`   ${index + 1}. ${apt.doctorName} - ${apt.date} ${apt.time}`);
        });
      } else {
        console.log('❌ Patient API failed:', patientData.error);
      }
    } catch (error) {
      console.log('❌ Patient API error:', error.message);
    }

    // Test doctor appointments
    console.log('\nTesting doctor appointments API...');
    try {
      const doctorResponse = await fetch('http://localhost:3000/api/appointments?userId=9876543210&userType=DOCTOR');
      const doctorData = await doctorResponse.json();
      
      if (doctorData.success) {
        console.log(`✅ Doctor API: Found ${doctorData.data.length} appointments`);
        doctorData.data.forEach((apt, index) => {
          console.log(`   ${index + 1}. ${apt.patientName} - ${apt.date} ${apt.time}`);
        });
      } else {
        console.log('❌ Doctor API failed:', doctorData.error);
      }
    } catch (error) {
      console.log('❌ Doctor API error:', error.message);
    }

    // Test calendar format
    console.log('\nTesting calendar API...');
    try {
      const calendarResponse = await fetch('http://localhost:3000/api/appointments?userId=9876543210&userType=DOCTOR&format=calendar');
      const calendarData = await calendarResponse.json();
      
      if (Array.isArray(calendarData)) {
        console.log(`✅ Calendar API: Found ${calendarData.length} calendar events`);
        calendarData.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.title} - ${event.start}`);
        });
      } else {
        console.log('❌ Calendar API failed:', calendarData.error || 'Invalid format');
      }
    } catch (error) {
      console.log('❌ Calendar API error:', error.message);
    }

    // 6. Final verification
    console.log('\n✅ 6. FINAL DATABASE STATE:');
    const { data: finalAppointments } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:users!appointments_patient_id_fkey(name, phone),
        doctor:users!appointments_doctor_id_fkey(name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    console.log(`Total appointments in database: ${finalAppointments?.length || 0}`);
    console.log('\nRecent appointments:');
    finalAppointments?.slice(0, 5).forEach((apt, index) => {
      console.log(`${index + 1}. ${apt.patient?.name} → ${apt.doctor?.name} (${apt.date.split('T')[0]} ${apt.time})`);
    });

    console.log('\n🎉 DATABASE TEST COMPLETED SUCCESSFULLY!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check your browser at http://localhost:3000/db-integration-test.html');
    console.log('2. Login as patient: 9042222856');
    console.log('3. Login as doctor: 9876543210');
    console.log('4. Verify appointments appear in dashboards');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

async function setupTestUsers() {
  console.log('🔧 Setting up test users...');
  
  // Create patient
  const { data: patient, error: patientError } = await supabase
    .from('users')
    .upsert({
      phone: '9042222856',
      name: 'Test Patient',
      email: 'patient@test.com',
      user_type: 'PATIENT',
      is_verified: true
    }, { onConflict: 'phone' })
    .select()
    .single();

  if (patientError && !patientError.message.includes('duplicate')) {
    throw patientError;
  }

  // Create doctor
  const { data: doctor, error: doctorError } = await supabase
    .from('users')
    .upsert({
      phone: '9876543210',
      name: 'Dr. Test Doctor',
      email: 'doctor@test.com',
      user_type: 'DOCTOR',
      is_verified: true
    }, { onConflict: 'phone' })
    .select()
    .single();

  if (doctorError && !doctorError.message.includes('duplicate')) {
    throw doctorError;
  }

  console.log('✅ Test users created/updated');
}

// Run the test
console.log('🚀 Starting Database Data Test...');
testDatabaseData().catch(console.error);