import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get('patientId')
    const doctorId = searchParams.get('doctorId')
    const userType = searchParams.get('userType')
    const userId = searchParams.get('userId')

    console.log('📊 Fetching appointments from new database:', { patientId, doctorId, userType, userId })

    const actualUserId = userId || patientId || doctorId;
    
    if (!actualUserId) {
      return NextResponse.json({ 
        error: 'User ID is required'
      }, { status: 400 });
    }

    console.log(`🔍 Looking for user with ID: ${actualUserId}`);

    // Simple user lookup in new database
    let user = null;
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', actualUserId)
        .single();
      
      if (error) {
        console.error('❌ User lookup error:', error);
        throw error;
      }
      
      user = data;
      console.log(`✅ Found user: ${user.name} (${user.user_type})`);
    } catch (error) {
      console.error('❌ Error finding user:', error);
      return NextResponse.json({ 
        error: 'User not found',
        userId: actualUserId
      }, { status: 404 });
    }

    // Fetch appointments based on user type
    let appointments = [];
    try {
      if (user.user_type === 'PATIENT') {
        // Get patient appointments
        const { data, error } = await supabaseAdmin
          .from('appointments')
          .select('*')
          .eq('patient_id', actualUserId)
          .order('date', { ascending: false });
        
        if (error) throw error;
        appointments = data || [];
        console.log(`📅 Found ${appointments.length} appointments for patient ${user.name}`);
      } else if (user.user_type === 'DOCTOR') {
        // Get doctor appointments
        const { data: doctorProfile } = await supabaseAdmin
          .from('doctors')
          .select('id')
          .eq('user_id', actualUserId)
          .single();
        
        if (doctorProfile) {
          const { data, error } = await supabaseAdmin
            .from('appointments')
            .select('*')
            .eq('doctor_id', doctorProfile.id)
            .order('date', { ascending: false });
          
          if (error) throw error;
          appointments = data || [];
          console.log(`📅 Found ${appointments.length} appointments for doctor ${user.name}`);
        }
      }

      // Format appointments for frontend
      const formattedAppointments = appointments.map(apt => ({
        id: apt.id,
        doctorId: apt.doctor_id,
        patientId: apt.patient_id,
        date: apt.date,
        time: apt.time,
        reason: apt.reason,
        status: apt.status,
        consultationType: apt.consultation_type || 'VIDEO',
        consultationFee: apt.consultation_fee,
        notes: apt.notes,
        createdAt: apt.created_at,
        updatedAt: apt.updated_at,
        // These will be filled in by frontend if needed
        doctorName: 'Loading...',
        doctorSpecialization: '',
        doctorPhone: ''
      }));

      return NextResponse.json({
        success: true,
        data: formattedAppointments,
        count: formattedAppointments.length
      });

    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch appointments',
        details: error.message 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Appointments API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json();
    console.log('📝 Creating new appointment:', appointmentData);

    // Validate required fields
    const { patient_id, doctor_id, date, time, reason, consultation_fee } = appointmentData;
    
    if (!patient_id || !doctor_id || !date || !time || !reason) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['patient_id', 'doctor_id', 'date', 'time', 'reason']
      }, { status: 400 });
    }

    // Insert appointment into new database
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        patient_id,
        doctor_id,
        date,
        time,
        reason,
        consultation_fee: consultation_fee || 500,
        status: 'SCHEDULED',
        consultation_type: appointmentData.consultation_type || 'VIDEO',
        notes: appointmentData.notes || null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating appointment:', error);
      return NextResponse.json({ 
        error: 'Failed to create appointment',
        details: error.message 
      }, { status: 500 });
    }

    console.log('✅ Appointment created successfully:', data.id);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Appointment created successfully'
    });

  } catch (error) {
    console.error('❌ POST appointments error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}