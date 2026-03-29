import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

const toUtcDayRange = (date: string) => {
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const nextDay = new Date(dayStart);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  return {
    from: dayStart.toISOString(),
    to: nextDay.toISOString()
  };
};

const querySlotsByColumnInRange = async (
  doctorColumn: 'doctor_id' | 'doctor_profile_id',
  doctorValue: string,
  fromDate: string,
  toDate: string
) => {
  const dateOnlyQuery = await supabaseAdmin
    .from('time_slots')
    .select('*')
    .eq(doctorColumn, doctorValue)
    .eq('is_available', true)
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date')
    .order('time');

  if (!dateOnlyQuery.error && dateOnlyQuery.data && dateOnlyQuery.data.length > 0) {
    return dateOnlyQuery;
  }

  const fromPrefixQuery = await supabaseAdmin
    .from('time_slots')
    .select('*')
    .eq(doctorColumn, doctorValue)
    .eq('is_available', true)
    .like('date', `${fromDate}%`)
    .order('date')
    .order('time');

  if (!fromPrefixQuery.error && fromPrefixQuery.data && fromPrefixQuery.data.length > 0) {
    return fromPrefixQuery;
  }

  const { from } = toUtcDayRange(fromDate);
  const { to } = toUtcDayRange(toDate);

  const timestampRangeQuery = await supabaseAdmin
    .from('time_slots')
    .select('*')
    .eq(doctorColumn, doctorValue)
    .eq('is_available', true)
    .gte('date', from)
    .lt('date', to)
    .order('date')
    .order('time');

  if (!timestampRangeQuery.error && timestampRangeQuery.data && timestampRangeQuery.data.length > 0) {
    return timestampRangeQuery;
  }

  if (dateOnlyQuery.error && !fromPrefixQuery.error) {
    return fromPrefixQuery;
  }

  if (fromPrefixQuery.error && !timestampRangeQuery.error) {
    return timestampRangeQuery;
  }

  if (dateOnlyQuery.error && !timestampRangeQuery.error) {
    return timestampRangeQuery;
  }

  return dateOnlyQuery.error ? dateOnlyQuery : (fromPrefixQuery.error ? timestampRangeQuery : fromPrefixQuery);
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

const fetchAvailableSlotsWithFallback = async (
  doctorId: string,
  fromDate: string,
  toDate: string,
  doctorPhone?: string | null,
  doctorName?: string | null
) => {
  const errors: unknown[] = [];

  const directDoctorQuery = await querySlotsByColumnInRange('doctor_id', doctorId, fromDate, toDate);
  if (directDoctorQuery.error) {
    errors.push(directDoctorQuery.error);
  }
  if (!directDoctorQuery.error && directDoctorQuery.data && directDoctorQuery.data.length > 0) {
    return { data: directDoctorQuery.data as TimeSlotRecord[], source: 'doctor_id' as const };
  }

  const profileIds = await resolveDoctorProfileIds(doctorId, doctorPhone, doctorName);

  for (const profileId of profileIds) {
    const profileQuery = await querySlotsByColumnInRange('doctor_profile_id', profileId, fromDate, toDate);
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

// GET /api/doctors/[id]/available-slots - Get all available slots for a doctor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const doctorId = awaitedParams.id;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7'); // Default 7 days

    console.log('🔍 Fetching available slots for doctor:', doctorId, 'for next', days, 'days');

    // Verify doctor exists
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .select('id, name, phone')
      .eq('id', doctorId)
      .single();

    if (doctorError || !doctor) {
      return NextResponse.json({
        success: false,
        error: 'Doctor not found',
        message: `No doctor found with ID: ${doctorId}`
      }, { status: 404 });
    }

    // Calculate date range
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);

    const fromDate = today.toISOString().split('T')[0];
    const toDate = endDate.toISOString().split('T')[0];

    // Fetch available slots from database with schema fallback support
    const slotQueryResult = await fetchAvailableSlotsWithFallback(
      doctorId,
      fromDate,
      toDate,
      doctor.phone,
      doctor.name
    );

    if (slotQueryResult.source === 'none' && slotQueryResult.errors?.length) {
      console.error('❌ Error fetching available slots:', slotQueryResult.errors[0]);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to fetch available slots'
      }, { status: 500 });
    }

    const availableSlots = slotQueryResult.data;

    console.log(`✅ Found ${availableSlots?.length || 0} available slots`, {
      source: slotQueryResult.source,
      profileId: slotQueryResult.source === 'doctor_profile_id' ? slotQueryResult.profileId : undefined
    });

    // Group slots by date
    const slotsByDate = {};
    (availableSlots || []).forEach(slot => {
      const date = slot.date;
      if (!slotsByDate[date]) {
        slotsByDate[date] = {
          date: date,
          dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
          slots: []
        };
      }
      
      slotsByDate[date].slots.push({
        id: slot.id,
        time: normalizeTime(slot.time),
        slot_type: normalizeSlotType(slot.slot_type, slot.time),
        duration: slot.duration || 30
      });
    });

    // Convert to array and sort by date
    const dateSlots = Object.values(slotsByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      success: true,
      data: {
        doctorId: doctor.id,
        doctorName: doctor.name,
        totalAvailableSlots: availableSlots?.length || 0,
        dateRange: {
          from: today.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0]
        },
        slotsByDate: dateSlots
      },
      message: `Found ${availableSlots?.length || 0} available slots for ${doctor.name}`
    });

  } catch (error) {
    console.error('❌ Error fetching available slots:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}