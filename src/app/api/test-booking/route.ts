import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// Test endpoint to create a sample appointment and verify it shows in doctor's appointments
export async function POST(request: NextRequest) {
  try {
    const { doctorId, patientId } = await request.json();

    // Create test appointment
    const testAppointmentData = {
      patient_id: patientId || 'patient_9042222856',
      doctor_id: doctorId || 'demo',
      date: new Date().toISOString().split('T')[0], // Today
      time: '2:30 PM',
      consultation_type: 'IN_PERSON',
      consultation_fee: 500,
      reason: 'Test booking via API'
    };

    console.log('Creating test appointment:', testAppointmentData);

    // Create the appointment
    const newAppointment = await DatabaseService.createAppointment(testAppointmentData);
    
    if (!newAppointment) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create appointment'
      }, { status: 500 });
    }

    // Fetch the doctor's appointments to verify
    const doctorAppointments = await DatabaseService.getAppointmentsByDoctorId(doctorId || 'demo');

    return NextResponse.json({
      success: true,
      data: {
        newAppointment,
        doctorAppointments: doctorAppointments?.length || 0,
        message: 'Test appointment created successfully! Check doctor appointments page.'
      }
    });

  } catch (error) {
    console.error('Error creating test appointment:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create test appointment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method to fetch test data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId') || 'demo';

    // Get all appointments for this doctor
    const appointments = await DatabaseService.getAppointmentsByDoctorId(doctorId);

    return NextResponse.json({
      success: true,
      data: {
        doctorId,
        appointmentCount: appointments?.length || 0,
        appointments: appointments?.map(apt => ({
          id: apt.id,
          patientId: apt.patient_id,
          patientName: apt.users?.name || 'Unknown',
          date: apt.date,
          time: apt.time,
          status: apt.status,
          consultationType: apt.consultation_type,
          reason: apt.reason
        })) || []
      },
      message: 'Doctor appointments fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching test data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch test data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}