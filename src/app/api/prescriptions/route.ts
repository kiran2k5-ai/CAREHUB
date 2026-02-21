import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET prescriptions for a patient or medical record
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const medicalRecordId = searchParams.get('medicalRecordId');

    if (!patientId && !medicalRecordId) {
      return NextResponse.json({ 
        error: 'Either patient ID or medical record ID is required' 
      }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('prescriptions')
      .select(`
        *,
        medical_record:medical_records(
          visit_date,
          diagnosis,
          doctor:users!medical_records_doctor_id_fkey(name)
        )
      `);

    if (medicalRecordId) {
      query = query.eq('medical_record_id', medicalRecordId);
    } else if (patientId) {
      // For patient prescriptions, we need to join through medical_records
      const { data: medicalRecords, error: mrError } = await supabaseAdmin
        .from('medical_records')
        .select('id')
        .eq('patient_id', patientId);
      
      if (mrError || !medicalRecords) {
        return NextResponse.json({ 
          success: true, 
          data: [], 
          count: 0 
        });
      }
      
      const recordIds = medicalRecords.map(record => record.id);
      if (recordIds.length === 0) {
        return NextResponse.json({ 
          success: true, 
          data: [], 
          count: 0 
        });
      }
      
      query = query.in('medical_record_id', recordIds);
    }

    const { data: prescriptions, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching prescriptions:', error);
      return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: prescriptions || [],
      count: prescriptions?.length || 0
    });

  } catch (error) {
    console.error('❌ Error in prescriptions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add new prescription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      medicalRecordId,
      medicationName,
      dosage,
      frequency,
      duration,
      instructions,
      quantity,
      refills
    } = body;

    if (!medicalRecordId || !medicationName || !dosage || !frequency || !duration) {
      return NextResponse.json({ 
        error: 'Medical record ID, medication name, dosage, frequency, and duration are required' 
      }, { status: 400 });
    }

    const { data: prescription, error } = await supabaseAdmin
      .from('prescriptions')
      .insert([{
        medical_record_id: medicalRecordId,
        medication_name: medicationName,
        dosage: dosage,
        frequency: frequency,
        duration: duration,
        instructions: instructions,
        quantity: quantity,
        refills: refills || 0
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating prescription:', error);
      return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: prescription,
      message: 'Prescription added successfully'
    });

  } catch (error) {
    console.error('❌ Error creating prescription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update prescription status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { prescriptionId, status } = body;

    if (!prescriptionId || !status) {
      return NextResponse.json({ 
        error: 'Prescription ID and status are required' 
      }, { status: 400 });
    }

    const { data: prescription, error } = await supabaseAdmin
      .from('prescriptions')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', prescriptionId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating prescription:', error);
      return NextResponse.json({ error: 'Failed to update prescription' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: prescription,
      message: 'Prescription updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating prescription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}