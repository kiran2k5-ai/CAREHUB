import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET medical records for a patient (using appointments table for now)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    console.log('📋 Fetching medical records for patient:', patientId);

    // Get completed appointments as medical records (only those created via medical records system)
    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        doctor:users!appointments_doctor_id_fkey(name, phone),
        patient:users!appointments_patient_id_fkey(name, phone, email)
      `)
      .eq('patient_id', patientId)
      .eq('status', 'COMPLETED')
      .like('reason', '%Medical Record%')
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching medical records:', error);
      return NextResponse.json({ error: 'Failed to fetch medical records' }, { status: 500 });
    }

    console.log(`✅ Found ${appointments?.length || 0} medical records`);

    return NextResponse.json({
      success: true,
      data: appointments || [],
      count: appointments?.length || 0
    });

  } catch (error) {
    console.error('❌ Error in medical records API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new medical record (store as completed appointment with extended data)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Received medical record data:', JSON.stringify(body, null, 2));
    
    const {
      patient_id,
      doctor_id,
      patientId,
      doctorId,
      visit_date,
      visitDate,
      diagnosis,
      notes,
      prescriptions,
      lab_reports
    } = body;

    // Handle both camelCase and snake_case
    const finalPatientId = patient_id || patientId;
    const finalDoctorId = doctor_id || doctorId;
    const finalVisitDate = visit_date || visitDate || new Date().toISOString().split('T')[0];

    console.log('🔍 Processed IDs:', {
      finalPatientId,
      finalDoctorId,
      diagnosis: diagnosis?.substring(0, 50) + '...'
    });

    if (!finalPatientId || !finalDoctorId || !diagnosis) {
      console.error('❌ Missing required fields:', { 
        patientId: finalPatientId, 
        doctorId: finalDoctorId, 
        diagnosis: !!diagnosis
      });
      return NextResponse.json({ 
        error: 'Patient ID, Doctor ID, and diagnosis are required',
        received: { 
          patient_id, 
          doctor_id, 
          patientId, 
          doctorId, 
          diagnosis: !!diagnosis,
          finalPatientId,
          finalDoctorId
        }
      }, { status: 400 });
    }

    console.log('📝 Creating new medical record for patient:', finalPatientId, 'by doctor:', finalDoctorId);

    // Generate UUID for the appointment/medical record
    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Create medical record as appointment with all data in notes field
    const medicalRecordData = {
      id: generateUUID(),
      patient_id: finalPatientId,
      doctor_id: finalDoctorId,
      date: finalVisitDate,
      time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5),
      consultation_type: 'IN_PERSON',
      consultation_fee: 500,
      status: 'COMPLETED',
      reason: `Medical Record Entry`,
      notes: JSON.stringify({
        type: 'medical_record',
        diagnosis: diagnosis,
        visit_notes: notes,
        prescriptions: prescriptions || [],
        lab_reports: lab_reports || [],
        created_via: 'medical_records_system',
        created_at: new Date().toISOString()
      })
    };

    console.log('💾 Inserting appointment record with medical data...');

    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert([medicalRecordData])
      .select()
      .single();

    if (appointmentError) {
      console.error('❌ Error creating medical record:', appointmentError);
      return NextResponse.json({ 
        error: 'Failed to create medical record',
        details: appointmentError.message 
      }, { status: 500 });
    }

    console.log('✅ Medical record created successfully:', appointment.id);

    return NextResponse.json({
      success: true,
      data: appointment,
      message: 'Medical record created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating medical record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}