-- Quick test to check if the database setup is correct

-- Check if doctors table exists and has data
SELECT 'Doctors table check:' as info;
SELECT COUNT(*) as doctor_count FROM doctors;
SELECT id, name, specialization FROM doctors LIMIT 3;

-- Check if users table has the test patient
SELECT 'Users table check:' as info;
SELECT COUNT(*) as user_count FROM users;
SELECT id, name, phone, user_type FROM users WHERE id = '7f8e3607-a428-4241-aa3f-10a071f584fa';

-- Check if appointments table exists and has data
SELECT 'Appointments table check:' as info;
SELECT COUNT(*) as appointment_count FROM appointments;
SELECT id, patient_id, doctor_id, date, time FROM appointments LIMIT 3;

-- Check appointment data for our test patient
SELECT 'Test patient appointments:' as info;
SELECT COUNT(*) as patient_appointment_count FROM appointments WHERE patient_id = '7f8e3607-a428-4241-aa3f-10a071f584fa';