# Medical Records Database Setup Guide

## Overview
This guide walks you through creating the medical records, prescriptions, and lab reports tables for the CAREHUB system.

## Quick Start (Recommended) - 5 Minutes

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project: https://app.supabase.com
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy Minimal Schema
Copy the entire contents of `medical_records_quick_setup.sql` and paste into the SQL editor.

### Step 3: Run the Query
1. Click the **Run** button (or Ctrl+Enter)
2. You should see success messages for table creation
3. The verification query will show you have created 3 tables

### Step 4: Verify Success
Check the **Table Editor** in Supabase and confirm you see:
- ✅ `medical_records` table
- ✅ `prescriptions` table  
- ✅ `lab_reports` table

---

## Tables Created

### 1. **medical_records** (Main Medical Record)
Stores the primary medical record for each patient visit.

**Fields:**
- `id` (UUID) - Primary key
- `patient_id` (UUID) - Reference to patient in users table
- `doctor_id` (UUID) - Reference to doctor in users table
- `visit_date` (DATE) - Date of the visit (e.g., 2026-03-14)
- `visit_time` (VARCHAR) - Time of visit (e.g., 10:00)
- `diagnosis` (TEXT) - **REQUIRED** - Main diagnosis
- `examination_notes` (TEXT) - Doctor's notes during examination
- `created_at` (TIMESTAMP) - Auto-set on record creation
- `updated_at` (TIMESTAMP) - Auto-updated on changes

**Example Data:**
```json
{
  "patient_id": "7f8e3607-a428-4241-aa3f-10a071f584fa",
  "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "visit_date": "2026-03-14",
  "visit_time": "10:00",
  "diagnosis": "Annual Health Checkup",
  "examination_notes": "Patient in good health"
}
```

---

### 2. **prescriptions** (Medications)
Stores medications prescribed for a medical record.

**Fields:**
- `id` (UUID) - Primary key
- `medical_record_id` (UUID) - **REQUIRED** - Links to medical_records table
- `medication_name` (VARCHAR) - **REQUIRED** - Name of medication (e.g., "Aspirin")
- `dosage` (VARCHAR) - **REQUIRED** - Dosage (e.g., "500mg")
- `frequency` (VARCHAR) - **REQUIRED** - How often (e.g., "Twice daily")
- `duration` (VARCHAR) - How long to take (e.g., "30 days")
- `instructions` (TEXT) - Special instructions (e.g., "Take with food")
- `created_at` (TIMESTAMP) - Auto-set on creation
- `updated_at` (TIMESTAMP) - Auto-updated on changes

**Example Data:**
```json
{
  "medical_record_id": "[UUID from medical_records]",
  "medication_name": "Vitamin D3",
  "dosage": "1000 IU",
  "frequency": "Once daily",
  "duration": "30 days",
  "instructions": "Take with meals"
}
```

---

### 3. **lab_reports** (Test Results)
Stores laboratory test results linked to a medical record.

**Fields:**
- `id` (UUID) - Primary key
- `medical_record_id` (UUID) - **REQUIRED** - Links to medical_records table
- `test_name` (VARCHAR) - **REQUIRED** - Name of test (e.g., "Blood Pressure")
- `test_date` (DATE) - Date the test was performed
- `result_value` (VARCHAR) - The actual test result (e.g., "120/80")
- `normal_range` (VARCHAR) - Normal range for reference (e.g., "90-120")
- `notes` (TEXT) - Additional notes about the result
- `created_at` (TIMESTAMP) - Auto-set on creation
- `updated_at` (TIMESTAMP) - Auto-updated on changes

**Example Data:**
```json
{
  "medical_record_id": "[UUID from medical_records]",
  "test_name": "Blood Pressure",
  "test_date": "2026-03-14",
  "result_value": "120/80",
  "normal_range": "90-120",
  "notes": "Normal"
}
```

---

## How to Test

### Test 1: Create a Medical Record via API
```bash
curl -X POST http://localhost:3000/api/medical-records \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "7f8e3607-a428-4241-aa3f-10a071f584fa",
    "doctorId": "550e8400-e29b-41d4-a716-446655440001",
    "visitDate": "2026-03-14",
    "visitTime": "10:00",
    "diagnosis": "Annual Checkup",
    "examinationNotes": "Patient in good health",
    "prescriptions": [
      {
        "medicationName": "Vitamin D3",
        "dosage": "1000 IU",
        "frequency": "Once daily",
        "duration": "30 days",
        "instructions": "Take with meals"
      }
    ]
  }'
```

### Test 2: View in Supabase UI
1. Go to **Table Editor** in Supabase
2. Select **medical_records** table
3. You should see your created record
4. Click on it to expand and see related prescriptions

### Test 3: Use Frontend UI
1. Go to Doctor Dashboard in CAREHUB
2. Navigate to **Patient Management** or **Medical Records**
3. Click "Add Medical Record"
4. Fill in the form and submit
5. The record will be stored in the database

---

## Troubleshooting

### Issue: Foreign key constraint failed
**Cause:** Patient or doctor ID doesn't exist in users table
**Solution:** Use valid patient_id and doctor_id from your users table

**Find valid IDs:**
```sql
SELECT id, phone, name, user_type FROM public.users LIMIT 10;
```

### Issue: Tables already exist
**Cause:** Tables were previously created
**Solution:** This is fine! The SQL uses `IF NOT EXISTS`, so it won't error

### Issue: Permission denied
**Cause:** Your Supabase role doesn't have permission
**Solution:** 
1. Use a role with full admin access
2. Or contact your Supabase admin

---

## Advanced Setup (With Complex Schema)

If you need additional fields like vital signs, allergies, etc., use the full schema file:

**File:** `create_medical_records_db.sql`

This includes:
- Vital signs tracking
- Allergies management
- Lab reports with criticality flags
- Row-level security policies
- Views for easy querying

Copy and paste the entire contents into Supabase SQL Editor and run.

---

## Data Relationships

```
medical_records (1 record per visit)
├── prescriptions (multiple per record)
├── lab_reports (multiple per record)
└── Links to:
    ├── users (patient_id)
    └── users (doctor_id) → doctors.user_id
```

---

## API Endpoints Ready to Use

Once tables are created, these endpoints work automatically:

- **POST** `/api/medical-records` - Create new medical record
- **GET** `/api/medical-records?patientId=[id]` - Get patient's records
- **GET** `/api/prescriptions?patientId=[id]` - Get prescriptions
- **GET** `/api/prescriptions?medicalRecordId=[id]` - Get prescriptions for a record
- **GET** `/api/lab-reports?medicalRecordId=[id]` - Get lab reports

---

## Notes

- **Your Doctor ID:** `550e8400-e29b-41d4-a716-446655440001`
- **Sample Patient ID:** `7f8e3607-a428-4241-aa3f-10a071f584fa` (if exists)
- Use `public.users` table to find real IDs

---

## Next Steps

1. ✅ Create tables using quick setup SQL
2. ✅ Test with sample data in Supabase UI
3. ✅ Use the frontend to add medical records
4. ✅ View records on doctor/patient dashboards

Happy coding! 🚀
