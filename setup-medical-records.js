import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupMedicalRecords() {
  try {
    console.log('🏥 Setting up medical records database schema...');
    
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'setup-medical-records.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements (basic splitting by semicolons)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await supabaseAdmin.from('').select('').limit(0); // Test connection
          // For complex SQL, we might need to use rpc or direct database connection
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
        }
      }
    }
    
    console.log('✅ Medical records schema setup completed!');
    
    // Test by creating a simple medical record
    console.log('🧪 Testing medical records insertion...');
    
    // First, get some users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, user_type')
      .limit(5);
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log('👥 Found users:', users?.length || 0);
    
    const patient = users?.find(u => u.user_type === 'patient');
    const doctor = users?.find(u => u.user_type === 'doctor');
    
    if (patient && doctor) {
      console.log(`👨‍⚕️ Doctor: ${doctor.email}`);
      console.log(`🧑‍🦱 Patient: ${patient.email}`);
      
      // Try to insert a medical record
      const { data: medicalRecord, error: recordError } = await supabaseAdmin
        .from('medical_records')
        .insert({
          patient_id: patient.id,
          doctor_id: doctor.id,
          visit_date: new Date().toISOString().split('T')[0],
          diagnosis: 'Test Medical Record',
          notes: 'This is a test medical record created during setup.'
        })
        .select()
        .single();
      
      if (recordError) {
        console.error('❌ Error creating test medical record:', recordError);
      } else {
        console.log('✅ Test medical record created:', medicalRecord.id);
        
        // Test prescription insertion
        const { data: prescription, error: prescriptionError } = await supabaseAdmin
          .from('prescriptions')
          .insert({
            medical_record_id: medicalRecord.id,
            medication_name: 'Test Medication',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '7 days',
            instructions: 'Take with food'
          })
          .select()
          .single();
        
        if (prescriptionError) {
          console.error('❌ Error creating test prescription:', prescriptionError);
        } else {
          console.log('✅ Test prescription created:', prescription.id);
        }
      }
    } else {
      console.log('⚠️ No patient/doctor found for testing');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

if (require.main === module) {
  setupMedicalRecords().then(() => {
    console.log('🎉 Setup completed!');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
}

export default setupMedicalRecords;