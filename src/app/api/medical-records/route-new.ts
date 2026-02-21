import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET medical records for a patient using proper medical_records table
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    console.log('📋 Fetching medical records for patient:', patientId);

    // Get medical records with related prescriptions and lab reports
    const { data: medicalRecords, error } = await supabaseAdmin
      .from('medical_records')
      .select(`
        *,
        doctor:users!medical_records_doctor_id_fkey(name, phone, email),
        patient:users!medical_records_patient_id_fkey(name, phone, email),
        prescriptions(*),
        lab_reports(*)
      `)
      .eq('patient_id', patientId)
      .order('visit_date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching medical records:', error);
      return NextResponse.json({ error: 'Failed to fetch medical records' }, { status: 500 });
    }

    console.log(`✅ Found ${medicalRecords?.length || 0} medical records`);

    return NextResponse.json({
      success: true,
      data: medicalRecords || [],
      count: medicalRecords?.length || 0
    });

  } catch (error) {
    console.error('❌ Error in medical records API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new medical record with proper normalized structure
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Received medical record data:', JSON.stringify(body, null, 2));
    
    const {
      patient_id,
      doctor_id,
      patientId,
      doctorId,
      appointment_id,
      appointmentId,
      visit_date,
      visitDate,
      visit_time,
      visitTime,
      chief_complaint,
      chiefComplaint,
      diagnosis,
      symptoms,
      vital_signs,
      vitalSigns,
      examination_notes,
      examinationNotes,
      notes,
      treatment_plan,
      treatmentPlan,
      follow_up_date,
      followUpDate,
      prescriptions,
      lab_reports,
      labReports
    } = body;

    // Handle both camelCase and snake_case
    const finalPatientId = patient_id || patientId;
    const finalDoctorId = doctor_id || doctorId;
    const finalAppointmentId = appointment_id || appointmentId;
    const finalVisitDate = visit_date || visitDate || new Date().toISOString().split('T')[0];
    const finalVisitTime = visit_time || visitTime;
    const finalChiefComplaint = chief_complaint || chiefComplaint;
    const finalVitalSigns = vital_signs || vitalSigns || {};
    const finalExaminationNotes = examination_notes || examinationNotes || notes;
    const finalTreatmentPlan = treatment_plan || treatmentPlan;
    const finalFollowUpDate = follow_up_date || followUpDate;
    const finalPrescriptions = prescriptions || [];
    const finalLabReports = lab_reports || labReports || [];

    if (!finalPatientId || !finalDoctorId || !diagnosis) {
      console.error('❌ Missing required fields:', { 
        patientId: finalPatientId, 
        doctorId: finalDoctorId, 
        diagnosis: !!diagnosis
      });
      return NextResponse.json({ 
        error: 'Patient ID, Doctor ID, and diagnosis are required'
      }, { status: 400 });
    }

    console.log('📝 Creating new medical record for patient:', finalPatientId, 'by doctor:', finalDoctorId);

    // 1. Create main medical record
    const { data: medicalRecord, error: recordError } = await supabaseAdmin
      .from('medical_records')
      .insert([{
        patient_id: finalPatientId,
        doctor_id: finalDoctorId,
        appointment_id: finalAppointmentId,
        visit_date: finalVisitDate,
        visit_time: finalVisitTime,
        chief_complaint: finalChiefComplaint,
        diagnosis: diagnosis,
        symptoms: symptoms || [],
        vital_signs: finalVitalSigns,
        examination_notes: finalExaminationNotes,
        treatment_plan: finalTreatmentPlan,
        follow_up_date: finalFollowUpDate
      }])
      .select()
      .single();

    if (recordError) {
      console.error('❌ Error creating medical record:', recordError);
      return NextResponse.json({ 
        error: 'Failed to create medical record',
        details: recordError.message 
      }, { status: 500 });
    }

    console.log('✅ Medical record created:', medicalRecord.id);

    // 2. Add prescriptions if provided
    if (finalPrescriptions && finalPrescriptions.length > 0) {
      const prescriptionData = finalPrescriptions
        .filter((rx: any) => rx.medication_name?.trim()) // Only insert non-empty prescriptions
        .map((prescription: any) => ({
          medical_record_id: medicalRecord.id,
          medication_name: prescription.medication_name,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration,
          instructions: prescription.instructions,
          quantity: prescription.quantity,
          refills: prescription.refills || 0
        }));

      if (prescriptionData.length > 0) {
        const { error: prescriptionError } = await supabaseAdmin
          .from('prescriptions')
          .insert(prescriptionData);

        if (prescriptionError) {
          console.error('❌ Error creating prescriptions:', prescriptionError);
        } else {
          console.log(`✅ Created ${prescriptionData.length} prescriptions`);
        }
      }
    }

    // 3. Add lab reports if provided
    if (finalLabReports && finalLabReports.length > 0) {
      const labReportData = finalLabReports
        .filter((report: any) => report.test_name?.trim()) // Only insert non-empty reports
        .map((report: any) => ({
          medical_record_id: medicalRecord.id,
          test_name: report.test_name,
          test_type: report.test_type,
          result_value: report.results || report.result_value,
          normal_range: report.normal_range,
          unit: report.unit,
          status: report.status || 'completed',
          test_date: report.test_date,
          lab_name: report.lab_name,
          notes: report.notes
        }));

      if (labReportData.length > 0) {
        const { error: labError } = await supabaseAdmin
          .from('lab_reports')
          .insert(labReportData);

        if (labError) {
          console.error('❌ Error creating lab reports:', labError);
        } else {
          console.log(`✅ Created ${labReportData.length} lab reports`);
        }
      }
    }

    // 4. Fetch the complete record with relations
    const { data: completeRecord, error: fetchError } = await supabaseAdmin
      .from('medical_records')
      .select(`
        *,
        doctor:users!medical_records_doctor_id_fkey(name, phone, email),
        patient:users!medical_records_patient_id_fkey(name, phone, email),
        prescriptions(*),
        lab_reports(*)
      `)
      .eq('id', medicalRecord.id)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching complete record:', fetchError);
    }

    console.log('✅ Medical record created successfully with all related data');

    return NextResponse.json({
      success: true,
      data: completeRecord || medicalRecord,
      message: 'Medical record created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating medical record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}