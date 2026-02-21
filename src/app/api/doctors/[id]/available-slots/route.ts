import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
      .select('id, name')
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

    // Fetch available slots from database
    const { data: availableSlots, error: slotsError } = await supabaseAdmin
      .from('time_slots')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('is_available', true)
      .gte('date', today.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date')
      .order('time');

    if (slotsError) {
      console.error('❌ Error fetching available slots:', slotsError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to fetch available slots'
      }, { status: 500 });
    }

    console.log(`✅ Found ${availableSlots?.length || 0} available slots`);

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
        time: slot.time.substring(0, 5), // Convert "HH:MM:SS" to "HH:MM"
        slot_type: slot.slot_type,
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