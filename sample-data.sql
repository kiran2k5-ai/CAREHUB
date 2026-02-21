-- Sample Data for Doctor Booking System
-- Run this after the main schema to populate with demo data

-- Insert sample users (doctors and patients)
INSERT INTO users (phone, name, user_type, email, is_verified) VALUES 
-- Doctors
('9876543210', 'Dr. Prakash Das', 'DOCTOR', 'dr.prakash@demo.com', true),
('9876543211', 'Dr. Sarah Wilson', 'DOCTOR', 'dr.sarah@demo.com', true),
('9876543212', 'Dr. Michael Chen', 'DOCTOR', 'dr.michael@demo.com', true),
('9876543213', 'Dr. Emily Rodriguez', 'DOCTOR', 'dr.emily@demo.com', true),
('9876543214', 'Dr. James Park', 'DOCTOR', 'dr.james@demo.com', true),
('9876543215', 'Dr. Lisa Thompson', 'DOCTOR', 'dr.lisa@demo.com', true),

-- Patients  
('9042222856', 'Demo Patient', 'PATIENT', 'patient@demo.com', true),
('9042222857', 'John Smith', 'PATIENT', 'john.smith@demo.com', true),
('9042222858', 'Mary Johnson', 'PATIENT', 'mary.johnson@demo.com', true),
('9042222859', 'David Brown', 'PATIENT', 'david.brown@demo.com', true),
('1234567890', 'Test Patient', 'PATIENT', 'test.patient@demo.com', true),
('1111111111', 'Alice Wilson', 'PATIENT', 'alice.wilson@demo.com', true)

ON CONFLICT (phone) DO UPDATE SET 
name = EXCLUDED.name,
email = EXCLUDED.email,
is_verified = EXCLUDED.is_verified;

-- Insert doctor profiles with detailed information
DO $$
DECLARE
    user_rec RECORD;
    profile_id UUID;
BEGIN
    -- Dr. Prakash Das - Psychologist
    SELECT id INTO user_rec FROM users WHERE phone = '9876543210';
    INSERT INTO doctor_profiles (
        user_id, specialization, experience, consultation_fee, 
        qualifications, languages, working_hours, about, rating, review_count, is_available
    ) VALUES (
        user_rec.id, 'Psychologist', '8 years', 500.00,
        'MBBS, MD Psychology, PhD Clinical Psychology',
        'English, Hindi',
        '10:00 AM - 7:00 PM',
        'Dr. Prakash Das is a highly experienced psychologist with over 8 years of practice. He specializes in cognitive behavioral therapy, anxiety disorders, and depression treatment.',
        4.8, 127, true
    ) ON CONFLICT (user_id) DO UPDATE SET
        specialization = EXCLUDED.specialization,
        experience = EXCLUDED.experience,
        consultation_fee = EXCLUDED.consultation_fee,
        qualifications = EXCLUDED.qualifications,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;

    -- Dr. Sarah Wilson - Cardiologist
    SELECT id INTO user_rec FROM users WHERE phone = '9876543211';
    INSERT INTO doctor_profiles (
        user_id, specialization, experience, consultation_fee, 
        qualifications, languages, working_hours, about, rating, review_count, is_available
    ) VALUES (
        user_rec.id, 'Cardiologist', '12 years', 800.00,
        'MBBS, MD Cardiology, Fellowship in Interventional Cardiology',
        'English, Hindi, Marathi',
        '11:00 AM - 6:00 PM',
        'Dr. Sarah Wilson is a renowned cardiologist with expertise in interventional cardiology and heart disease prevention.',
        4.9, 234, true
    ) ON CONFLICT (user_id) DO UPDATE SET
        specialization = EXCLUDED.specialization,
        experience = EXCLUDED.experience,
        consultation_fee = EXCLUDED.consultation_fee,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;

    -- Dr. Michael Chen - Dermatologist
    SELECT id INTO user_rec FROM users WHERE phone = '9876543212';
    INSERT INTO doctor_profiles (
        user_id, specialization, experience, consultation_fee, 
        qualifications, languages, working_hours, about, rating, review_count, is_available
    ) VALUES (
        user_rec.id, 'Dermatologist', '10 years', 600.00,
        'MBBS, MD Dermatology, Fellowship in Cosmetic Dermatology',
        'English, Hindi, Kannada',
        '9:30 AM - 5:30 PM',
        'Dr. Michael Chen specializes in both medical and cosmetic dermatology with extensive experience in treating skin conditions.',
        4.7, 189, true
    ) ON CONFLICT (user_id) DO UPDATE SET
        specialization = EXCLUDED.specialization,
        experience = EXCLUDED.experience,
        consultation_fee = EXCLUDED.consultation_fee,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;

    -- Dr. Emily Rodriguez - Pediatrician
    SELECT id INTO user_rec FROM users WHERE phone = '9876543213';
    INSERT INTO doctor_profiles (
        user_id, specialization, experience, consultation_fee, 
        qualifications, languages, working_hours, about, rating, review_count, is_available
    ) VALUES (
        user_rec.id, 'Pediatrician', '15 years', 450.00,
        'MBBS, MD Pediatrics, Fellowship in Pediatric Cardiology',
        'English, Hindi, Spanish',
        '8:00 AM - 4:00 PM',
        'Dr. Emily Rodriguez is a dedicated pediatrician with special interest in pediatric cardiology.',
        4.9, 312, true
    ) ON CONFLICT (user_id) DO UPDATE SET
        specialization = EXCLUDED.specialization,
        experience = EXCLUDED.experience,
        consultation_fee = EXCLUDED.consultation_fee,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;

    -- Dr. James Park - Orthopedic
    SELECT id INTO user_rec FROM users WHERE phone = '9876543214';
    INSERT INTO doctor_profiles (
        user_id, specialization, experience, consultation_fee, 
        qualifications, languages, working_hours, about, rating, review_count, is_available
    ) VALUES (
        user_rec.id, 'Orthopedic', '18 years', 750.00,
        'MBBS, MS Orthopedics, Fellowship in Joint Replacement',
        'English, Hindi, Marathi',
        '10:00 AM - 6:00 PM',
        'Dr. James Park is an expert orthopedic surgeon specializing in joint replacement and sports medicine.',
        4.8, 267, false
    ) ON CONFLICT (user_id) DO UPDATE SET
        specialization = EXCLUDED.specialization,
        experience = EXCLUDED.experience,
        consultation_fee = EXCLUDED.consultation_fee,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;

    -- Dr. Lisa Thompson - Gynecologist
    SELECT id INTO user_rec FROM users WHERE phone = '9876543215';
    INSERT INTO doctor_profiles (
        user_id, specialization, experience, consultation_fee, 
        qualifications, languages, working_hours, about, rating, review_count, is_available
    ) VALUES (
        user_rec.id, 'Gynecologist', '14 years', 650.00,
        'MBBS, MD Gynecology & Obstetrics, Fellowship in Laparoscopy',
        'English, Hindi, Tamil',
        '9:00 AM - 5:00 PM',
        'Dr. Lisa Thompson is a skilled gynecologist with expertise in minimally invasive procedures.',
        4.9, 198, true
    ) ON CONFLICT (user_id) DO UPDATE SET
        specialization = EXCLUDED.specialization,
        experience = EXCLUDED.experience,
        consultation_fee = EXCLUDED.consultation_fee,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;
END $$;

-- Insert patient profiles
DO $$
DECLARE
    user_rec RECORD;
BEGIN
    -- Demo Patient
    SELECT id INTO user_rec FROM users WHERE phone = '9042222856';
    INSERT INTO patient_profiles (user_id, age, gender, blood_group) 
    VALUES (user_rec.id, 28, 'Male', 'O+')
    ON CONFLICT (user_id) DO UPDATE SET age = EXCLUDED.age, gender = EXCLUDED.gender;

    -- John Smith
    SELECT id INTO user_rec FROM users WHERE phone = '9042222857';
    INSERT INTO patient_profiles (user_id, age, gender, blood_group) 
    VALUES (user_rec.id, 35, 'Male', 'A+')
    ON CONFLICT (user_id) DO UPDATE SET age = EXCLUDED.age, gender = EXCLUDED.gender;

    -- Mary Johnson
    SELECT id INTO user_rec FROM users WHERE phone = '9042222858';
    INSERT INTO patient_profiles (user_id, age, gender, blood_group) 
    VALUES (user_rec.id, 29, 'Female', 'B+')
    ON CONFLICT (user_id) DO UPDATE SET age = EXCLUDED.age, gender = EXCLUDED.gender;

    -- David Brown
    SELECT id INTO user_rec FROM users WHERE phone = '9042222859';
    INSERT INTO patient_profiles (user_id, age, gender, blood_group) 
    VALUES (user_rec.id, 42, 'Male', 'AB+')
    ON CONFLICT (user_id) DO UPDATE SET age = EXCLUDED.age, gender = EXCLUDED.gender;

    -- Test Patient
    SELECT id INTO user_rec FROM users WHERE phone = '1234567890';
    INSERT INTO patient_profiles (user_id, age, gender, blood_group) 
    VALUES (user_rec.id, 25, 'Female', 'O-')
    ON CONFLICT (user_id) DO UPDATE SET age = EXCLUDED.age, gender = EXCLUDED.gender;

    -- Alice Wilson
    SELECT id INTO user_rec FROM users WHERE phone = '1111111111';
    INSERT INTO patient_profiles (user_id, age, gender, blood_group) 
    VALUES (user_rec.id, 31, 'Female', 'A-')
    ON CONFLICT (user_id) DO UPDATE SET age = EXCLUDED.age, gender = EXCLUDED.gender;
END $$;

-- Insert sample appointments
DO $$
DECLARE
    patient_user_id UUID;
    doctor_user_id UUID;
BEGIN
    -- Appointment 1: Demo Patient with Dr. Prakash Das (today)
    SELECT id INTO patient_user_id FROM users WHERE phone = '9042222856';
    SELECT id INTO doctor_user_id FROM users WHERE phone = '9876543210';
    INSERT INTO appointments (
        patient_id, doctor_id, date, time, 
        consultation_type, consultation_fee, status, reason
    ) VALUES (
        patient_user_id, doctor_user_id, 
        CURRENT_DATE, '10:00',
        'IN_PERSON', 500.00, 'SCHEDULED', 'General psychological consultation'
    );

    -- Appointment 2: Demo Patient with Dr. Sarah Wilson (tomorrow)
    SELECT id INTO doctor_user_id FROM users WHERE phone = '9876543211';
    INSERT INTO appointments (
        patient_id, doctor_id, date, time, 
        consultation_type, consultation_fee, status, reason
    ) VALUES (
        patient_user_id, doctor_user_id, 
        CURRENT_DATE + INTERVAL '1 day', '14:30',
        'VIDEO', 800.00, 'SCHEDULED', 'Heart checkup consultation'
    );

    -- Appointment 3: John Smith with Dr. Michael Chen (future)
    SELECT id INTO patient_user_id FROM users WHERE phone = '9042222857';
    SELECT id INTO doctor_user_id FROM users WHERE phone = '9876543212';
    INSERT INTO appointments (
        patient_id, doctor_id, date, time, 
        consultation_type, consultation_fee, status, reason
    ) VALUES (
        patient_user_id, doctor_user_id, 
        CURRENT_DATE + INTERVAL '2 days', '11:00',
        'IN_PERSON', 600.00, 'SCHEDULED', 'Skin allergy consultation'
    );

    -- Appointment 4: Mary Johnson with Dr. Lisa Thompson (completed)
    SELECT id INTO patient_user_id FROM users WHERE phone = '9042222858';
    SELECT id INTO doctor_user_id FROM users WHERE phone = '9876543215';
    INSERT INTO appointments (
        patient_id, doctor_id, date, time, 
        consultation_type, consultation_fee, status, reason, diagnosis, prescription
    ) VALUES (
        patient_user_id, doctor_user_id, 
        CURRENT_DATE - INTERVAL '2 days', '15:00',
        'IN_PERSON', 650.00, 'COMPLETED', 'Regular checkup',
        'Normal routine examination, all parameters within range',
        'Continue current medications, follow up in 6 months'
    );

    -- Appointment 5: Test Patient with Dr. Emily Rodriguez (cancelled)
    SELECT id INTO patient_user_id FROM users WHERE phone = '1234567890';
    SELECT id INTO doctor_user_id FROM users WHERE phone = '9876543213';
    INSERT INTO appointments (
        patient_id, doctor_id, date, time, 
        consultation_type, consultation_fee, status, reason
    ) VALUES (
        patient_user_id, doctor_user_id, 
        CURRENT_DATE + INTERVAL '3 days', '09:30',
        'VIDEO', 450.00, 'CANCELLED', 'Child vaccination consultation'
    );
END $$;

-- Insert sample notifications
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Notification for Demo Patient
    SELECT id INTO user_id FROM users WHERE phone = '9042222856';
    INSERT INTO notifications (user_id, title, message, type) VALUES
    (user_id, 'Appointment Confirmed', 'Your appointment with Dr. Prakash Das has been confirmed for today at 10:00 AM', 'APPOINTMENT_BOOKING'),
    (user_id, 'Appointment Reminder', 'Reminder: You have an appointment tomorrow at 2:30 PM with Dr. Sarah Wilson', 'APPOINTMENT_REMINDER');

    -- Notification for Dr. Prakash Das
    SELECT id INTO user_id FROM users WHERE phone = '9876543210';
    INSERT INTO notifications (user_id, title, message, type) VALUES
    (user_id, 'New Appointment', 'New appointment booked by Demo Patient for today at 10:00 AM', 'APPOINTMENT_BOOKING'),
    (user_id, 'Patient Update', 'Patient Demo Patient has updated their profile information', 'GENERAL');
END $$;

-- Display summary of inserted data
SELECT 
    'Users' as table_name, 
    COUNT(*) as total_records,
    COUNT(CASE WHEN user_type = 'DOCTOR' THEN 1 END) as doctors,
    COUNT(CASE WHEN user_type = 'PATIENT' THEN 1 END) as patients
FROM users
UNION ALL
SELECT 'Doctor Profiles' as table_name, COUNT(*) as total_records, 0, 0 FROM doctor_profiles
UNION ALL  
SELECT 'Patient Profiles' as table_name, COUNT(*) as total_records, 0, 0 FROM patient_profiles
UNION ALL
SELECT 'Appointments' as table_name, COUNT(*) as total_records, 0, 0 FROM appointments
UNION ALL
SELECT 'Notifications' as table_name, COUNT(*) as total_records, 0, 0 FROM notifications;