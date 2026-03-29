-- ========================================
-- QUICK SETUP: MINIMAL MEDICAL RECORDS SCHEMA
-- ========================================
-- Copy and paste this into Supabase SQL Editor
-- Replace the doctor_id with your actual doctor ID (550e8400-e29b-41d4-a716-446655440001)

-- 1. MEDICAL RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  visit_time VARCHAR(5) DEFAULT '10:00',
  diagnosis TEXT NOT NULL,
  examination_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100),
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. LAB REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
  test_name VARCHAR(255) NOT NULL,
  test_date DATE NOT NULL,
  result_value VARCHAR(255),
  normal_range VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Indexes for better performance
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON public.medical_records(doctor_id);
CREATE INDEX idx_prescriptions_medical_record_id ON public.prescriptions(medical_record_id);
CREATE INDEX idx_lab_reports_medical_record_id ON public.lab_reports(medical_record_id);

-- ========================================
-- OPTIONAL: Insert Sample Data
-- ========================================
-- Uncomment and modify the patient_id and doctor_id below to test

INSERT INTO public.medical_records (patient_id, doctor_id, visit_date, visit_time, diagnosis, examination_notes)
VALUES (
  '7f8e3607-a428-4241-aa3f-10a071f584fa',  -- Replace with actual patient UUID
  '550e8400-e29b-41d4-a716-446655440001',  -- Your doctor ID
  '2026-03-14',
  '10:00',
  'Annual Health Checkup',
  'Patient is in good health. No abnormalities found.'
);

-- ========================================
-- VERIFY TABLES WERE CREATED
-- ========================================
SELECT 'medical_records' AS table_name, COUNT(*) AS record_count FROM public.medical_records
UNION ALL
SELECT 'prescriptions', COUNT(*) FROM public.prescriptions
UNION ALL
SELECT 'lab_reports', COUNT(*) FROM public.lab_reports;
