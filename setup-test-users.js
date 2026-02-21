const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iephqtkmguephvajgbhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg1Mzk4NCwiZXhwIjoyMDc1NDI5OTg0fQ.546pGZFOzAMl-eSifUls_jieNO6MFzE8-Uwd5g0xenI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTestUsers() {
  try {
    console.log('🔧 Setting up test users in Supabase database...');

    // 1. Create test patient (9042222856)
    console.log('👤 Creating test patient...');
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .upsert({
        phone: '9042222856',
        name: 'Test Patient',
        email: 'patient@test.com',
        user_type: 'PATIENT',
        is_verified: true
      }, { 
        onConflict: 'phone',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (patientError) {
      console.log('❌ Patient creation error:', patientError.message);
      if (!patientError.message.includes('duplicate')) {
        throw patientError;
      }
      // Get existing patient
      const { data: existingPatient } = await supabase
        .from('users')
        .select('*')
        .eq('phone', '9042222856')
        .single();
      console.log('📋 Using existing patient:', existingPatient);
      
      // Create patient profile if doesn't exist
      await supabase
        .from('patient_profiles')
        .upsert({
          user_id: existingPatient.id,
          age: 28,
          gender: 'Male',
          blood_group: 'O+'
        }, { onConflict: 'user_id' });
    } else {
      console.log('✅ Patient created:', patient);
      
      // Create patient profile
      await supabase
        .from('patient_profiles')
        .upsert({
          user_id: patient.id,
          age: 28,
          gender: 'Male',
          blood_group: 'O+'
        }, { onConflict: 'user_id' });
    }

    // 2. Create test doctor (9876543210)
    console.log('👨‍⚕️ Creating test doctor...');
    const { data: doctor, error: doctorError } = await supabase
      .from('users')
      .upsert({
        phone: '9876543210',
        name: 'Dr. Test Doctor',
        email: 'doctor@test.com',
        user_type: 'DOCTOR',
        is_verified: true
      }, { 
        onConflict: 'phone',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (doctorError) {
      console.log('❌ Doctor creation error:', doctorError.message);
      if (!doctorError.message.includes('duplicate')) {
        throw doctorError;
      }
      // Get existing doctor
      const { data: existingDoctor } = await supabase
        .from('users')
        .select('*')
        .eq('phone', '9876543210')
        .single();
      console.log('📋 Using existing doctor:', existingDoctor);
      
      // Create doctor profile if doesn't exist
      await supabase
        .from('doctor_profiles')
        .upsert({
          user_id: existingDoctor.id,
          specialization: 'General Physician',
          experience: '5 years',
          consultation_fee: 500,
          qualifications: '["MBBS", "MD"]',
          languages: '["English", "Hindi"]',
          working_hours: '9:00 AM - 7:00 PM',
          about: 'Experienced general physician specializing in family medicine.',
          rating: 4.8,
          review_count: 127,
          is_available: true
        }, { onConflict: 'user_id' });
    } else {
      console.log('✅ Doctor created:', doctor);
      
      // Create doctor profile
      await supabase
        .from('doctor_profiles')
        .upsert({
          user_id: doctor.id,
          specialization: 'General Physician',
          experience: '5 years',
          consultation_fee: 500,
          qualifications: '["MBBS", "MD"]',
          languages: '["English", "Hindi"]',
          working_hours: '9:00 AM - 7:00 PM',
          about: 'Experienced general physician specializing in family medicine.',
          rating: 4.8,
          review_count: 127,
          is_available: true
        }, { onConflict: 'user_id' });
    }

    // 3. Verify users exist
    console.log('🔍 Verifying users...');
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select(`
        *,
        doctor_profiles(*),
        patient_profiles(*)
      `);

    if (usersError) {
      throw usersError;
    }

    console.log('📊 Database users summary:');
    allUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.phone}) - ${user.user_type}`);
      if (user.user_type === 'DOCTOR' && user.doctor_profiles[0]) {
        console.log(`    📋 Specialization: ${user.doctor_profiles[0].specialization}`);
        console.log(`    💰 Fee: ₹${user.doctor_profiles[0].consultation_fee}`);
      }
    });

    console.log('\n✅ Test users setup completed successfully!');
    console.log('🔧 You can now test the booking system:');
    console.log('   👤 Patient: 9042222856 (Test Patient)');
    console.log('   👨‍⚕️ Doctor: 9876543210 (Dr. Test Doctor)');

  } catch (error) {
    console.error('❌ Error setting up test users:', error);
  }
}

setupTestUsers();