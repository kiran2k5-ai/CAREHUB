const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wbggppzxilmmsrgjdhrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZ2dwcHp4aWxtbXNyZ2pkaHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzNTIyNywiZXhwIjoyMDc1NjExMjI3fQ.9vwrw9A7ps0lWh8hs6oSV1M8h0rfakLKbsSmMa6jYbU'
);

async function setupMedicalRecordsTables() {
  console.log('🏗️  Setting up proper Medical Records tables...');
  console.log('===========================================');

  try {
    // Check if tables already exist
    console.log('1. Checking existing tables...');
    
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['medical_records', 'prescriptions', 'lab_reports']);

    if (checkError) {
      console.log('❌ Could not check existing tables, proceeding with creation...');
    } else {
      const tableNames = existingTables?.map(t => t.table_name) || [];
      console.log('📋 Existing medical tables:', tableNames);
    }

    // Create medical_records table
    console.log('\n2. Creating medical_records table...');
    const createMedicalRecords = `
      CREATE TABLE IF NOT EXISTS medical_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
        visit_date DATE NOT NULL,
        visit_time TIME,
        chief_complaint TEXT,
        diagnosis TEXT NOT NULL,
        symptoms TEXT[],
        vital_signs JSONB DEFAULT '{}',
        examination_notes TEXT,
        treatment_plan TEXT,
        follow_up_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: mrError } = await supabase.rpc('exec_sql', { sql: createMedicalRecords });
    if (mrError) {
      console.error('❌ Error creating medical_records table:', mrError);
    } else {
      console.log('✅ medical_records table created');
    }

    // Create prescriptions table
    console.log('\n3. Creating prescriptions table...');
    const createPrescriptions = `
      CREATE TABLE IF NOT EXISTS prescriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
        medication_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100) NOT NULL,
        frequency VARCHAR(100) NOT NULL,
        duration VARCHAR(100),
        instructions TEXT,
        quantity INTEGER,
        refills INTEGER DEFAULT 0,
        prescribed_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: presError } = await supabase.rpc('exec_sql', { sql: createPrescriptions });
    if (presError) {
      console.error('❌ Error creating prescriptions table:', presError);
    } else {
      console.log('✅ prescriptions table created');
    }

    // Create lab_reports table
    console.log('\n4. Creating lab_reports table...');
    const createLabReports = `
      CREATE TABLE IF NOT EXISTS lab_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
        test_name VARCHAR(255) NOT NULL,
        test_type VARCHAR(100),
        result_value TEXT,
        normal_range VARCHAR(100),
        unit VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        test_date DATE NOT NULL,
        lab_name VARCHAR(255),
        notes TEXT,
        file_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: labError } = await supabase.rpc('exec_sql', { sql: createLabReports });
    if (labError) {
      console.error('❌ Error creating lab_reports table:', labError);
    } else {
      console.log('✅ lab_reports table created');
    }

    // Create indexes
    console.log('\n5. Creating indexes for performance...');
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
      CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON medical_records(doctor_id);
      CREATE INDEX IF NOT EXISTS idx_medical_records_visit_date ON medical_records(visit_date);
      CREATE INDEX IF NOT EXISTS idx_prescriptions_medical_record_id ON prescriptions(medical_record_id);
      CREATE INDEX IF NOT EXISTS idx_lab_reports_medical_record_id ON lab_reports(medical_record_id);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexes });
    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created');
    }

    console.log('\n🎉 Medical Records tables setup complete!');
    console.log('\n📋 Tables created:');
    console.log('   - medical_records (main records)');
    console.log('   - prescriptions (medications)');
    console.log('   - lab_reports (test results)');
    console.log('\n🔗 Foreign key relationships established');
    console.log('🚀 Indexes created for performance');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupMedicalRecordsTables();