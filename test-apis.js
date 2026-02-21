// Test the fixed doctor API with real UUID
fetch('http://localhost:3001/api/doctors/5a7ec831-cd80-42ef-ae13-9805d4293261')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Doctor API test result:');
    console.log('Success:', data.success);
    if (data.success) {
      console.log('Doctor Name:', data.data.name);
      console.log('Doctor ID:', data.data.id);
      console.log('Specialization:', data.data.specialization);
    } else {
      console.log('Error:', data.message);
    }
  })
  .catch(err => console.error('❌ Test failed:', err.message));

// Then test the main doctors list API
fetch('http://localhost:3001/api/doctors')
  .then(res => res.json())
  .then(data => {
    console.log('\n📋 Doctors list API result:');
    console.log('Success:', data.success);
    if (data.success && data.data?.doctors) {
      console.log('Total doctors:', data.data.doctors.length);
      console.log('First doctor ID:', data.data.doctors[0]?.id);
      console.log('First doctor name:', data.data.doctors[0]?.name);
    }
  })
  .catch(err => console.error('❌ Doctors list failed:', err.message));