// Real-time appointment checker
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wbggppzxilmmsrgjdhrd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZ2dwcHp4aWxtbXNyZ2pkaHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzUyMjcsImV4cCI6MjA3NTYxMTIyN30.8tyiP8L97KvMDZHMOsDsUzxaZyQ-i53Eb2RARkdjOMw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAppointments() {
  console.log('📅 Checking appointments in database...\n');
  
  try {
    // Get all appointments (without created_at column)
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching appointments:', error);
      return;
    }
    
    if (appointments.length === 0) {
      console.log('📭 No appointments found in database');
      return;
    }
    
    console.log(`📊 Found ${appointments.length} appointment(s):\n`);
    
    // Display each appointment
    appointments.forEach((apt, index) => {
      console.log(`📌 Appointment ${index + 1}:`);
      console.log(`   ID: ${apt.id}`);
      console.log(`   Date: ${apt.date} at ${apt.time}`);
      console.log(`   Patient ID: ${apt.patient_id}`);
      console.log(`   Doctor ID: ${apt.doctor_id}`);
      console.log(`   Reason: ${apt.reason}`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Fee: ₹${apt.consultation_fee}`);
      console.log(''); // Empty line for spacing
    });
    
    // Get latest appointment details
    if (appointments.length > 0) {
      const latest = appointments[0];
      console.log('🔥 Latest Appointment Details:');
      console.log(`   ${latest.date} ${latest.time} - ${latest.reason}`);
      console.log(`   Status: ${latest.status}`);
    }
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

// Run immediately
checkAppointments();

// Optional: Run every 10 seconds to monitor real-time
console.log('⏱️  Watching for new appointments... (Press Ctrl+C to stop)\n');
setInterval(checkAppointments, 10000);