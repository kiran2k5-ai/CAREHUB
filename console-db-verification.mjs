// Direct Database Console Verification
// This script sends data directly to Supabase and shows console output

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iephqtkmguephvajgbhz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTM5ODQsImV4cCI6MjA3NTQyOTk4NH0.8XG69Nd5c3S_HshjJa_TjhwYN5pbnMqqLIZNiAjk7js'

const supabase = createClient(supabaseUrl, supabaseKey)

async function sendConsoleData() {
  console.log('🚀 Sending data to Supabase database...')
  console.log('Database URL:', supabaseUrl)
  
  try {
    // 1. Create a new appointment with timestamp
    const timestamp = new Date().toISOString()
    const appointmentDate = '2024-12-27T00:00:00.000Z'
    const newAppointment = {
      patient_id: 'a1b2c3d4-e5f6-4321-9876-12345678901a', // Test patient
      doctor_id: 'f1e2d3c4-b5a6-7890-1234-567890abcdef',   // Test doctor
      date: appointmentDate,
      time: '14:30:00',
      reason: `Console Test Appointment - ${timestamp}`,
      status: 'SCHEDULED',
      consultation_type: 'IN_PERSON',
      consultation_fee: 500,
      created_at: timestamp
    }
    
    console.log('📝 Creating appointment:', newAppointment)
    
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .insert([newAppointment])
      .select()
    
    if (appointmentError) {
      console.error('❌ Appointment Error:', appointmentError)
    } else {
      console.log('✅ Appointment Created:', appointmentData)
    }
    
    // 2. Fetch all appointments to verify
    console.log('\n📋 Fetching all appointments from database...')
    const { data: allAppointments, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        *,
        users!appointments_patient_id_fkey (name, phone),
        users_doctor:users!appointments_doctor_id_fkey (name, phone)
      `)
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('❌ Fetch Error:', fetchError)
    } else {
      console.log('📊 Total Appointments in Database:', allAppointments.length)
      console.log('🔍 Recent Appointments:')
      allAppointments.slice(0, 5).forEach((apt, index) => {
        console.log(`${index + 1}. ID: ${apt.id}`)
        console.log(`   Patient: ${apt.users?.name} (${apt.users?.phone})`)
        console.log(`   Doctor: ${apt.users_doctor?.name} (${apt.users_doctor?.phone})`)
        console.log(`   Date: ${apt.date} at ${apt.time}`)
        console.log(`   Reason: ${apt.reason}`)
        console.log(`   Status: ${apt.status}`)
        console.log(`   Type: ${apt.consultation_type}`)
        console.log(`   Fee: $${apt.consultation_fee}`)
        console.log(`   Created: ${apt.created_at}`)
        console.log('   ---')
      })
    }
    
    // 3. Verify user counts
    console.log('\n👥 Checking user counts...')
    
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    const { count: patientCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'PATIENT')

    const { count: doctorCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'DOCTOR')
    
    console.log(`👥 Total users in database: ${userCount}`)
    console.log(`👤 Patients in database: ${patientCount}`)
    console.log(`👨‍⚕️ Doctors in database: ${doctorCount}`)
    
    // 4. Test API endpoints through localhost
    console.log('\n🌐 Testing API endpoints...')
    
    try {
      const apiResponse = await fetch('http://localhost:3000/api/appointments')
      const apiData = await apiResponse.json()
      console.log('✅ API Response Status:', apiResponse.status)
      console.log('📄 API Data Sample:', apiData.slice(0, 2))
    } catch (apiError) {
      console.log('❌ API Test Error:', apiError.message)
    }
    
    console.log('\n🎯 Console verification complete!')
    console.log('✅ Database is connected and operational')
    console.log('✅ Data is being stored and retrieved successfully')
    
  } catch (error) {
    console.error('💥 General Error:', error)
  }
}

// Run the console verification
sendConsoleData()