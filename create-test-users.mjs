// Create Test Users in Database
// This script adds the test users (patient & doctor) to your Supabase database

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iephqtkmguephvajgbhz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTM5ODQsImV4cCI6MjA3NTQyOTk4NH0.8XG69Nd5c3S_HshjJa_TjhwYN5pbnMqqLIZNiAjk7js'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUsers() {
  console.log('🚀 Creating test users in database...')
  console.log('=' * 50)

  try {
    // Test users data
    const testUsers = [
      {
        phone: '9042222856',
        name: 'Test Patient',
        user_type: 'PATIENT'
      },
      {
        phone: '9876543210', 
        name: 'Dr. Test Doctor',
        user_type: 'DOCTOR'
      }
    ]

    for (const userData of testUsers) {
      console.log(`\n👤 Creating user: ${userData.name} (${userData.phone})`)
      
      // Check if user already exists
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('phone', userData.phone)
        .single()
      
      if (existing) {
        console.log(`✅ User already exists: ${existing.name} (ID: ${existing.id})`)
        continue
      }

      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()

      if (error) {
        console.log(`❌ Failed to create ${userData.name}:`, error.message)
      } else {
        console.log(`✅ Created ${userData.name}:`)
        console.log(`   ID: ${newUser.id}`)
        console.log(`   Phone: ${newUser.phone}`)
        console.log(`   Type: ${newUser.user_type}`)

        // If it's a doctor, create doctor profile
        if (userData.user_type === 'DOCTOR') {
          console.log(`   📋 Creating doctor profile...`)
          
          const { data: doctorProfile, error: profileError } = await supabase
            .from('doctor_profiles')
            .insert([{
              user_id: newUser.id,
              specialization: 'General Medicine',
              experience: '5 years',
              consultation_fee: 500,
              rating: 4.5,
              about: 'Experienced doctor for general consultations'
            }])
            .select()
            .single()

          if (profileError) {
            console.log(`   ❌ Failed to create doctor profile:`, profileError.message)
          } else {
            console.log(`   ✅ Doctor profile created: ${doctorProfile.id}`)
          }
        }

        // If it's a patient, create patient profile  
        if (userData.user_type === 'PATIENT') {
          console.log(`   📋 Creating patient profile...`)
          
          const { data: patientProfile, error: profileError } = await supabase
            .from('patient_profiles')
            .insert([{
              user_id: newUser.id,
              age: 30,
              gender: 'Other'
            }])
            .select()
            .single()

          if (profileError) {
            console.log(`   ❌ Failed to create patient profile:`, profileError.message)
          } else {
            console.log(`   ✅ Patient profile created: ${patientProfile.id}`)
          }
        }
      }
    }

    // Show final user count
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    console.log(`\n📊 Total users in database: ${count}`)
    console.log('\n🎯 Test users are ready!')
    console.log('✅ You can now login with:')
    console.log('   Patient: 9042222856')  
    console.log('   Doctor: 9876543210')

  } catch (error) {
    console.error('💥 Error:', error)
  }
}

// Run the script
createTestUsers()