-- ========================================
-- MEDICAL RECORDS SYSTEM SCHEMA
-- ========================================
-- Create tables for medical records, prescriptions, and lab reports

-- 1. MEDICAL RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  visit_time VARCHAR(5) DEFAULT '10:00',
  diagnosis TEXT NOT NULL,
  examination_notes TEXT,
  temperature DECIMAL(5, 2),
  blood_pressure VARCHAR(10),
  pulse_rate INTEGER,
  weight DECIMAL(5, 2),
  height DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON public.medical_records(doctor_id);
CREATE INDEX idx_medical_records_visit_date ON public.medical_records(visit_date);

-- ========================================
-- 2. PRESCRIPTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100),
  instructions TEXT,
  quantity INTEGER,
  refills INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_prescriptions_medical_record_id ON public.prescriptions(medical_record_id);
CREATE INDEX idx_prescriptions_is_active ON public.prescriptions(is_active);

-- ========================================
-- 3. LAB REPORTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
  test_name VARCHAR(255) NOT NULL,
  test_date DATE NOT NULL,
  result_value VARCHAR(255),
  normal_range VARCHAR(255),
  status VARCHAR(50),
  lab_name VARCHAR(255),
  notes TEXT,
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_lab_reports_medical_record_id ON public.lab_reports(medical_record_id);
CREATE INDEX idx_lab_reports_test_date ON public.lab_reports(test_date);
CREATE INDEX idx_lab_reports_is_critical ON public.lab_reports(is_critical);

-- ========================================
-- 4. VITAL_SIGNS TABLE (Optional - for tracking vitals over time)
-- ========================================
CREATE TABLE IF NOT EXISTS public.vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  temperature DECIMAL(5, 2),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  pulse_rate INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation DECIMAL(5, 2),
  weight DECIMAL(5, 2),
  height DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_vital_signs_patient_id ON public.vital_signs(patient_id);
CREATE INDEX idx_vital_signs_medical_record_id ON public.vital_signs(medical_record_id);
CREATE INDEX idx_vital_signs_recorded_at ON public.vital_signs(recorded_at);

-- ========================================
-- 5. ALLERGIES TABLE (Optional)
-- ========================================
CREATE TABLE IF NOT EXISTS public.allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  allergen_name VARCHAR(255) NOT NULL,
  reaction_type VARCHAR(100),
  severity VARCHAR(50),
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_allergies_patient_id ON public.allergies(patient_id);

-- ========================================
-- SAMPLE DATA (Optional - for testing)
-- ========================================
-- Insert sample medical record
-- INSERT INTO public.medical_records (patient_id, doctor_id, visit_date, visit_time, diagnosis, examination_notes)
-- VALUES (
--   '7f8e3607-a428-4241-aa3f-10a071f584fa',  -- Sample patient ID
--   '550e8400-e29b-41d4-a716-446655440001',  -- Your doctor ID
--   '2026-03-14',
--   '10:00',
--   'Annual Health Checkup',
--   'Patient is in good health. Continue current lifestyle.'
-- );

-- ========================================
-- VIEWS FOR EASY QUERYING
-- ========================================
-- Create a view to get medical records with patient and doctor names
CREATE OR REPLACE VIEW public.medical_records_with_names AS
SELECT 
  mr.id,
  mr.patient_id,
  p.name AS patient_name,
  p.phone AS patient_phone,
  mr.doctor_id,
  d.name AS doctor_name,
  d.specialization AS doctor_specialization,
  mr.visit_date,
  mr.visit_time,
  mr.diagnosis,
  mr.examination_notes,
  mr.created_at,
  mr.updated_at
FROM public.medical_records mr
LEFT JOIN public.users p ON mr.patient_id = p.id
LEFT JOIN public.doctors d ON mr.doctor_id = d.id;

-- Create a view to get prescriptions with medical record details
CREATE OR REPLACE VIEW public.prescriptions_with_details AS
SELECT 
  p.*,
  mr.visit_date,
  mr.diagnosis,
  d.name AS doctor_name
FROM public.prescriptions p
LEFT JOIN public.medical_records mr ON p.medical_record_id = mr.id
LEFT JOIN public.doctors d ON mr.doctor_id = d.id;

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================
-- Enable RLS on all tables
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;

-- Policies for medical_records
CREATE POLICY "Patients can view own medical records"
  ON public.medical_records FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient medical records"
  ON public.medical_records FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create medical records for patients"
  ON public.medical_records FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update medical records they created"
  ON public.medical_records FOR UPDATE
  USING (auth.uid() = doctor_id);

-- Policies for prescriptions
CREATE POLICY "Patients can view own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (
    medical_record_id IN (
      SELECT id FROM public.medical_records WHERE patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view and manage prescriptions"
  ON public.prescriptions FOR ALL
  USING (
    medical_record_id IN (
      SELECT id FROM public.medical_records WHERE doctor_id = auth.uid()
    )
  );

-- Policies for lab_reports
CREATE POLICY "Patients can view own lab reports"
  ON public.lab_reports FOR SELECT
  USING (
    medical_record_id IN (
      SELECT id FROM public.medical_records WHERE patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can manage lab reports"
  ON public.lab_reports FOR ALL
  USING (
    medical_record_id IN (
      SELECT id FROM public.medical_records WHERE doctor_id = auth.uid()
    )
  );

-- Policies for allergies
CREATE POLICY "Patients can view own allergies"
  ON public.allergies FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient allergies"
  ON public.allergies FOR SELECT
  USING (
    patient_id IN (
      SELECT patient_id FROM public.medical_records WHERE doctor_id = auth.uid()
    )
  );

-- Policies for vital_signs
CREATE POLICY "Patients can view own vital signs"
  ON public.vital_signs FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient vital signs"
  ON public.vital_signs FOR SELECT
  USING (
    patient_id IN (
      SELECT patient_id FROM public.medical_records WHERE doctor_id = auth.uid()
    )
  );

-- ========================================
-- END OF SCHEMA CREATION
-- ========================================
