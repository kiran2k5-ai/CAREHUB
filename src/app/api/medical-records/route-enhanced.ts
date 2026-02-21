// Enhanced medical records API that works with appointments table
// But organizes data better and provides table-like structure

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// Types for better TypeScript support
interface PrescriptionInput {
  medicationName?: string;
  medication_name?: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

interface LabReportInput {
  testName?: string;
  test_name?: string;
  resultValue?: string;
  result_value?: string;
  normalRange?: string;
  normal_range?: string;
  testDate?: string;
  test_date?: string;
  notes?: string;
}

// Generate UUID function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Enhanced Medical Record Creation Request:', body);

    const {
      patientId,
      doctorId,
      visitDate,
      visitTime,
      diagnosis,
      examinationNotes,
      prescriptions = [],
      labReports = []
    } = body;

    // Validate required fields
    if (!patientId || !doctorId || !visitDate || !diagnosis) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, doctorId, visitDate, diagnosis' },
        { status: 400 }
      );
    }

    // Create enhanced medical record structure
    const medicalRecordId = generateUUID();
    
    // Structure data like normalized tables but store in appointments
    const enhancedMedicalData = {
      // Main medical record
      medical_record: {
        id: medicalRecordId,
        patient_id: patientId,
        doctor_id: doctorId,
        visit_date: visitDate,
        visit_time: visitTime || '10:00',
        diagnosis: diagnosis,
        examination_notes: examinationNotes || '',
        created_at: new Date().toISOString()
      },
      
      // Prescriptions with IDs
      prescriptions: prescriptions.map((prescription: PrescriptionInput) => ({
        id: generateUUID(),
        medical_record_id: medicalRecordId,
        medication_name: prescription.medicationName || prescription.medication_name,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration || '',
        instructions: prescription.instructions || '',
        created_at: new Date().toISOString()
      })),
      
      // Lab reports with IDs
      lab_reports: labReports.map((report: LabReportInput) => ({
        id: generateUUID(),
        medical_record_id: medicalRecordId,
        test_name: report.testName || report.test_name,
        result_value: report.resultValue || report.result_value || '',
        normal_range: report.normalRange || report.normal_range || '',
        test_date: report.testDate || report.test_date || visitDate,
        notes: report.notes || '',
        created_at: new Date().toISOString()
      })),
      
      // Metadata
      structure_version: '2.0',
      total_prescriptions: prescriptions.length,
      total_lab_reports: labReports.length
    };

    // Insert into appointments table with enhanced structure
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        id: medicalRecordId,
        patient_id: patientId,
        doctor_id: doctorId,
        date: visitDate,
        time: visitTime || '10:00',
        status: 'COMPLETED',
        reason: 'Medical Record Entry - Enhanced',
        notes: JSON.stringify(enhancedMedicalData)
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('❌ Database insertion error:', appointmentError);
      return NextResponse.json(
        { error: 'Failed to save medical record', details: appointmentError.message },
        { status: 500 }
      );
    }

    console.log('✅ Enhanced Medical Record Created:', medicalRecordId);

    return NextResponse.json({
      success: true,
      message: 'Enhanced medical record created successfully',
      data: {
        medical_record_id: medicalRecordId,
        appointment_id: appointmentData.id,
        structure: enhancedMedicalData,
        stats: {
          prescriptions_count: prescriptions.length,
          lab_reports_count: labReports.length,
          created_at: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Enhanced Medical Record Creation Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('📋 Fetching Enhanced Medical Records:', { patientId, doctorId, limit });

    // Build query
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('status', 'COMPLETED')
      .like('reason', '%Medical Record%')
      .order('date', { ascending: false })
      .limit(limit);

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error('❌ Failed to fetch medical records:', error);
      return NextResponse.json(
        { error: 'Failed to fetch medical records', details: error.message },
        { status: 500 }
      );
    }

    // Transform appointments back to structured medical records
    const medicalRecords = appointments.map(appointment => {
      try {
        const medicalData = JSON.parse(appointment.notes);
        
        // Handle both old and new format
        if (medicalData.structure_version === '2.0') {
          // New enhanced format
          return {
            id: appointment.id,
            ...medicalData.medical_record,
            prescriptions: medicalData.prescriptions,
            lab_reports: medicalData.lab_reports,
            metadata: {
              structure_version: medicalData.structure_version,
              total_prescriptions: medicalData.total_prescriptions,
              total_lab_reports: medicalData.total_lab_reports
            }
          };
        } else {
          // Old format - convert to new structure
          return {
            id: appointment.id,
            patient_id: appointment.patient_id,
            doctor_id: appointment.doctor_id,
            visit_date: appointment.date,
            visit_time: appointment.time,
            diagnosis: medicalData.diagnosis || 'No diagnosis',
            examination_notes: medicalData.examinationNotes || '',
            prescriptions: medicalData.prescriptions || [],
            lab_reports: medicalData.lab_reports || [],
            metadata: {
              structure_version: '1.0',
              total_prescriptions: (medicalData.prescriptions || []).length,
              total_lab_reports: (medicalData.lab_reports || []).length
            }
          };
        }
      } catch (parseError) {
        console.error('❌ Error parsing medical record:', parseError);
        return {
          id: appointment.id,
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          visit_date: appointment.date,
          visit_time: appointment.time,
          diagnosis: 'Parse error',
          examination_notes: appointment.notes,
          prescriptions: [],
          lab_reports: [],
          metadata: {
            structure_version: 'legacy',
            parse_error: true
          }
        };
      }
    });

    console.log(`✅ Retrieved ${medicalRecords.length} enhanced medical records`);

    return NextResponse.json({
      success: true,
      data: medicalRecords,
      count: medicalRecords.length,
      query_params: { patientId, doctorId, limit }
    });

  } catch (error) {
    console.error('❌ GET Medical Records Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}