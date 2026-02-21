-- Supabase SQL Schema for Dynamic Doctor Booking System
-- Run this in your Supabase SQL Editor

-- Create ENUM types
CREATE TYPE user_type AS ENUM ('PATIENT', 'DOCTOR');
CREATE TYPE consultation_type AS ENUM ('IN_PERSON', 'VIDEO');
CREATE TYPE appointment_status AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');
CREATE TYPE slot_type AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');
CREATE TYPE notification_type AS ENUM ('APPOINTMENT_BOOKING', 'APPOINTMENT_REMINDER', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'GENERAL', 'SYSTEM');

-- Users table (both patients and doctors)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR UNIQUE NOT NULL,
    name VARCHAR,
    email VARCHAR,
    user_type user_type DEFAULT 'PATIENT',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Patient profiles
CREATE TABLE patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    gender VARCHAR,
    address TEXT,
    emergency_contact VARCHAR,
    blood_group VARCHAR,
    allergies TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Doctor profiles
CREATE TABLE doctor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR NOT NULL,
    experience VARCHAR NOT NULL,
    consultation_fee INTEGER NOT NULL,
    qualifications TEXT,
    languages TEXT,
    working_hours VARCHAR NOT NULL,
    about TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    image VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    time VARCHAR NOT NULL,
    consultation_type consultation_type DEFAULT 'IN_PERSON',
    consultation_fee INTEGER NOT NULL,
    status appointment_status DEFAULT 'SCHEDULED',
    reason TEXT,
    notes TEXT,
    prescription TEXT,
    diagnosis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Prescriptions
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Doctor availability
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time VARCHAR NOT NULL,
    end_time VARCHAR NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Time slots for wave scheduling
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    time VARCHAR NOT NULL,
    is_available BOOLEAN DEFAULT true,
    slot_type slot_type DEFAULT 'MORNING',
    duration INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(doctor_profile_id, date, time)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'GENERAL',
    is_read BOOLEAN DEFAULT false,
    metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Real-time booking updates tracking
CREATE TABLE booking_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL,
    appointment_id UUID NOT NULL,
    update_type VARCHAR NOT NULL,
    patient_name VARCHAR NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    time VARCHAR NOT NULL,
    metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_time_slots_doctor_profile_id ON time_slots(doctor_profile_id);
CREATE INDEX idx_time_slots_date ON time_slots(date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Insert sample data
INSERT INTO users (id, phone, name, email, user_type, is_verified) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '+919876543210', 'Dr. Prakash Das', 'prakash.das@hospital.com', 'DOCTOR', true),
    ('550e8400-e29b-41d4-a716-446655440002', '+919876543211', 'Dr. Priya Sharma', 'priya.sharma@hospital.com', 'DOCTOR', true),
    ('550e8400-e29b-41d4-a716-446655440003', '+919876543212', 'John Doe', 'john.doe@email.com', 'PATIENT', true);

INSERT INTO doctor_profiles (user_id, specialization, experience, consultation_fee, qualifications, languages, working_hours, about, rating, review_count, is_available) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Psychologist', '8 years', 500, '["MBBS", "MD Psychology"]', '["English", "Hindi"]', '9:00 AM - 7:00 PM', 'Experienced psychologist specializing in cognitive behavioral therapy.', 4.8, 127, true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Cardiologist', '12 years', 800, '["MBBS", "MD Cardiology", "DM Interventional"]', '["English", "Hindi", "Marathi"]', '10:00 AM - 6:00 PM', 'Senior cardiologist with expertise in interventional cardiology.', 4.9, 89, true);

INSERT INTO patient_profiles (user_id, age, gender, blood_group) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', 28, 'Male', 'O+');

-- Create sample time slots for doctors
INSERT INTO time_slots (doctor_profile_id, date, time, is_available, slot_type) 
SELECT 
    dp.id,
    CURRENT_DATE + INTERVAL '1 day' * generate_series(1, 7),
    time_slot,
    true,
    CASE 
        WHEN time_slot < '12:00' THEN 'MORNING'::slot_type
        WHEN time_slot < '17:00' THEN 'AFTERNOON'::slot_type
        ELSE 'EVENING'::slot_type
    END
FROM doctor_profiles dp
CROSS JOIN (
    SELECT (CURRENT_TIME + INTERVAL '1 hour' * generate_series(9, 17))::TIME as time_slot
) times
WHERE dp.is_available = true;