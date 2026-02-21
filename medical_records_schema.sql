-- Medical Records and Prescriptions Schema
-- Add to your existing Supabase database

-- Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    visit_date DATE NOT NULL,
    visit_time TIME,
    chief_complaint TEXT,
    diagnosis TEXT NOT NULL,
    symptoms TEXT[],
    vital_signs JSONB, -- {blood_pressure: "120/80", temperature: "98.6", pulse: "72", weight: "70"}
    examination_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    medication_name VARCHAR NOT NULL,
    dosage VARCHAR NOT NULL,
    frequency VARCHAR NOT NULL,
    duration VARCHAR NOT NULL,
    instructions TEXT,
    quantity INTEGER,
    refills INTEGER DEFAULT 0,
    status VARCHAR DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'DISCONTINUED')),
    prescribed_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lab Reports Table
CREATE TABLE IF NOT EXISTS lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    test_name VARCHAR NOT NULL,
    test_type VARCHAR NOT NULL,
    result_value VARCHAR,
    normal_range VARCHAR,
    unit VARCHAR,
    status VARCHAR DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'HIGH', 'LOW', 'CRITICAL')),
    test_date DATE DEFAULT CURRENT_DATE,
    lab_name VARCHAR,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Medical Files/Attachments Table
CREATE TABLE IF NOT EXISTS medical_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    file_name VARCHAR NOT NULL,
    file_type VARCHAR NOT NULL,
    file_size INTEGER,
    file_url TEXT NOT NULL,
    description TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_visit_date ON medical_records(visit_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_medical_record_id ON prescriptions(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_lab_reports_medical_record_id ON lab_reports(medical_record_id);

-- Row Level Security (RLS) Policies
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_files ENABLE ROW LEVEL SECURITY;

-- Policies for medical_records
CREATE POLICY "Patients can view their own medical records" ON medical_records
    FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view medical records for their patients" ON medical_records
    FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert medical records" ON medical_records
    FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their own medical records" ON medical_records
    FOR UPDATE USING (doctor_id = auth.uid());

-- Policies for prescriptions
CREATE POLICY "Patients can view their prescriptions" ON prescriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM medical_records 
            WHERE medical_records.id = prescriptions.medical_record_id 
            AND medical_records.patient_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can manage prescriptions for their records" ON prescriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM medical_records 
            WHERE medical_records.id = prescriptions.medical_record_id 
            AND medical_records.doctor_id = auth.uid()
        )
    );

-- Insert sample medical record for testing
INSERT INTO medical_records (
    patient_id,
    doctor_id,
    visit_date,
    visit_time,
    chief_complaint,
    diagnosis,
    symptoms,
    vital_signs,
    examination_notes
) 
SELECT 
    p.id as patient_id,
    d.id as doctor_id,
    CURRENT_DATE - INTERVAL '7 days',
    '10:00:00',
    'Regular checkup and health screening',
    'Patient is in good health. Blood pressure slightly elevated.',
    ARRAY['Mild headache', 'Fatigue'],
    '{"blood_pressure": "130/85", "temperature": "98.6", "pulse": "75", "weight": "70", "height": "170"}'::jsonb,
    'Patient appears healthy. Recommending lifestyle changes for blood pressure management.'
FROM users p
CROSS JOIN users d
WHERE p.phone = '9042222856' AND p.user_type = 'PATIENT'
AND d.phone = '9876543210' AND d.user_type = 'DOCTOR'
LIMIT 1;

-- Insert sample prescription
INSERT INTO prescriptions (
    medical_record_id,
    medication_name,
    dosage,
    frequency,
    duration,
    instructions,
    quantity,
    refills
)
SELECT 
    mr.id,
    'Lisinopril',
    '10mg',
    'Once daily',
    '30 days',
    'Take with food in the morning. Monitor blood pressure regularly.',
    30,
    2
FROM medical_records mr
WHERE mr.diagnosis LIKE '%blood pressure%'
LIMIT 1;