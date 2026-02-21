// Simple database setup for medical records
const { createClient } = require('@supabase/supabase-js');

// You'll need to add your Supabase credentials here
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (supabaseUrl === 'your-supabase-url' || supabaseKey === 'your-service-role-key') {
  console.log(`
🔧 SETUP REQUIRED:

1. Set your Supabase credentials in environment variables:
   - NEXT_PUBLIC_SUPABASE_URL=your-project-url
   - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

2. Or update this file with your credentials

3. Then run: node create-medical-tables.js

4. Go to your Supabase dashboard > SQL Editor and run this SQL:

CREATE TABLE IF NOT EXISTS medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT,
    prescribed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    results TEXT NOT NULL,
    normal_range VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_medical_record_id ON prescriptions(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_medical_record_id ON lab_reports(medical_record_id);

-- Enable RLS
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust as needed)
CREATE POLICY "medical_records_policy" ON medical_records FOR ALL USING (true);
CREATE POLICY "prescriptions_policy" ON prescriptions FOR ALL USING (true);
CREATE POLICY "lab_reports_policy" ON lab_reports FOR ALL USING (true);
  `);
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('🏥 Creating medical records tables...');
  
  try {
    // Test connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Connected to Supabase successfully!');
    console.log('📋 Please run the SQL commands shown above in your Supabase SQL Editor');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTables();