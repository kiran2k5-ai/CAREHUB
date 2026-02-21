// Console script to create appointment in database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iephqtkmguephvajgbhz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTM5ODQsImV4cCI6MjA3NTQyOTk4NH0.8XG69Nd5c3S_HshjJa_TjhwYN5pbnMqqLIZNiAjk7js';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAppointment() {
  console.log('🏥 Creating new appointment in database...');
  
  // Patient UUID (Test Patient)
  const patientId = '514610d2-38bc-4f31-b607-5c787b41f03a';
  
  // Doctor UUID (Dr. Prakash Das)  
  const doctorId = '5a7ec831-cd80-42ef-ae13-9805d4293261';
  
  // Appointment data
  const appointmentData = {
    patient_id: patientId,
    doctor_id: doctorId,
    date: '2025-10-12',  // Future date
    time: '10:30',
    consultation_type: 'VIDEO',
    consultation_fee: 500,
    status: 'SCHEDULED',
    reason: 'Console Test - General Checkup',
    notes: 'Created via console script for testing'
  };
  
  try {
    console.log('📋 Inserting appointment:', appointmentData);
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating appointment:', error);
    } else {
      console.log('✅ Appointment created successfully!');
      console.log('📊 New appointment data:', JSON.stringify(data, null, 2));
      console.log('🔗 Appointment ID:', data.id);
    }
    
    // Also fetch all appointments to show database state
    console.log('\n📋 Fetching all appointments for patient...');
    const { data: allAppointments, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor_profiles(*, users(*)),
        patient_profiles:patients!appointments_patient_id_fkey(*, users(*))
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: true });
    
    if (fetchError) {
      console.error('❌ Error fetching appointments:', fetchError);
    } else {
      console.log(`📅 Total appointments in DB: ${allAppointments.length}`);
      allAppointments.forEach((apt, index) => {
        console.log(`${index + 1}. ${apt.date} at ${apt.time} - ${apt.reason} (${apt.status})`);
      });
    }
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

createAppointment();