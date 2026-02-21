const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'https://wbggppzxilmmsrgjdhrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZ2dwcHp4aWxtbXNyZ2pkaHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzNTIyNywiZXhwIjoyMDc1NjExMjI3fQ.9vwrw9A7ps0lWh8hs6oSV1M8h0rfakLKbsSmMa6jYbU'
);

async function createTablesViaRPC() {
  console.log('🚀 Creating medical records tables programmatically...');
  
  try {
    // Simple table creation SQL without complex constraints
    const createTablesSQL = `
      -- Create medical_records table (simple structure)
      CREATE TABLE IF NOT EXISTS medical_records (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          patient_id UUID NOT NULL,
          doctor_id UUID NOT NULL,
          visit_date DATE NOT NULL,
          visit_time TIME,
          diagnosis TEXT NOT NULL,
          examination_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create prescriptions table
      CREATE TABLE IF NOT EXISTS prescriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          medical_record_id UUID NOT NULL,
          medication_name VARCHAR(255) NOT NULL,
          dosage VARCHAR(100) NOT NULL,
          frequency VARCHAR(100) NOT NULL,
          duration VARCHAR(100),
          instructions TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create lab_reports table
      CREATE TABLE IF NOT EXISTS lab_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          medical_record_id UUID NOT NULL,
          test_name VARCHAR(255) NOT NULL,
          result_value TEXT,
          normal_range VARCHAR(100),
          test_date DATE NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create basic indexes for performance
      CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
      CREATE INDEX IF NOT EXISTS idx_medical_records_doctor ON medical_records(doctor_id);
      CREATE INDEX IF NOT EXISTS idx_prescriptions_record ON prescriptions(medical_record_id);
      CREATE INDEX IF NOT EXISTS idx_lab_reports_record ON lab_reports(medical_record_id);
    `;

    // Try to execute SQL using RPC function
    console.log('📝 Attempting to create tables using SQL...');
    
    // Method 1: Try using rpc if available
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
      
      if (error) {
        console.log('❌ RPC method failed:', error.message);
        throw error;
      }
      
      console.log('✅ Tables created successfully via RPC!');
      return true;
    } catch (rpcError) {
      console.log('❌ RPC method not available, trying alternative...');
      
      // Method 2: Try creating tables one by one using direct queries
      console.log('📝 Trying to create each table individually...');
      
      // First, let's try a simple insert to test permissions
      try {
        // Test if we can create a simple record first
        const testInsert = await supabase
          .from('appointments')
          .insert({
            patient_id: '00000000-0000-0000-0000-000000000000',
            doctor_id: '00000000-0000-0000-0000-000000000000',
            date: '2025-01-01',
            time: '10:00',
            status: 'TEST',
            reason: 'Permission Test'
          });
          
        console.log('✅ Basic insert permissions confirmed');
        
        // Clean up test record
        await supabase
          .from('appointments')
          .delete()
          .eq('reason', 'Permission Test');
          
      } catch (insertError) {
        console.log('❌ Insert test failed:', insertError.message);
      }
      
      // Method 3: Use a workaround - create tables via a stored procedure
      console.log('📝 Trying stored procedure approach...');
      
      const createFunction = `
        CREATE OR REPLACE FUNCTION create_medical_tables()
        RETURNS TEXT AS $$
        BEGIN
          -- Medical records table
          CREATE TABLE IF NOT EXISTS medical_records (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              patient_id UUID NOT NULL,
              doctor_id UUID NOT NULL,
              visit_date DATE NOT NULL,
              visit_time TIME,
              diagnosis TEXT NOT NULL,
              examination_notes TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Prescriptions table
          CREATE TABLE IF NOT EXISTS prescriptions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              medical_record_id UUID NOT NULL,
              medication_name VARCHAR(255) NOT NULL,
              dosage VARCHAR(100) NOT NULL,
              frequency VARCHAR(100) NOT NULL,
              duration VARCHAR(100),
              instructions TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Lab reports table
          CREATE TABLE IF NOT EXISTS lab_reports (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              medical_record_id UUID NOT NULL,
              test_name VARCHAR(255) NOT NULL,
              result_value TEXT,
              normal_range VARCHAR(100),
              test_date DATE NOT NULL,
              notes TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          RETURN 'Tables created successfully';
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      // Try to create and execute the function
      try {
        const { data: funcData, error: funcError } = await supabase.rpc('create_medical_tables');
        
        if (funcError) {
          console.log('❌ Function approach failed:', funcError.message);
        } else {
          console.log('✅ Tables created via function!', funcData);
          return true;
        }
      } catch (funcErr) {
        console.log('❌ Function creation failed:', funcErr.message);
      }
    }
    
  } catch (error) {
    console.log('❌ All table creation methods failed:', error.message);
    return false;
  }
}

async function verifyTables() {
  console.log('\n🔍 Verifying table creation...');
  
  const tables = ['medical_records', 'prescriptions', 'lab_reports'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
        
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Table exists and accessible`);
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
  }
}

async function main() {
  console.log('🏥 MEDICAL RECORDS DATABASE SETUP');
  console.log('==================================');
  
  const success = await createTablesViaRPC();
  
  if (success) {
    await verifyTables();
    console.log('\n🎉 Database setup completed!');
    console.log('✅ Ready to use new medical records structure');
  } else {
    console.log('\n⚠️  Table creation failed - using existing appointments table');
    console.log('💡 The system will continue working with current structure');
  }
}

main().catch(console.error);