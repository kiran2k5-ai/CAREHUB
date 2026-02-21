-- Proper Medical Records Database Schema
-- Run this in your Supabase SQL editor to create dedicated tables

-- 1. Main Medical Records Table
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    visit_date DATE NOT NULL,
    visit_time TIME,
    chief_complaint TEXT,
    diagnosis TEXT NOT NULL,
    symptoms TEXT[],
    vital_signs JSONB DEFAULT '{}',
    examination_notes TEXT,
    treatment_plan TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Prescriptions Table
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100),
    instructions TEXT,
    quantity INTEGER,
    refills INTEGER DEFAULT 0,
    prescribed_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Lab Reports Table
CREATE TABLE lab_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100),
    result_value TEXT,
    normal_range VARCHAR(100),
    unit VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    test_date DATE NOT NULL,
    lab_name VARCHAR(255),
    notes TEXT,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Indexes for better performance
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_visit_date ON medical_records(visit_date);
CREATE INDEX idx_prescriptions_medical_record_id ON prescriptions(medical_record_id);
CREATE INDEX idx_lab_reports_medical_record_id ON lab_reports(medical_record_id);

-- 5. Sample data migration from appointments (optional)
-- This moves existing medical records from appointments to new tables
INSERT INTO medical_records (patient_id, doctor_id, visit_date, visit_time, diagnosis, examination_notes)
SELECT 
    patient_id,
    doctor_id,
    date::DATE,
    time::TIME,
    COALESCE(
        (notes::jsonb->>'diagnosis')::text,
        'Migrated from appointments'
    ),
    COALESCE(
        (notes::jsonb->>'visit_notes')::text,
        notes
    )
FROM appointments 
WHERE status = 'COMPLETED' 
AND reason LIKE '%Medical Record%'
AND notes IS NOT NULL;