import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTodayString, getLocalDateString, parseLocalDate, isPastDate } from '@/lib/dateUtils';

// Helper function to generate time slots dynamically
const generateTimeSlots = async (doctorId: string, date: string) => {
  let doctor;
  try {
    // Get doctor from simplified database
    const { data: doctorData, error } = await supabaseAdmin
      .from('doctors')
      .select('*')
      .eq('id', doctorId)
      .single();

    if (error || !doctorData) {
      console.warn('Doctor not found for ID:', doctorId, error);
      return [];
    }

    doctor = {
      id: doctorData.id,
      name: doctorData.name || 'Unknown Doctor',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], // Default
      workingHours: doctorData.working_hours || '9:00 AM - 6:00 PM'
    };
  } catch (error) {
    console.warn('Doctor not found for ID:', doctorId, error);
    return [];
  }

  const slots = [];
  const requestedDate = new Date(date);
  const today = new Date();
  const isToday = requestedDate.toDateString() === today.toDateString();
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();

  // Check if the requested date is a working day for the doctor
  const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });
  if (!doctor.workingDays || !doctor.workingDays.includes(dayName)) {
    console.log('No working day for doctor', doctorId, 'on', dayName);
    return []; // No slots on non-working days
  }

  // Define working hours (9 AM to 6 PM by default)
  const workingStart = 9; // 9 AM
  const workingEnd = 18; // 6 PM
  
  // Get existing appointments for this doctor on this date from database
  let existingAppointments = [];
  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('date', date)
      .neq('status', 'CANCELLED');

    if (!error && appointments) {
      existingAppointments = appointments;
    }
  } catch (error) {
    console.warn('Could not fetch appointments for doctor:', error);
    existingAppointments = [];
  }

  console.log('Existing appointments for doctor', doctorId, 'on', date, ':', existingAppointments);

  let slotId = 1;

  // Generate 30-minute slots
  for (let hour = workingStart; hour < workingEnd; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Skip past time slots for today
      if (isToday && (hour < currentHour || (hour === currentHour && minute <= currentMinute))) {
        continue;
      }

      const timeString = formatTime(hour, minute);
      
      // Check if this slot is already booked
      const isBooked = existingAppointments.some(apt => apt.time === timeString);
      
      // Determine slot type
      let type: 'morning' | 'afternoon' | 'evening';
      if (hour < 12) {
        type = 'morning';
      } else if (hour < 17) {
        type = 'afternoon';
      } else {
        type = 'evening';
      }

      slots.push({
        id: `slot-${doctorId}-${date}-${slotId++}`,
        time: timeString,
        available: !isBooked,
        type,
        date,
        doctorId
      });
    }
  }

  return slots;
};

// Helper function to format time
const formatTime = (hour: number, minute: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
};

// GET /api/doctors/[id]/slots - Get available time slots for a doctor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const doctorId = awaitedParams.id;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getTodayString();

    console.log('Slots API called for doctor:', doctorId, 'date:', date, 'today:', getTodayString());

    // Validate doctor exists using simplified database
    let doctor;
    try {
      const { data: doctorData, error } = await supabaseAdmin
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single();

      if (error || !doctorData) {
        console.log('❌ Doctor not found in database for ID:', doctorId, error);
        return NextResponse.json({
          success: false,
          error: 'Not found',
          message: 'Doctor not found'
        }, { status: 404 });
      }

      doctor = {
        id: doctorData.id,
        name: doctorData.name || 'Unknown Doctor',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], // Default
        workingHours: doctorData.working_hours || '9:00 AM - 6:00 PM'
      };
    } catch (error) {
      console.error('❌ Error fetching doctor from database:', error);
      return NextResponse.json({
        success: false,
        error: 'Not found',
        message: 'Doctor not found'
      }, { status: 404 });
    }

    // Validate date format and ensure it's not in the past
    if (isPastDate(date)) {
      console.log('Rejecting past date:', date, 'Today is:', getTodayString());
      return NextResponse.json({
        success: false,
        error: 'Invalid date',
        message: 'Cannot book appointments for past dates'
      }, { status: 400 });
    }

    // Fetch time slots from database
    console.log('🔍 Fetching time slots from database for doctor:', doctorId, 'date:', date);
    
    const { data: timeSlots, error: slotsError } = await supabaseAdmin
      .from('time_slots')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('date', date)
      .order('time');

    if (slotsError) {
      console.error('❌ Error fetching time slots:', slotsError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to fetch time slots'
      }, { status: 500 });
    }

    console.log(`✅ Found ${timeSlots?.length || 0} time slots in database`);

    // Transform database slots to API format
    const formattedSlots = (timeSlots || []).map(slot => ({
      id: slot.id,
      time: slot.time.substring(0, 5), // Convert "HH:MM:SS" to "HH:MM"
      available: slot.is_available,
      type: slot.slot_type,
      date: slot.date,
      doctorId: slot.doctor_id,
      duration: slot.duration || 30
    }));

    // Group slots by type
    const groupedSlots = {
      morning: formattedSlots.filter(slot => slot.type === 'morning'),
      afternoon: formattedSlots.filter(slot => slot.type === 'afternoon'),
      evening: formattedSlots.filter(slot => slot.type === 'evening')
    };

    const totalSlots = formattedSlots.length;
    const availableSlots = formattedSlots.filter(slot => slot.available).length;

    console.log('Generated slots for doctor', doctorId, 'on', date, ':', {
      totalSlots: totalSlots,
      availableSlots: availableSlots,
      groupedSlots,
      doctor: doctor.name
    }); // Debug log

    const requestedDate = parseLocalDate(date);

    return NextResponse.json({
      success: true,
      data: {
        doctorId,
        doctorName: doctor.name,
        date,
        dayOfWeek: requestedDate.toLocaleDateString('en-US', { weekday: 'long' }),
        slots: groupedSlots,
        total_slots: totalSlots,
        available_slots: availableSlots,
        working_hours: doctor.workingHours,
        is_working_day: totalSlots > 0 // If we have slots, it's a working day
      },
      message: totalSlots > 0 ? `Found ${totalSlots} slots (${availableSlots} available)` : 'No slots available for this date'
    });

  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch time slots'
    }, { status: 500 });
  }
}
