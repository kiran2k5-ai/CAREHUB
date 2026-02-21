// Test doctors API response
fetch('http://localhost:3001/api/doctors')
  .then(res => res.json())
  .then(data => {
    console.log('🔍 Doctors API Response:');
    console.log('Success:', data.success);
    console.log('Doctor count:', data.data?.doctors?.length || 'Unknown');
    
    if (data.data?.doctors?.length > 0) {
      console.log('\n👨‍⚕️ First doctor:');
      const firstDoctor = data.data.doctors[0];
      console.log('ID:', firstDoctor.id);
      console.log('Name:', firstDoctor.name);
      console.log('UserID:', firstDoctor.userId);
    }
  })
  .catch(err => console.error('❌ Error:', err.message));