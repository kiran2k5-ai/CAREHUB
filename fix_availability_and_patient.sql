-- Add missing is_available column to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Update all existing doctors to be available
UPDATE doctors SET is_available = true WHERE is_available IS NULL;

-- Add the missing test patient
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

-- Verify the changes
SELECT 'Doctors with availability' as info, count(*) as count FROM doctors WHERE is_available IS NOT NULL;
SELECT 'Test patient exists' as info, count(*) as count FROM users WHERE id = '7f8e3607-a428-4241-aa3f-10a071f584fa';