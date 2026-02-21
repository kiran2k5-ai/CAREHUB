-- Link Dr. Michael Chen's doctor profile to the phone number 9876543210
-- This will ensure appointments booked with Dr. Chen appear in the doctor dashboard

-- First, let's see the current state
-- SELECT id, phone, name, user_type FROM users WHERE phone = '9876543210';
-- SELECT id, name, specialization FROM doctors WHERE id = 'c9e8d234-ae56-4f78-9a02-345678901bcd';

-- Option 1: Update the user ID to match the doctor profile ID
-- This is the cleanest approach - make the user account UUID match the doctor profile UUID

-- Delete the current user account created with phone 9876543210
DELETE FROM users WHERE phone = '9876543210';

-- Create a new user account with the SAME UUID as Dr. Michael Chen's doctor profile
INSERT INTO users (id, phone, name, email, user_type, is_verified, created_at, updated_at)
VALUES (
  'c9e8d234-ae56-4f78-9a02-345678901bcd',  -- Same UUID as Dr. Michael Chen
  '9876543210',
  'Dr. Michael Chen',
  'michael.chen@carehub.com',
  'DOCTOR',
  true,
  NOW(),
  NOW()
);

-- Verify the link
SELECT 
  u.id as user_id,
  u.phone,
  u.name as user_name,
  u.user_type,
  d.name as doctor_name,
  d.specialization
FROM users u
LEFT JOIN doctors d ON u.id = d.id
WHERE u.phone = '9876543210';

-- Check appointments for this doctor
SELECT 
  a.id,
  a.doctor_id,
  a.patient_id,
  a.date,
  a.time,
  a.status
FROM appointments a
WHERE a.doctor_id = 'c9e8d234-ae56-4f78-9a02-345678901bcd'
ORDER BY a.date, a.time;
