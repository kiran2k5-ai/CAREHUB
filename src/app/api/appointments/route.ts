import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { getAppointmentsWithRetry, testSupabaseConnection, supabaseWithRetry } from '@/lib/supabaseWithRetry'
import { getFallbackAppointments } from '@/lib/fallbackData'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get('patientId')
    const doctorId = searchParams.get('doctorId')
    const userType = searchParams.get('userType')
    const userId = searchParams.get('userId')

    console.log('📊 Fetching appointments from database:', { patientId, doctorId, userType, userId })

    // Handle generic userId parameter
    const actualUserId = userId || patientId || doctorId;
    
    if (!actualUserId) {
      return NextResponse.json({ 
        error: 'User ID is required'
      }, { status: 400 });
    }

    console.log(`🔍 Looking for user with ID: ${actualUserId}`);

    // Test connection first - but be graceful if env vars aren't set
    try {
      const connectionTest = await testSupabaseConnection();
      if (!connectionTest.connected) {
        console.error('❌ Supabase connection failed, returning fallback appointments');
        
        // Return fallback appointments for the patient
        if (patientId) {
          const fallbackData = getFallbackAppointments(patientId);
          return NextResponse.json({
            success: true,
            data: fallbackData,
            count: fallbackData.length,
            message: 'Using demo data - database temporarily unavailable',
            fallback: true
          });
        }
        
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'Service temporarily unavailable',
          fallback: true
        });
      }
    } catch (connectionError) {
      console.error('❌ Connection test failed, using fallback data immediately');
      
      // Return fallback appointments for the patient
      if (patientId) {
        const fallbackData = getFallbackAppointments(patientId);
        return NextResponse.json({
          success: true,
          data: fallbackData,
          count: fallbackData.length,
          message: 'Using demo data - database not configured',
          fallback: true
        });
      }
      
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'Demo mode - database not configured',
        fallback: true
      });
    }

    // Simplified user lookup for new database
    let user = null;
    let doctorProfile = null;
    
    try {
      // Special handling for doctorId parameter
      if (doctorId && doctorId.includes('-')) {
        console.log(`🩺 Looking up doctor profile for ID: ${doctorId}`);
        
        // Try to find doctor in doctors table first
        const { data: doctorData, error: doctorError } = await supabaseAdmin
          .from('doctors')
          .select('*')
          .eq('id', doctorId)
          .single();
        
        if (!doctorError && doctorData) {
          doctorProfile = doctorData;
          console.log(`✅ Found doctor: ${doctorData.name || doctorData.full_name}`);
          
          // For doctor appointments, we'll use the doctor profile directly
          user = {
            id: doctorData.id,
            name: doctorData.name || doctorData.full_name,
            user_type: 'DOCTOR',
            phone: doctorData.phone || ''
          };
        }
      }
      
      // If not found as doctor or it's a patient/user lookup
      if (!user && actualUserId.includes('-')) {
        // It's a UUID, look up in users table with retry
        console.log(`🔍 Attempting UUID lookup for: ${actualUserId}`);
        const { data, error } = await supabaseWithRetry(
          async () => {
            const result = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('id', actualUserId)
              .single();
            return result;
          },
          { maxRetries: 3, delayMs: 500 }
        );
        
        console.log(`🔍 UUID lookup raw result:`, { data, error });
        if (!error && data) {
          user = data;
          console.log(`✅ UUID lookup success: Found ${data.name} (${data.user_type})`);
        } else {
          console.log(`❌ UUID lookup failed:`, error);
        }
        console.log(`📋 UUID lookup result:`, user ? `Found ${user.name}` : 'Not found');
      } 
      
      if (!user && !actualUserId.includes('-')) {
        // It's likely a phone number or prefixed ID, clean and search
        const cleanUserId = actualUserId.replace(/^(patient_|doctor_|demo_)/, '');
        console.log(`📱 Searching by phone: ${cleanUserId}`);
        
        const { data, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('phone', cleanUserId)
          .single();
        
        if (!error && data) user = data;
        console.log(`📱 Phone lookup result:`, user ? `Found ${user.name}` : 'Not found');
      }
    } catch (error) {
      console.error('❌ Error finding user:', error);
      return NextResponse.json({ 
        error: 'Database error during user lookup',
        userId: actualUserId,
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        userId: actualUserId
      }, { status: 404 });
    }

    console.log(`👤 Found user: ${user.name} (${user.user_type})`);

    let appointments = [];

    if (user.user_type === 'DOCTOR') {
      // Get appointments for this doctor using simplified query
      const { data: appointments, error } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('doctor_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      console.log(`📅 Found ${appointments?.length || 0} appointments for doctor ${user.name}`);

      // Enhanced formatting with proper patient lookups
      const formattedAppointments = [];
      
      for (const appointment of appointments || []) {
        // Get actual patient information
        let patientInfo = {
          name: 'Unknown Patient',
          phone: '0000000000'
        };

        try {
          // Look up patient by ID
          const { data: patientUser, error: patientError } = await supabaseAdmin
            .from('users')
            .select('name, phone')
            .eq('id', appointment.patient_id)
            .single();

          if (!patientError && patientUser) {
            patientInfo = {
              name: patientUser.name,
              phone: patientUser.phone
            };
          }
        } catch (error) {
          console.warn('Could not fetch patient info for:', appointment.patient_id, error);
        }

        formattedAppointments.push({
          id: appointment.id,
          patientId: appointment.patient_id,
          patientName: patientInfo.name,
          patientPhone: patientInfo.phone,
          date: appointment.date,
          time: appointment.time,
          reason: appointment.reason,
          status: appointment.status,
          consultationType: appointment.consultation_type || 'VIDEO',
          consultationFee: appointment.consultation_fee,
          notes: appointment.notes,
          createdAt: appointment.created_at,
          updatedAt: appointment.updated_at
        });
      }

      return NextResponse.json({
        success: true,
        data: formattedAppointments,
        count: formattedAppointments.length
      });
    } else if (user.user_type === 'PATIENT') {
      // Get appointments for this patient using simplified query
      const { data: appointments, error } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('patient_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      console.log(`📅 Found ${appointments?.length || 0} appointments for patient ${user.name}`);

      // Enhanced formatting with proper doctor lookups
      const formattedAppointments = [];
      
      for (const appointment of appointments || []) {
        // Get actual doctor information
        let doctorInfo = {
          name: 'Unknown Doctor',
          specialization: 'General',
          phone: '0000000000'
        };

        try {
          // Look up doctor by ID
          const { data: doctorProfile, error: doctorError } = await supabaseAdmin
            .from('doctors')
            .select('name, specialization, phone')
            .eq('id', appointment.doctor_id)
            .single();

          if (!doctorError && doctorProfile) {
            doctorInfo = {
              name: doctorProfile.name,
              specialization: doctorProfile.specialization,
              phone: doctorProfile.phone
            };
          } else {
            // Try to get from users table if doctor profile not found
            const { data: doctorUser, error: userError } = await supabaseAdmin
              .from('users')
              .select('name, phone')
              .eq('id', appointment.doctor_id)
              .single();

            if (!userError && doctorUser) {
              doctorInfo.name = doctorUser.name;
              doctorInfo.phone = doctorUser.phone;
            }
          }
        } catch (error) {
          console.warn('Could not fetch doctor info for:', appointment.doctor_id, error);
        }

        formattedAppointments.push({
          id: appointment.id,
          doctorId: appointment.doctor_id,
          doctorName: doctorInfo.name,
          doctorSpecialization: doctorInfo.specialization,
          doctorPhone: doctorInfo.phone,
          date: appointment.date,
          time: appointment.time,
          reason: appointment.reason,
          status: appointment.status,
          consultationType: appointment.consultation_type || 'in-person',
          consultationFee: appointment.consultation_fee,
          notes: appointment.notes,
          createdAt: appointment.created_at,
          updatedAt: appointment.updated_at
        });
      }

      return NextResponse.json({
        success: true,
        data: formattedAppointments,
        count: formattedAppointments.length
      });
    }

    return NextResponse.json({ 
      error: 'Invalid user type'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Error in GET /api/appointments:', error);
    
    // Always return fallback data on any error
    const patientId = request.nextUrl.searchParams.get('patientId');
    if (patientId) {
      const fallbackData = getFallbackAppointments(patientId);
      return NextResponse.json({
        success: true,
        data: fallbackData,
        count: fallbackData.length,
        message: `Fallback appointments due to error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: [],
      count: 0,
      message: 'Error occurred, no appointments available',
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📝 Creating appointment in database:', body)

    const {
      patientId,
      doctorId,
      date,
      time,
      reason,
      consultationType,
      consultationFee
    } = body

    // Validate required fields
    if (!patientId || !doctorId || !date || !time) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['patientId', 'doctorId', 'date', 'time'],
        provided: { patientId, doctorId, date, time }
      }, { status: 400 })
    }

    // Get patient and doctor from database
    let patient = null;
    let doctor = null;

    // Clean IDs to remove prefixes like "patient_" or "doctor_"
    const cleanPatientId = patientId.replace(/^(patient_|doctor_)/, '');
    const cleanDoctorId = doctorId.replace(/^(patient_|doctor_)/, '');

    console.log(`🔍 Looking for patient: ${cleanPatientId}, doctor: ${cleanDoctorId}`);

    try {
      // Try UUID lookup first, then phone lookup for patient
      if (cleanPatientId.includes('-')) {
        // It's a UUID
        const { data, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', cleanPatientId)
          .single();
        
        if (!error) patient = data;
      } else {
        // It's likely a phone number
        const { data, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('phone', cleanPatientId)
          .single();
        
        if (!error) patient = data;
      }
    } catch (error) {
      console.error('❌ Error finding patient:', error);
    }

    try {
      // Try UUID lookup first, then phone lookup for doctor
      if (cleanDoctorId.includes('-')) {
        // It's a UUID
        const { data, error } = await supabaseAdmin
          .from('doctors')
          .select('*')
          .eq('id', cleanDoctorId)
          .single();
        
        if (!error) doctor = data;
      } else {
        // It's likely a phone number, look up in users table first
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('phone', cleanDoctorId)
          .eq('user_type', 'DOCTOR')
          .single();
        
        if (!userError && userData) {
          // Found user, now get doctor profile
          const { data: doctorData, error: doctorError } = await supabaseAdmin
            .from('doctors')
            .select('*')
            .eq('user_id', userData.id)
            .single();
          
          if (!doctorError) doctor = doctorData;
        }
      }
    } catch (error) {
      console.error('❌ Error finding doctor:', error);
    }

    if (!patient || patient.user_type !== 'PATIENT') {
      console.log('❌ Patient not found in database for ID:', patientId);
      return NextResponse.json({ 
        error: 'Patient not found',
        patientId
      }, { status: 404 })
    }

    if (!doctor) {
      console.log('❌ Doctor not found in database for ID:', doctorId);
      return NextResponse.json({ 
        error: 'Doctor not found',
        doctorId
      }, { status: 404 })
    }

    console.log(`✅ Found patient: ${patient.name}, doctor: ${doctor.name || doctor.full_name}`);

    const fee = consultationFee || doctor.consultation_fee || 500;

    // Convert 12-hour time to 24-hour format if needed
    const convertTime = (timeStr: string): string => {
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':');
        let hour24 = parseInt(hours);
        
        if (period === 'PM' && hour24 !== 12) {
          hour24 += 12;
        } else if (period === 'AM' && hour24 === 12) {
          hour24 = 0;
        }
        
        return `${hour24.toString().padStart(2, '0')}:${minutes}`;
      }
      return timeStr; // Already in 24-hour format
    };

    // Create appointment in database
    const appointmentData = {
      id: uuidv4(),
      patient_id: patient.id,
      doctor_id: doctor.id,
      date: date, // Store as simple date string (YYYY-MM-DD)
      time: convertTime(time),
      reason: reason || 'General consultation',
      consultation_type: (consultationType || 'IN_PERSON') as 'IN_PERSON' | 'VIDEO',
      consultation_fee: fee,
      status: 'SCHEDULED' as 'SCHEDULED'
    };

    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();

    if (appointmentError) {
      console.error('❌ Error creating appointment:', appointmentError);
      return NextResponse.json({ 
        error: 'Failed to create appointment',
        details: appointmentError.message
      }, { status: 500 });
    }

    console.log('✅ Appointment created successfully in database:', appointment.id);

    // Format response
    const response = {
      id: appointment.id,
      patientId: patient.id,
      doctorId: doctor.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      doctorName: doctor.name || doctor.full_name || 'Doctor',
      doctorPhone: doctor.phone || '',
      specialization: doctor.specialization || 'General',
      date: appointment.date, // Keep date as-is (should be YYYY-MM-DD)
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
      consultationType: appointment.consultation_type,
      consultationFee: appointment.consultation_fee,
      createdAt: appointment.created_at,
      updatedAt: appointment.updated_at
    };

    return NextResponse.json({ 
      success: true, 
      data: response,
      appointment: response, // Legacy compatibility
      message: 'Appointment booked successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error in POST /api/appointments:', error);
    return NextResponse.json({ 
      error: 'Failed to create appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
