-- Doctor Booking System Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (both patients and doctors)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    user_type VARCHAR(10) CHECK (user_type IN ('PATIENT', 'DOCTOR')) DEFAULT 'PATIENT',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Doctor profiles table
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255) NOT NULL,
    experience VARCHAR(100) NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    qualifications TEXT,
    languages TEXT,
    working_hours VARCHAR(255) DEFAULT '9:00 AM - 6:00 PM',
    about TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patient profiles table
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    gender VARCHAR(10),
    address TEXT,
    emergency_contact VARCHAR(15),
    blood_group VARCHAR(5),
    allergies TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    consultation_type VARCHAR(20) CHECK (consultation_type IN ('IN_PERSON', 'VIDEO')) DEFAULT 'IN_PERSON',
    consultation_fee DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')) DEFAULT 'SCHEDULED',
    reason TEXT,
    notes TEXT,
    prescription TEXT,
    diagnosis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) CHECK (type IN ('APPOINTMENT_BOOKING', 'APPOINTMENT_REMINDER', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'GENERAL', 'SYSTEM')) DEFAULT 'GENERAL',
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Time slots table
CREATE TABLE IF NOT EXISTS time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_profile_id UUID REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    slot_type VARCHAR(10) CHECK (slot_type IN ('MORNING', 'AFTERNOON', 'EVENING')) DEFAULT 'MORNING',
    duration INTEGER DEFAULT 30, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_time_slots_doctor_profile_id ON time_slots(doctor_profile_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON patient_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON time_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO users (phone, name, user_type, email) VALUES 
('9876543210', 'Dr. Prakash Das', 'DOCTOR', 'dr.prakash@demo.com'),
('9042222856', 'Demo Patient', 'PATIENT', 'patient@demo.com')
ON CONFLICT (phone) DO NOTHING;

-- Get the user IDs for sample data
DO $$
DECLARE
    doctor_user_id UUID;
    patient_user_id UUID;
    doctor_profile_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO doctor_user_id FROM users WHERE phone = '9876543210';
    SELECT id INTO patient_user_id FROM users WHERE phone = '9042222856';
    
    -- Insert doctor profile
    INSERT INTO doctor_profiles (
        user_id, specialization, experience, consultation_fee, 
        qualifications, working_hours, about, rating, review_count
    ) VALUES (
        doctor_user_id, 'Psychologist', '8 years', 500.00,
        'MBBS, MD Psychology, PhD Clinical Psychology',
        '10:00 AM - 7:00 PM',
        'Experienced psychologist specializing in cognitive behavioral therapy, anxiety disorders, and depression treatment.',
        4.8, 127
    ) ON CONFLICT DO NOTHING
    RETURNING id INTO doctor_profile_id;
    
    -- Insert patient profile
    INSERT INTO patient_profiles (user_id, age, gender) 
    VALUES (patient_user_id, 30, 'Male')
    ON CONFLICT DO NOTHING;
    
    -- Insert sample appointment
    INSERT INTO appointments (
        patient_id, doctor_id, date, time, 
        consultation_type, consultation_fee, status, reason
    ) VALUES (
        patient_user_id, doctor_user_id, 
        CURRENT_DATE + INTERVAL '1 day', '10:00',
        'IN_PERSON', 500.00, 'SCHEDULED', 'General consultation'
    ) ON CONFLICT DO NOTHING;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, you can restrict later)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON doctor_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON patient_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON time_slots FOR ALL USING (true);