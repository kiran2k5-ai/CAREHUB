-- Enable RLS and necessary extensions
BEGIN;

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT,
    prescribed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lab_reports table
CREATE TABLE IF NOT EXISTS lab_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    results TEXT NOT NULL,
    normal_range VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical_files table for attachments
CREATE TABLE IF NOT EXISTS medical_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER,
    file_url TEXT,
    description TEXT,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_visit_date ON medical_records(visit_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_medical_record_id ON prescriptions(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_medical_record_id ON lab_reports(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_medical_files_medical_record_id ON medical_files(medical_record_id);

-- Enable Row Level Security
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medical_records
CREATE POLICY "Users can view their own medical records" ON medical_records
    FOR SELECT USING (
        (auth.uid() = patient_id) OR 
        (auth.uid() = doctor_id) OR
        (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'))
    );

CREATE POLICY "Doctors can insert medical records" ON medical_records
    FOR INSERT WITH CHECK (
        (auth.uid() = doctor_id) OR
        (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'))
    );

CREATE POLICY "Doctors can update their medical records" ON medical_records
    FOR UPDATE USING (
        (auth.uid() = doctor_id) OR
        (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'))
    );

-- RLS Policies for prescriptions
CREATE POLICY "Users can view prescriptions from their medical records" ON prescriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM medical_records mr 
            WHERE mr.id = medical_record_id 
            AND (mr.patient_id = auth.uid() OR mr.doctor_id = auth.uid())
        ) OR
        (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'))
    );

CREATE POLICY "Doctors can insert prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM medical_records mr 
            WHERE mr.id = medical_record_id 
            AND mr.doctor_id = auth.uid()
        ) OR
        (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'))
    );

-- RLS Policies for lab_reports
CREATE POLICY "Users can view lab reports from their medical records" ON lab_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM medical_records mr 
            WHERE mr.id = medical_record_id 
            AND (mr.patient_id = auth.uid() OR mr.doctor_id = auth.uid())
        ) OR
        (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'))
    );

CREATE POLICY "Doctors can insert lab reports" ON lab_reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM medical_records mr 
            WHERE mr.id = medical_record_id 
            AND mr.doctor_id = auth.uid()
        ) OR
        (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'))
    );

-- RLS Policies for medical_files
CREATE POLICY "Users can view files from their medical records" ON medical_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM medical_records mr 
            WHERE mr.id = medical_record_id 
            AND (mr.patient_id = auth.uid() OR mr.doctor_id = auth.uid())
        ) OR
        (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'))
    );

CREATE POLICY "Users can insert files to medical records" ON medical_files
    FOR INSERT WITH CHECK (
        (uploaded_by = auth.uid()) OR
        (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'))
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for medical_records
DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Insert some sample data for testing
INSERT INTO medical_records (patient_id, doctor_id, visit_date, diagnosis, notes)
SELECT 
    p.id as patient_id,
    d.id as doctor_id,
    '2024-01-15'::date as visit_date,
    'Annual Health Checkup' as diagnosis,
    'Regular checkup completed. All vital signs normal.' as notes
FROM users p, users d
WHERE p.user_type = 'patient' 
AND d.user_type = 'doctor'
AND p.email = 'patient@example.com'
AND d.email = 'doctor@example.com'
ON CONFLICT DO NOTHING;

-- Get the medical record ID for sample prescriptions
DO $$
DECLARE
    record_id UUID;
BEGIN
    SELECT mr.id INTO record_id
    FROM medical_records mr
    JOIN users p ON mr.patient_id = p.id
    JOIN users d ON mr.doctor_id = d.id
    WHERE p.email = 'patient@example.com'
    AND d.email = 'doctor@example.com'
    LIMIT 1;
    
    IF record_id IS NOT NULL THEN
        -- Insert sample prescriptions
        INSERT INTO prescriptions (medical_record_id, medication_name, dosage, frequency, duration, instructions)
        VALUES 
            (record_id, 'Vitamin D3', '1000 IU', 'Once daily', '30 days', 'Take with meals'),
            (record_id, 'Multivitamin', '1 tablet', 'Once daily', '30 days', 'Take in the morning')
        ON CONFLICT DO NOTHING;
        
        -- Insert sample lab reports
        INSERT INTO lab_reports (medical_record_id, test_name, test_date, results, normal_range, notes)
        VALUES 
            (record_id, 'Complete Blood Count', '2024-01-15', 'Normal', 'Within normal limits', 'All parameters normal'),
            (record_id, 'Blood Pressure', '2024-01-15', '120/80 mmHg', '90-120/60-80 mmHg', 'Optimal blood pressure')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;