// Test and create patients for the medical records system
console.log('👥 Testing Patient Database Connection...\n');

// Test data for creating sample patients
const samplePatients = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0123',
    user_type: 'patient'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com', 
    phone: '+1-555-0124',
    user_type: 'patient'
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+1-555-0125', 
    user_type: 'patient'
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '+1-555-0126',
    user_type: 'patient'
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '+1-555-0127',
    user_type: 'patient'
  }
];

console.log('📋 Sample Patients to Create:');
samplePatients.forEach((patient, index) => {
  console.log(`${index + 1}. ${patient.name} (${patient.email})`);
});

console.log('\n🔧 Steps to Fix Patient Loading:');
console.log('');
console.log('1. CHECK DATABASE CONNECTION:');
console.log('   • Go to http://localhost:3000/api/patients');
console.log('   • Should see JSON response with patients list');
console.log('   • If error, check Supabase connection');
console.log('');
console.log('2. CREATE TEST PATIENTS (if database is empty):');
console.log('   • Go to your Supabase dashboard');
console.log('   • Navigate to Table Editor > users');
console.log('   • Add new rows with the sample data above');
console.log('   • Ensure user_type = "patient"');
console.log('');
console.log('3. CREATE TEST DOCTOR (if needed):');
console.log('   • Add a user with user_type = "doctor"');
console.log('   • Example: Dr. Smith (doctor@example.com)');
console.log('');
console.log('4. VERIFY IN MEDICAL RECORDS MANAGER:');
console.log('   • Login as doctor');
console.log('   • Go to Medical Records Manager');
console.log('   • Patients should now appear');
console.log('   • + buttons will be visible after selecting patient');

console.log('\n📊 Database Schema Check:');
console.log('Make sure your users table has these columns:');
console.log('  • id (UUID, primary key)');
console.log('  • name (TEXT)');
console.log('  • email (TEXT)');
console.log('  • phone (TEXT, optional)');
console.log('  • user_type (TEXT: "patient" or "doctor")');
console.log('  • created_at (TIMESTAMP)');

console.log('\n🚀 Quick SQL to Create Test Patients:');
console.log(`
INSERT INTO users (name, email, phone, user_type) VALUES
('John Smith', 'john.smith@example.com', '+1-555-0123', 'patient'),
('Sarah Johnson', 'sarah.johnson@example.com', '+1-555-0124', 'patient'),
('Michael Brown', 'michael.brown@example.com', '+1-555-0125', 'patient'),
('Emily Davis', 'emily.davis@example.com', '+1-555-0126', 'patient'),
('David Wilson', 'david.wilson@example.com', '+1-555-0127', 'patient'),
('Dr. Smith', 'doctor@example.com', '+1-555-9999', 'doctor');
`);

console.log('\n✅ After adding patients, the + buttons will appear when you:');
console.log('   1. Select a patient from the list');
console.log('   2. Look for 4 different + button locations:');
console.log('      • Floating button (bottom-right)'); 
console.log('      • Header button (top-right)');
console.log('      • Patient card button (in selected card)');
console.log('      • Empty state button (when no records)');

console.log('\n🎯 Ready to test! Add the patients and try the system.');