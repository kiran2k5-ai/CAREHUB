-- ========================================
-- ADD MEDICAL RECORD FOR PATIENT 9042222856
-- ========================================

-- Step 1: Get the patient ID for phone number 9042222856
-- Query to find the patient
SELECT id, name, phone FROM users 
WHERE phone = '9042222856' AND user_type = 'PATIENT';

-- Step 2: Insert Medical Record
-- Replace PATIENT_ID_HERE with the actual patient ID from Step 1
INSERT INTO medical_records (
  patient_id,
  doctor_id,
  visit_date,
  visit_time,
  diagnosis,
  examination_notes,
  temperature,
  blood_pressure,
  pulse_rate,
  weight,
  height
) VALUES (
  'PATIENT_ID_HERE',  -- Replace with actual patient ID from Step 1
  '550e8400-e29b-41d4-a716-446655440001',  -- Doctor ID
  '2026-03-14',  -- Today's date
  '10:00',
  'Annual Health Checkup',
  'Patient is in good health. Continue current lifestyle.',
  98.6,
  '120/80',
  72,
  70.5,
  175
)
RETURNING id;

-- Step 3: Add Prescriptions
-- Replace MEDICAL_RECORD_ID_HERE with the ID returned from Step 2
INSERT INTO prescriptions (
  medical_record_id,
  medication_name,
  dosage,
  frequency,
  duration,
  instructions,
  quantity,
  refills
) VALUES 
  (
    'MEDICAL_RECORD_ID_HERE',
    'Vitamin D3',
    '1000 IU',
    'Once daily',
    '30 days',
    'Take with meals',
    30,
    2
  ),
  (
    'MEDICAL_RECORD_ID_HERE',
    'Aspirin',
    '100 mg',
    'Once daily',
    '30 days',
    'Take with food',
    30,
    0
  );

-- Step 4: Add Lab Reports
-- Replace MEDICAL_RECORD_ID_HERE with the ID returned from Step 2
INSERT INTO lab_reports (
  medical_record_id,
  test_name,
  test_date,
  result_value,
  normal_range,
  status,
  lab_name,
  notes,
  is_critical
) VALUES 
  (
    'MEDICAL_RECORD_ID_HERE',
    'Complete Blood Count (CBC)',
    '2026-03-14',
    'Normal',
    'Within normal limits',
    'Normal',
    'Central Diagnostic Lab',
    'All parameters normal',
    false
  ),
  (
    'MEDICAL_RECORD_ID_HERE',
    'Lipid Profile',
    '2026-03-14',
    '180 mg/dL',
    '<200 mg/dL',
    'Normal',
    'Central Diagnostic Lab',
    'Cholesterol within normal range',
    false
  );

-- Step 5: Verify the data was inserted
SELECT * FROM medical_records 
WHERE patient_id = 'PATIENT_ID_HERE'
ORDER BY created_at DESC
LIMIT 1;
