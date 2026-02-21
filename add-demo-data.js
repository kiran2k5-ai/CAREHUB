const { createClient } = require('@supabase/supabase-js');

async function addDemoData() {
  try {
    console.log('🚀 Adding demo data to database...');
    
    const supabaseUrl = 'https://iephqtkmguephvajgbhz.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg1Mzk4NCwiZXhwIjoyMDc1NDI5OTg0fQ.546pGZFOzAMl-eSifUls_jieNO6MFzE8-Uwd5g0xenI';
    
    // Use service role key for admin operations
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Demo users data
    const demoUsers = [
      {
        id: 'doctor_9876543210',
        phone: '9876543210',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        user_type: 'DOCTOR',
        is_verified: true
      },
      {
        id: 'doctor_9876543211',
        phone: '9876543211',
        name: 'Dr. Michael Chen',
        email: 'michael.chen@hospital.com',
        user_type: 'DOCTOR',
        is_verified: true
      },
      {
        id: 'patient_9042222856',
        phone: '9042222856',
        name: 'John Smith',
        email: 'john.smith@email.com',
        user_type: 'PATIENT',
        is_verified: true
      },
      {
        id: 'patient_9042222857',
        phone: '9042222857',
        name: 'Jane Doe',
        email: 'jane.doe@email.com',
        user_type: 'PATIENT',
        is_verified: true
      }
    ];
    
    console.log('📝 Adding demo users...');
    for (const user of demoUsers) {
      const { data, error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'phone' });
      
      if (error) {
        console.log(`❌ Error adding user ${user.phone}:`, error.message);
      } else {
        console.log(`✅ Added user: ${user.name} (${user.phone})`);
      }
    }
    
    // Demo doctor profiles
    const doctorProfiles = [
      {
        user_id: 'doctor_9876543210',
        specialization: 'Cardiology',
        qualification: 'MD Cardiology, MBBS',
        experience_years: 15,
        consultation_fee: 800,
        bio: 'Experienced cardiologist specializing in heart diseases and cardiac surgery.',
        hospital_affiliations: ['City Hospital', 'Heart Care Center'],
        rating: 4.8,
        total_reviews: 245
      },
      {
        user_id: 'doctor_9876543211',
        specialization: 'Dermatology',
        qualification: 'MD Dermatology, MBBS',
        experience_years: 12,
        consultation_fee: 600,
        bio: 'Skin specialist with expertise in cosmetic and medical dermatology.',
        hospital_affiliations: ['Skin Care Clinic', 'Beauty Hospital'],
        rating: 4.7,
        total_reviews: 189
      }
    ];
    
    console.log('👨‍⚕️ Adding doctor profiles...');
    for (const profile of doctorProfiles) {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .upsert(profile, { onConflict: 'user_id' });
      
      if (error) {
        console.log(`❌ Error adding doctor profile:`, error.message);
      } else {
        console.log(`✅ Added doctor profile for: ${profile.user_id}`);
      }
    }
    
    // Demo patient profiles
    const patientProfiles = [
      {
        user_id: 'patient_9042222856',
        date_of_birth: '1985-03-15',
        gender: 'MALE',
        blood_group: 'O+',
        address: '123 Main Street, New York, NY 10001',
        emergency_contact: '9876543211',
        medical_history: ['Hypertension', 'Diabetes Type 2']
      },
      {
        user_id: 'patient_9042222857',
        date_of_birth: '1990-07-22',
        gender: 'FEMALE',
        blood_group: 'A+',
        address: '456 Oak Avenue, Los Angeles, CA 90210',
        emergency_contact: '9876543212',
        medical_history: ['Asthma', 'Allergies']
      }
    ];
    
    console.log('👤 Adding patient profiles...');
    for (const profile of patientProfiles) {
      const { data, error } = await supabase
        .from('patient_profiles')
        .upsert(profile, { onConflict: 'user_id' });
      
      if (error) {
        console.log(`❌ Error adding patient profile:`, error.message);
      } else {
        console.log(`✅ Added patient profile for: ${profile.user_id}`);
      }
    }
    
    // Demo appointment
    const demoAppointments = [
      {
        id: 'apt_demo_001',
        patient_id: 'patient_9042222856',
        doctor_id: 'doctor_9876543210',
        appointment_date: '2025-10-10',
        appointment_time: '10:00:00',
        status: 'SCHEDULED',
        consultation_type: 'IN_PERSON',
        consultation_fee: 800,
        reason: 'Regular heart checkup',
        notes: 'Patient has history of hypertension'
      }
    ];
    
    console.log('📅 Adding demo appointments...');
    for (const appointment of demoAppointments) {
      const { data, error } = await supabase
        .from('appointments')
        .upsert(appointment, { onConflict: 'id' });
      
      if (error) {
        console.log(`❌ Error adding appointment:`, error.message);
      } else {
        console.log(`✅ Added appointment: ${appointment.id}`);
      }
    }
    
    console.log('\n🎉 Demo data added successfully!');
    console.log('\n📋 You can now test with these credentials:');
    console.log('Doctors: 9876543210, 9876543211');
    console.log('Patients: 9042222856, 9042222857');
    
  } catch (error) {
    console.log('❌ Error adding demo data:', error.message);
  }
}

addDemoData();