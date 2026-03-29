import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getTodayString, getLocalDateString, parseLocalDate, isPastDate } from '@/lib/dateUtils';

type TimeSlotRecord = {
  id: string;
  date: string;
  time: string;
  is_available: boolean;
  slot_type: string | null;
  duration: number | null;
  doctor_id?: string;
  doctor_profile_id?: string;
};

// Helper function to generate time slots dynamically
const generateTimeSlots = async (doctorId: string, date: string) => {
  const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
      workingDays: Array.isArray(doctorData.working_days) && doctorData.working_days.length > 0
        ? doctorData.working_days
        : allDays,
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
    const { data: appointments, error } = await supabaseAdmin
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
      const isBooked = existingAppointments.some(apt => normalizeTime(apt.time) === timeString);
      
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
  const displayHour = hour.toString().padStart(2, '0');
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute}`;
};

const toUtcDayRange = (date: string) => {
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const nextDay = new Date(dayStart);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  return {
    from: dayStart.toISOString(),
    to: nextDay.toISOString()
  };
};

const normalizeTime = (time: string | null | undefined): string => {
  if (!time) return '';
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return time.slice(0, 5);

  const hour = match[1].padStart(2, '0');
  const minute = match[2];
  return `${hour}:${minute}`;
};

const normalizeSlotType = (slotType: string | null | undefined, time: string): 'morning' | 'afternoon' | 'evening' => {
  const normalized = (slotType || '').toLowerCase();

  if (normalized.includes('morning')) return 'morning';
  if (normalized.includes('afternoon')) return 'afternoon';
  if (normalized.includes('evening')) return 'evening';

  const normalizedTime = normalizeTime(time);
  const [hourStr] = normalizedTime.split(':');
  const hour = Number(hourStr);

  if (!Number.isFinite(hour)) return 'morning';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const querySlotsByColumn = async (
  doctorColumn: 'doctor_id' | 'doctor_profile_id',
  doctorValue: string,
  date: string
) => {
  const exactQuery = await supabaseAdmin
    .from('time_slots')
    .select('*')
    .eq(doctorColumn, doctorValue)
    .eq('date', date)
    .order('time');

  if (!exactQuery.error && exactQuery.data && exactQuery.data.length > 0) {
    return exactQuery;
  }

  const datePrefixQuery = await supabaseAdmin
    .from('time_slots')
    .select('*')
    .eq(doctorColumn, doctorValue)
    .like('date', `${date}%`)
    .order('time');

  if (!datePrefixQuery.error && datePrefixQuery.data && datePrefixQuery.data.length > 0) {
    return datePrefixQuery;
  }

  const { from, to } = toUtcDayRange(date);

  const rangeQuery = await supabaseAdmin
    .from('time_slots')
    .select('*')
    .eq(doctorColumn, doctorValue)
    .gte('date', from)
    .lt('date', to)
    .order('time');

  if (!rangeQuery.error && rangeQuery.data && rangeQuery.data.length > 0) {
    return rangeQuery;
  }

  if (exactQuery.error && !datePrefixQuery.error) {
    return datePrefixQuery;
  }

  if (datePrefixQuery.error && !rangeQuery.error) {
    return rangeQuery;
  }

  if (exactQuery.error && !rangeQuery.error) {
    return rangeQuery;
  }

  return exactQuery.error ? exactQuery : (datePrefixQuery.error ? rangeQuery : datePrefixQuery);
};

const resolveDoctorProfileIds = async (doctorId: string, doctorPhone?: string | null, doctorName?: string | null) => {
  const profileIds = new Set<string>();

  const byDirectId = await supabaseAdmin
    .from('doctor_profiles')
    .select('id')
    .eq('id', doctorId)
    .limit(1);

  (byDirectId.data || []).forEach((row: { id: string }) => profileIds.add(row.id));

  if (doctorPhone) {
    const userByPhone = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone', doctorPhone)
      .limit(1);

    if (!userByPhone.error && userByPhone.data?.[0]?.id) {
      const byUserId = await supabaseAdmin
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', userByPhone.data[0].id)
        .limit(1);

      (byUserId.data || []).forEach((row: { id: string }) => profileIds.add(row.id));
    }
  }

  if (profileIds.size === 0 && doctorName) {
    const userByName = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('name', doctorName)
      .eq('user_type', 'DOCTOR')
      .limit(1);

    if (!userByName.error && userByName.data?.[0]?.id) {
      const byUserId = await supabaseAdmin
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', userByName.data[0].id)
        .limit(1);

      (byUserId.data || []).forEach((row: { id: string }) => profileIds.add(row.id));
    }
  }

  return Array.from(profileIds);
};

const fetchTimeSlotsWithFallback = async (doctorId: string, date: string, doctorPhone?: string | null, doctorName?: string | null) => {
  const errors: unknown[] = [];

  const directDoctorQuery = await querySlotsByColumn('doctor_id', doctorId, date);
  if (directDoctorQuery.error) {
    errors.push(directDoctorQuery.error);
  }
  if (!directDoctorQuery.error && directDoctorQuery.data && directDoctorQuery.data.length > 0) {
    return { data: directDoctorQuery.data as TimeSlotRecord[], source: 'doctor_id' as const };
  }

  const profileIds = await resolveDoctorProfileIds(doctorId, doctorPhone, doctorName);

  for (const profileId of profileIds) {
    const profileQuery = await querySlotsByColumn('doctor_profile_id', profileId, date);
    if (profileQuery.error) {
      errors.push(profileQuery.error);
      continue;
    }

    if (profileQuery.data && profileQuery.data.length > 0) {
      return {
        data: profileQuery.data as TimeSlotRecord[],
        source: 'doctor_profile_id' as const,
        profileId
      };
    }
  }

  if (!directDoctorQuery.error && directDoctorQuery.data && directDoctorQuery.data.length === 0) {
    return {
      data: [] as TimeSlotRecord[],
      source: 'doctor_id' as const,
      errors
    };
  }

  return {
    data: [] as TimeSlotRecord[],
    source: 'none' as const,
    errors
  };
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
        phone: doctorData.phone || null,
        workingDays: Array.isArray(doctorData.working_days) && doctorData.working_days.length > 0
          ? doctorData.working_days
          : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
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
    
    const slotQueryResult = await fetchTimeSlotsWithFallback(doctorId, date, doctor.phone, doctor.name);

    if (slotQueryResult.source === 'none' && slotQueryResult.errors?.length) {
      console.error('❌ Error fetching time slots:', slotQueryResult.errors[0]);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to fetch time slots'
      }, { status: 500 });
    }

    const timeSlots = slotQueryResult.data;

    console.log(`✅ Found ${timeSlots?.length || 0} time slots in database`, {
      source: slotQueryResult.source,
      profileId: slotQueryResult.source === 'doctor_profile_id' ? slotQueryResult.profileId : undefined
    });

    // Transform database slots to API format
    const formattedSlots = (timeSlots || []).map(slot => ({
      id: slot.id,
      time: normalizeTime(slot.time),
      available: slot.is_available,
      type: normalizeSlotType(slot.slot_type, slot.time),
      date: slot.date,
      doctorId: slot.doctor_id || doctorId,
      duration: slot.duration || 30
    }));

    let effectiveSlots = formattedSlots;

    if (effectiveSlots.length === 0) {
      console.log('⚠️ No DB slots found for doctor/date. Generating dynamic fallback slots.');
      const generatedSlots = await generateTimeSlots(doctorId, date);

      effectiveSlots = generatedSlots.map(slot => ({
        id: slot.id,
        time: normalizeTime(slot.time),
        available: slot.available,
        type: slot.type,
        date: slot.date,
        doctorId: slot.doctorId,
        duration: 30
      }));
    }

    // Group slots by type
    const groupedSlots = {
      morning: effectiveSlots.filter(slot => slot.type === 'morning'),
      afternoon: effectiveSlots.filter(slot => slot.type === 'afternoon'),
      evening: effectiveSlots.filter(slot => slot.type === 'evening')
    };

    const totalSlots = effectiveSlots.length;
    const availableSlots = effectiveSlots.filter(slot => slot.available).length;

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
