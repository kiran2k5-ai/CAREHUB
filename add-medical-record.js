const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iephqtkmguephvajgbhz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcGhxdGttZ3VlcGh2YWpnYmh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg1Mzk4NCwiZXhwIjoyMDc1NDI5OTg0fQ.546pGZFOzAMl-eSifUls_jieNO6MFzE8-Uwd5g0xenI';

const supabase = createClient(supabaseUrl, supabaseKey);
const DOCTOR_ID = '550e8400-e29b-41d4-a716-446655440001'; // Your doctor ID

async function addMedicalRecord() {
  try {
    console.log('🏥 Adding Medical Record for Patient 9042222856\n');

    // 1. Find the patient by phone number
    console.log('🔍 Finding patient with phone 9042222856...');
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .select('id, name, phone')
      .eq('phone', '9042222856')
      .eq('user_type', 'PATIENT')
      .single();

    if (patientError || !patient) {
      console.log('❌ Patient not found:', patientError?.message);
      return;
    }

    console.log(`✅ Found patient: ${patient.name} (ID: ${patient.id})\n`);

    // 2. Create a medical record
    console.log('📝 Creating medical record...');
    const { data: medicalRecord, error: mrError } = await supabase
      .from('medical_records')
      .insert({
        patient_id: patient.id,
        doctor_id: DOCTOR_ID,
        visit_date: new Date().toISOString().split('T')[0], // Today's date (2026-03-14)
        visit_time: '10:00',
        diagnosis: 'Annual Health Checkup',
        examination_notes: 'Patient is in good health. Continue current lifestyle.',
        temperature: 98.6,
        blood_pressure: '120/80',
        pulse_rate: 72,
        weight: 70.5,
        height: 175
      })
      .select()
      .single();

    if (mrError) {
      console.log('❌ Medical record creation error:', mrError.message);
      return;
    }

    console.log(`✅ Medical record created (ID: ${medicalRecord.id})\n`);

    // 3. Add prescriptions
    console.log('💊 Adding prescriptions...');
    const { data: prescriptions, error: prescError } = await supabase
      .from('prescriptions')
      .insert([
        {
          medical_record_id: medicalRecord.id,
          medication_name: 'Vitamin D3',
          dosage: '1000 IU',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take with meals',
          quantity: 30,
          refills: 2
        },
        {
          medical_record_id: medicalRecord.id,
          medication_name: 'Aspirin',
          dosage: '100 mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take with food',
          quantity: 30,
          refills: 0
        }
      ])
      .select();

    if (prescError) {
      console.log('⚠️  Warning - Prescription error:', prescError.message);
    } else {
      console.log(`✅ Added ${prescriptions.length} prescriptions\n`);
    }

    // 4. Add lab reports
    console.log('🧪 Adding lab reports...');
    const { data: labReports, error: labError } = await supabase
      .from('lab_reports')
      .insert([
        {
          medical_record_id: medicalRecord.id,
          test_name: 'Complete Blood Count (CBC)',
          test_date: new Date().toISOString().split('T')[0],
          result_value: 'Normal',
          normal_range: 'Within normal limits',
          status: 'Normal',
          lab_name: 'Central Diagnostic Lab',
          notes: 'All parameters normal',
          is_critical: false
        },
        {
          medical_record_id: medicalRecord.id,
          test_name: 'Lipid Profile',
          test_date: new Date().toISOString().split('T')[0],
          result_value: '180 mg/dL',
          normal_range: '<200 mg/dL',
          status: 'Normal',
          lab_name: 'Central Diagnostic Lab',
          notes: 'Cholesterol within normal range',
          is_critical: false
        }
      ])
      .select();

    if (labError) {
      console.log('⚠️  Warning - Lab report error:', labError.message);
    } else {
      console.log(`✅ Added ${labReports.length} lab reports\n`);
    }

    // 5. Summary
    console.log('=' .repeat(50));
    console.log('✅ MEDICAL RECORD SUCCESSFULLY ADDED!\n');
    console.log('📋 Summary:');
    console.log(`  Patient: ${patient.name} (${patient.phone})`);
    console.log(`  Doctor: ${DOCTOR_ID}`);
    console.log(`  Visit Date: ${medicalRecord.visit_date}`);
    console.log(`  Diagnosis: ${medicalRecord.diagnosis}`);
    console.log(`  Vital Signs: Temp ${medicalRecord.temperature}°F, BP ${medicalRecord.blood_pressure}, HR ${medicalRecord.pulse_rate}`);
    console.log(`  Prescriptions: ${prescriptions?.length || 0}`);
    console.log(`  Lab Reports: ${labReports?.length || 0}`);
    console.log('=' .repeat(50));

  } catch (err) {
    console.error('💥 Error:', err);
  }
}

addMedicalRecord();
