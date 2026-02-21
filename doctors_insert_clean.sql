-- Clean SQL INSERT statements for adding more doctors to the database
-- Run these in your Supabase SQL Editor

-- First, add the missing is_available column to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Insert Dr. Sarah Johnson (Cardiologist)
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
) VALUES (
  'b8f7c123-9d45-4e67-8f91-234567890abc',
  'Dr. Sarah Johnson',
  'Cardiologist',
  '12 years',
  800,
  4.9,
  '9123456789',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
  true
);

-- Insert Dr. Michael Chen (Dermatologist)
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
) VALUES (
  'c9e8d234-ae56-4f78-9a02-345678901bcd',
  'Dr. Michael Chen',
  'Dermatologist',
  '10 years',
  600,
  4.7,
  '9234567890',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
  true
);

-- Insert Dr. Emily Rodriguez (Pediatrician)
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
) VALUES (
  'd1f9e345-bf67-4a89-aa13-456789012cde',
  'Dr. Emily Rodriguez',
  'Pediatrician',
  '15 years',
  700,
  4.8,
  '9345678901',
  'https://images.unsplash.com/photo-1594824804732-ca8db0c3db66?w=150&h=150&fit=crop&crop=face',
  true
);

-- Insert Dr. David Wilson (Orthopedic Surgeon)
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
) VALUES (
  'e2a0f456-ca78-5b90-bb24-567890123def',
  'Dr. David Wilson',
  'Orthopedic Surgeon',
  '18 years',
  1000,
  4.9,
  '9456789012',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
  true
);

-- Insert Dr. Lisa Park (Gynecologist)
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
) VALUES (
  'f3b1a567-db89-4c01-ac35-678901234efa',
  'Dr. Lisa Park',
  'Gynecologist',
  '14 years',
  750,
  4.8,
  '9567890123',
  'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=150&h=150&fit=crop&crop=face',
  true
);

-- Insert Dr. Ahmed Hassan (Neurologist)
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
) VALUES (
  'a4c2b678-ec90-4d12-bd46-789012345fab',
  'Dr. Ahmed Hassan',
  'Neurologist',
  '16 years',
  900,
  4.9,
  '9678901234',
  'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&h=150&fit=crop&crop=face',
  true
);

-- Insert Dr. Maria Santos (Ophthalmologist)
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
) VALUES (
  'b5d3c789-fd01-4e23-ce57-890123456abc',
  'Dr. Maria Santos',
  'Ophthalmologist',
  '11 years',
  650,
  4.7,
  '9789012345',
  'https://images.unsplash.com/photo-1584467735871-8e3827e3b33c?w=150&h=150&fit=crop&crop=face',
  true
);

-- Insert Dr. Robert Kim (ENT Specialist)
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
) VALUES (
  'c6e4d890-ae12-4f34-df68-901234567bcd',
  'Dr. Robert Kim',
  'ENT Specialist',
  '13 years',
  550,
  4.6,
  '9890123456',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face',
  true
);

-- Add the test patient that the system is using
INSERT INTO users (
  id, 
  name, 
  phone, 
  user_type, 
  created_at, 
  updated_at
) VALUES (
  '7f8e3607-a428-4241-aa3f-10a071f584fa',
  'Test Patient',
  '9999999999',
  'PATIENT',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Check all doctors after insertion
SELECT id, name, specialization, experience, consultation_fee, rating, phone, is_available
FROM doctors 
ORDER BY name;

-- Check the patient was added
SELECT id, name, phone, user_type FROM users WHERE id = '7f8e3607-a428-4241-aa3f-10a071f584fa';