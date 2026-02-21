// Test Supabase Database Connection
// Run this to verify your database credentials and connection

import { createClient } from '@supabase/supabase-js'

// Your database credentials from .env.local
const supabaseUrl = 'https://iephqtkmguephvajgbhz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTM5ODQsImV4cCI6MjA3NTQyOTk4NH0.8XG69Nd5c3S_HshjJa_TjhwYN5pbnMqqLIZNiAjk7js'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🚀 Testing Supabase Database Connection...')
  console.log('=' * 50)
  console.log('📍 Database URL:', supabaseUrl)
  console.log('🔑 Using API Key:', supabaseKey.substring(0, 20) + '...')
  console.log('')

  try {
    // Test 1: Check database connection
    console.log('🔍 Test 1: Checking database connection...')
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log('❌ Connection failed:', error.message)
      return false
    } else {
      console.log('✅ Database connected successfully!')
      console.log(`📊 Total users in database: ${data}`)
    }

    // Test 2: Check if tables exist
    console.log('\n🔍 Test 2: Checking database tables...')
    
    const tables = ['users', 'doctor_profiles', 'patient_profiles', 'appointments']
    
    for (const table of tables) {
      try {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        console.log(`✅ Table '${table}': ${count} records`)
      } catch (err) {
        console.log(`❌ Table '${table}': Not found or error - ${err.message}`)
      }
    }

    // Test 3: Check existing data
    console.log('\n🔍 Test 3: Checking existing data...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message)
    } else {
      console.log(`📋 Sample users (${users.length}):`)
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.phone}) - ${user.user_type}`)
      })
    }

    // Test 4: Check appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .limit(3)
    
    if (appointmentsError) {
      console.log('❌ Error fetching appointments:', appointmentsError.message)
    } else {
      console.log(`\n📅 Sample appointments (${appointments.length}):`)
      appointments.forEach((apt, index) => {
        console.log(`  ${index + 1}. ID: ${apt.id}`)
        console.log(`     Date: ${apt.date} at ${apt.time}`)
        console.log(`     Status: ${apt.status}`)
        console.log(`     Patient: ${apt.patient_id}`)
        console.log(`     Doctor: ${apt.doctor_id}`)
        console.log('     ---')
      })
    }

    // Test 5: Create a test record to verify write permissions
    console.log('\n🔍 Test 5: Testing write permissions...')
    
    const testUser = {
      phone: `test_${Date.now()}`,
      name: 'Console Test User',
      user_type: 'PATIENT'
    }
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single()
    
    if (createError) {
      console.log('❌ Write test failed:', createError.message)
    } else {
      console.log('✅ Write test successful! Created user:', newUser.id)
      
      // Clean up test record
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', newUser.id)
      
      if (deleteError) {
        console.log('⚠️ Failed to cleanup test user:', deleteError.message)
      } else {
        console.log('🗑️ Test user cleaned up successfully')
      }
    }

    console.log('\n🎯 Database Connection Test Complete!')
    console.log('✅ Your Supabase database is connected and working properly!')
    return true

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return false
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('\n🚀 You can now proceed with the booking system setup!')
    } else {
      console.log('\n❌ Please check your database configuration before proceeding.')
    }
  })
  .catch(console.error)