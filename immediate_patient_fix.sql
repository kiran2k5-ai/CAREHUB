-- IMMEDIATE FIX: Ensure test patient exists in database
-- Run this in Supabase SQL Editor RIGHT NOW

-- 1. Add the test patient (safe - won't create duplicates)
INSERT INTO users (
    id, 
    name, 
    phone, 
    user_type
) VALUES (
    '7f8e3607-a428-4241-aa3f-10a071f584fa',
    'Test Patient',
    '9999999999',
    'PATIENT'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    user_type = EXCLUDED.user_type;

-- 2. Verify the patient exists
SELECT 'Test patient verification:' as info;
SELECT id, name, phone, user_type FROM users WHERE id = '7f8e3607-a428-4241-aa3f-10a071f584fa';

-- 3. Check how many appointments exist for this patient
SELECT 'Appointments for test patient:' as info;
SELECT COUNT(*) as appointment_count FROM appointments WHERE patient_id = '7f8e3607-a428-4241-aa3f-10a071f584fa';

-- 4. Show sample appointments if they exist
SELECT 'Sample appointments:' as info;
SELECT id, doctor_id, date, time, status FROM appointments 
WHERE patient_id = '7f8e3607-a428-4241-aa3f-10a071f584fa' 
ORDER BY date DESC 
LIMIT 3;