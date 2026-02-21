-- Comprehensive fix for appointment booking system
-- This creates the missing 'doctors' table and fixes the database structure

-- 1. Create the 'doctors' table that the code expects
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    specialization VARCHAR NOT NULL,
    experience VARCHAR NOT NULL,
    consultation_fee INTEGER NOT NULL,
    rating DECIMAL(3,2) DEFAULT 4.5,
    phone VARCHAR,
    image VARCHAR,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Ensure users table has the test patient
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
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert sample doctors into the new doctors table
INSERT INTO doctors (
    id, 
    name, 
    specialization, 
    experience, 
    consultation_fee, 
    rating, 
    phone, 
    image,
    is_available
) VALUES 
-- Original doctor from schema
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Dr. Prakash Das',
    'Psychologist',
    '8 years',
    500,
    4.8,
    '9876543210',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    true
),
-- New doctors with proper UUIDs
(
    'b8f7c123-9d45-4e67-8f91-234567890abc',
    'Dr. Sarah Johnson',
    'Cardiologist',
    '12 years',
    800,
    4.9,
    '9123456789',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    true
),
(
    'c9e8d234-ae56-4f78-9a02-345678901bcd',
    'Dr. Michael Chen',
    'Dermatologist',
    '10 years',
    600,
    4.7,
    '9234567890',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    true
),
(
    'd1f9e345-bf67-4a89-aa13-456789012cde',
    'Dr. Emily Rodriguez',
    'Pediatrician',
    '15 years',
    700,
    4.8,
    '9345678901',
    'https://images.unsplash.com/photo-1594824804732-ca8db0c3db66?w=150&h=150&fit=crop&crop=face',
    true
),
(
    'e2a0f456-ca78-5b90-bb24-567890123def',
    'Dr. David Wilson',
    'Orthopedic Surgeon',
    '18 years',
    1000,
    4.9,
    '9456789012',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
    true
),
(
    'f3b1a567-db89-4c01-ac35-678901234efa',
    'Dr. Lisa Park',
    'Gynecologist',
    '14 years',
    750,
    4.8,
    '9567890123',
    'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=150&h=150&fit=crop&crop=face',
    true
),
(
    'a4c2b678-ec90-4d12-bd46-789012345fab',
    'Dr. Ahmed Hassan',
    'Neurologist',
    '16 years',
    900,
    4.9,
    '9678901234',
    'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&h=150&fit=crop&crop=face',
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    specialization = EXCLUDED.specialization,
    experience = EXCLUDED.experience,
    consultation_fee = EXCLUDED.consultation_fee,
    rating = EXCLUDED.rating,
    phone = EXCLUDED.phone,
    image = EXCLUDED.image,
    is_available = EXCLUDED.is_available;

-- 4. Fix appointments table to use simple date format instead of timestamp
-- First, check if appointments table exists and has the right structure
DO $$
BEGIN
    -- Check if date column is timestamp and convert to date string
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' 
        AND column_name = 'date' 
        AND data_type = 'timestamp with time zone'
    ) THEN
        -- Add a new date_string column temporarily
        ALTER TABLE appointments ADD COLUMN IF NOT EXISTS date_string VARCHAR;
        
        -- Update existing records to use simple date format
        UPDATE appointments SET date_string = date::date::text WHERE date_string IS NULL;
        
        -- Drop the old timestamp column and rename the new one
        ALTER TABLE appointments DROP COLUMN date;
        ALTER TABLE appointments RENAME COLUMN date_string TO date;
    END IF;
END $$;

-- 5. Ensure appointments table has the right structure for the code
ALTER TABLE appointments 
    ALTER COLUMN date TYPE VARCHAR USING date::text;

-- 6. Verify the setup
SELECT 'Users count:' as info, count(*) as count FROM users;
SELECT 'Doctors count:' as info, count(*) as count FROM doctors;
SELECT 'Appointments count:' as info, count(*) as count FROM appointments;
SELECT 'Test patient exists:' as info, count(*) as count FROM users WHERE id = '7f8e3607-a428-4241-aa3f-10a071f584fa';

-- 7. Show sample data
SELECT 'Sample users:' as info;
SELECT id, name, phone, user_type FROM users LIMIT 3;

SELECT 'Sample doctors:' as info;
SELECT id, name, specialization, consultation_fee, is_available FROM doctors LIMIT 3;