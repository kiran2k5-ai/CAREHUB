import { NextRequest, NextResponse } from 'next/server';

// Mock data store (in a real app, this would be a database)
let appointments: any[] = [
  {
    id: '1',
    patientId: 'user123',
    doctorId: '1',
    doctorName: 'Dr. Sarah Johnson',
    doctorSpecialization: 'General Medicine',
    date: '2025-08-15',
    time: '10:00 AM',
    status: 'confirmed',
    consultationFee: 500,
    consultationType: 'in-person',
    reason: 'Regular checkup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    patientId: 'user123',
    doctorId: '2',
    doctorName: 'Dr. Michael Chen',
    doctorSpecialization: 'Cardiology',
    date: '2025-08-20',
    time: '2:30 PM',
    status: 'pending',
    consultationFee: 800,
    consultationType: 'video',
    reason: 'Heart consultation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    patientId: 'user123',
    doctorId: '3',
    doctorName: 'Dr. Emily Davis',
    doctorSpecialization: 'Dermatology',
    date: '2025-07-15',
    time: '11:00 AM',
    status: 'completed',
    consultationFee: 600,
    consultationType: 'in-person',
    reason: 'Skin condition',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// GET /api/appointments - Get appointments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');
    const status = searchParams.get('status');

    console.log('Fetching appointments for patient:', patientId);

    let filteredAppointments = [...appointments];

    // Filter by patient ID if provided and not undefined
    if (patientId && patientId !== 'undefined') {
      filteredAppointments = filteredAppointments.filter(apt => apt.patientId === patientId);
    } else if (patientId === 'undefined' || !patientId) {
      // If no valid patient ID, return empty array or default appointments
      console.log('No valid patient ID provided, returning default appointments for user123');
      filteredAppointments = filteredAppointments.filter(apt => apt.patientId === 'user123');
    }

    // Filter by doctor ID if provided
    if (doctorId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.doctorId === doctorId);
    }

    // Filter by status if provided
    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status);
    }

    // Sort by date and time (newest first for upcoming, oldest first for past)
    filteredAppointments.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateB.getTime() - dateA.getTime();
    });

    console.log(`Returning ${filteredAppointments.length} appointments`);

    return NextResponse.json({
      success: true,
      data: filteredAppointments,
      total: filteredAppointments.length,
      message: 'Appointments fetched successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch appointments'
    }, { status: 500 });
  }
}

// POST /api/appointments - Book a new appointment
export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json();
    console.log('Received booking request:', appointmentData);
    
    // Validate required fields
    const requiredFields = ['patientId', 'doctorId', 'doctorName', 'doctorSpecialization', 'date', 'time', 'consultationFee'];
    const missingFields = requiredFields.filter(field => {
      const value = appointmentData[field];
      const isMissing = !value || value === '' || value === null || value === undefined;
      if (isMissing) {
        console.log(`Field ${field} is missing or empty:`, value);
      }
      return isMissing;
    });
    
    if (missingFields.length > 0) {
      console.log('Validation failed. Missing fields:', missingFields);
      console.log('Received data keys:', Object.keys(appointmentData));
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        receivedFields: Object.keys(appointmentData),
        missingFields: missingFields
      }, { status: 400 });
    }

    // Check for time slot conflicts
    const existingAppointment = appointments.find(apt => 
      apt.doctorId === appointmentData.doctorId && 
      apt.date === appointmentData.date && 
      apt.time === appointmentData.time &&
      apt.status !== 'cancelled'
    );

    if (existingAppointment) {
      console.log('Slot conflict found:', existingAppointment);
      return NextResponse.json({
        success: false,
        error: 'Slot conflict',
        message: 'This time slot is already booked'
      }, { status: 409 });
    }

    // Generate new appointment
    const newAppointment = {
      id: (appointments.length + 1).toString(),
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      doctorName: appointmentData.doctorName || 'Unknown Doctor',
      doctorSpecialization: appointmentData.doctorSpecialization || 'General Medicine',
      date: appointmentData.date,
      time: appointmentData.time,
      status: 'confirmed',
      consultationFee: appointmentData.consultationFee || 500,
      consultationType: appointmentData.consultationType || 'in-person',
      reason: appointmentData.reason || 'Regular consultation',
      notes: appointmentData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to appointments array
    appointments.push(newAppointment);
    console.log('New appointment created:', newAppointment);

    return NextResponse.json({
      success: true,
      data: newAppointment,
      message: 'Appointment booked successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to book appointment'
    }, { status: 500 });
  }
}
