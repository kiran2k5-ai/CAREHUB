import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;

    const { data: patient, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        created_at,
        user_type,
        profiles:profiles(age)
      `)
      .eq('id', patientId)
      .eq('user_type', 'patient')
      .single();

    if (error) {
      console.error('Error fetching patient:', error);
      return NextResponse.json({
        success: false,
        error: 'Patient not found'
      }, { status: 404 });
    }

    // Transform the data to include age from profiles
    const transformedPatient = {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: Array.isArray(patient.profiles) && patient.profiles.length > 0 ? patient.profiles[0]?.age : null,
      created_at: patient.created_at,
      user_type: patient.user_type
    };

    return NextResponse.json({
      success: true,
      data: transformedPatient
    });

  } catch (error) {
    console.error('Unexpected error in patient API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}