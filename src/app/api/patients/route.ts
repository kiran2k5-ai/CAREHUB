import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  console.log('🔍 Patients API called');
  try {
    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get('doctorId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('📋 API Parameters:', { doctorId, search, limit, offset });

    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        email,
        phone
      `)
      .eq('user_type', 'PATIENT')
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    console.log('🔗 Database query prepared');

    // If doctorId is provided, get patients who have had appointments with this doctor
    // If no doctorId or no appointments found, return all patients
    if (doctorId) {
      const { data: patientIds, error: appointmentError } = await supabaseAdmin
        .from('appointments')
        .select('patient_id')
        .eq('doctor_id', doctorId)
        .not('patient_id', 'is', null);

      // Don't filter if there's an error or no appointments - just return all patients
      if (!appointmentError && patientIds && patientIds.length > 0) {
        const uniquePatientIds = [...new Set(patientIds.map(a => a.patient_id))];
        query = query.in('id', uniquePatientIds);
      }
      // If doctor has no appointments yet, we'll still return all patients
    }

    // Add search functionality
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: patients, error, count } = await query;

    console.log('📊 Database query results:', { 
      patientsCount: patients?.length || 0, 
      error: error?.message || 'none',
      totalCount: count 
    });

    if (error) {
      console.error('❌ Database error details:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch patients',
        details: error.message
      }, { status: 500 });
    }

    // Transform the data (using available columns only)
    const transformedPatients = patients?.map(patient => ({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: null, // Will be added when profiles table is set up
      created_at: new Date().toISOString() // Default timestamp
    })) || [];

    console.log(`📊 Fetched ${transformedPatients.length} patients for doctor ${doctorId || 'all'}`);

    return NextResponse.json({
      success: true,
      data: transformedPatients,
      count: count || 0
    });

  } catch (error) {
    console.error('Unexpected error in patients API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, age, password } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({
        success: false,
        error: 'Name and email are required'
      }, { status: 400 });
    }

    // Create user account
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        name,
        email,
        phone,
        user_type: 'patient',
        password_hash: password ? await hashPassword(password) : null
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating patient:', userError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create patient account'
      }, { status: 500 });
    }

    // Create profile if age is provided
    if (age && user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: user.id,
          age: parseInt(age)
        });

      if (profileError) {
        console.error('Error creating patient profile:', profileError);
        // Don't fail the request if profile creation fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: age ? parseInt(age) : null
      }
    });

  } catch (error) {
    console.error('Unexpected error in patients POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Simple password hashing function (in production, use bcrypt or similar)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}