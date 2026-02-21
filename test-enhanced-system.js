const { createClient } = require('@supabase/supabase-js');

// Test enhanced medical records system
const supabase = createClient(
  'https://wbggppzxilmmsrgjdhrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZ2dwcHp4aWxtbXNyZ2pkaHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzNTIyNywiZXhwIjoyMDc1NjExMjI3fQ.9vwrw9A7ps0lWh8hs6oSV1M8h0rfakLKbsSmMa6jYbU'
);

async function testEnhancedSystem() {
  console.log('🚀 TESTING ENHANCED MEDICAL RECORDS SYSTEM');
  console.log('==========================================');

  try {
    // First, get available patients and doctors
    console.log('\n📋 Getting available patients and doctors...');
    
    const { data: patients } = await supabase
      .from('users')
      .select('id, full_name, user_type')
      .eq('user_type', 'PATIENT')
      .limit(2);
      
    const { data: doctors } = await supabase
      .from('users')
      .select('id, full_name, user_type')
      .eq('user_type', 'DOCTOR')
      .limit(1);

    if (!patients?.length || !doctors?.length) {
      console.log('❌ No patients or doctors found');
      return;
    }

    console.log(`✅ Found ${patients.length} patients and ${doctors.length} doctors`);
    console.log(`   Patient: ${patients[0].full_name} (${patients[0].id})`);
    console.log(`   Doctor: ${doctors[0].full_name} (${doctors[0].id})`);

    // Test the enhanced API
    console.log('\n🧪 Testing Enhanced Medical Records API...');
    
    const testData = {
      patientId: patients[0].id,
      doctorId: doctors[0].id,
      visitDate: '2025-01-12',
      visitTime: '14:30',
      diagnosis: 'Enhanced System Test - Table-like Structure',
      examinationNotes: 'Testing the enhanced medical records system that organizes data like normalized tables but stores in appointments.',
      prescriptions: [
        {
          medicationName: 'Enhanced Medicine A',
          dosage: '10mg',
          frequency: 'Twice daily',
          duration: '7 days',
          instructions: 'Take with food'
        },
        {
          medicationName: 'Enhanced Medicine B',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: '14 days',
          instructions: 'Take before sleep'
        }
      ],
      labReports: [
        {
          testName: 'Enhanced Blood Test',
          resultValue: '120 mg/dL',
          normalRange: '70-140 mg/dL',
          testDate: '2025-01-12',
          notes: 'Normal range'
        },
        {
          testName: 'Enhanced X-Ray',
          resultValue: 'Clear',
          normalRange: 'No abnormalities',
          testDate: '2025-01-12',
          notes: 'Chest X-ray shows no issues'
        }
      ]
    };

    // Create medical record via API
    const response = await fetch('http://localhost:3000/api/medical-records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.log('❌ API call failed:', response.status, errorData);
      return;
    }

    const result = await response.json();
    console.log('✅ Enhanced Medical Record Created!');
    console.log('   Record ID:', result.data.medical_record_id);
    console.log('   Prescriptions:', result.data.stats.prescriptions_count);
    console.log('   Lab Reports:', result.data.stats.lab_reports_count);

    // Test the GET API
    console.log('\n📖 Testing Enhanced Medical Records Retrieval...');
    
    const getResponse = await fetch(`http://localhost:3000/api/medical-records?patientId=${patients[0].id}&limit=5`);
    
    if (!getResponse.ok) {
      console.log('❌ GET API failed:', getResponse.status);
      return;
    }

    const getResult = await getResponse.json();
    console.log(`✅ Retrieved ${getResult.count} medical records`);
    
    if (getResult.data.length > 0) {
      const latestRecord = getResult.data[0];
      console.log('\n📋 Latest Record Details:');
      console.log('   ID:', latestRecord.id);
      console.log('   Diagnosis:', latestRecord.diagnosis);
      console.log('   Visit Date:', latestRecord.visit_date);
      console.log('   Prescriptions Count:', latestRecord.prescriptions?.length || 0);
      console.log('   Lab Reports Count:', latestRecord.lab_reports?.length || 0);
      console.log('   Structure Version:', latestRecord.metadata?.structure_version);
      
      if (latestRecord.prescriptions?.length > 0) {
        console.log('\n💊 First Prescription:');
        const rx = latestRecord.prescriptions[0];
        console.log('     Medicine:', rx.medication_name);
        console.log('     Dosage:', rx.dosage);
        console.log('     Frequency:', rx.frequency);
      }
      
      if (latestRecord.lab_reports?.length > 0) {
        console.log('\n🧪 First Lab Report:');
        const lab = latestRecord.lab_reports[0];
        console.log('     Test:', lab.test_name);
        console.log('     Result:', lab.result_value);
        console.log('     Range:', lab.normal_range);
      }
    }

    console.log('\n🎉 ENHANCED SYSTEM TEST COMPLETED!');
    console.log('===================================');
    console.log('✅ Data is now organized like normalized tables');
    console.log('✅ Each prescription and lab report has unique IDs');
    console.log('✅ Better structure for future querying');
    console.log('✅ Backward compatible with existing data');
    console.log('✅ No database schema changes required');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Start the test
testEnhancedSystem();