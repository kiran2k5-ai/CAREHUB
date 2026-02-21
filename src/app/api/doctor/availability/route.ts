// Doctor availability API
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/supabase';
import { supabaseAdmin } from '@/lib/supabase';

// Create supabaseAdmin client


// Interface definitions
interface AvailabilitySlot {
  id: string;
  doctorId: string;
  date: string;
  timeSlots: string[];
  isAvailable: boolean;
  notes: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (!doctorId) {
      return NextResponse.json({
        success: false,
        error: 'Doctor ID is required'
      }, { status: 400 });
    }

    console.log('🔍 Checking availability for doctor:', doctorId, 'date:', date);

    // Check if doctor exists in database first
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .select('id, name, is_available')
      .eq('id', doctorId)
      .single();

    if (doctorError || !doctor) {
      console.log('❌ Doctor not found for availability check:', doctorId, doctorError);
      return NextResponse.json({
        success: false,
        error: 'Doctor not found'
      }, { status: 404 });
    }

    // For now, return basic availability based on doctor's is_available flag
    // In the future, this could be extended to check specific date availability
    const availabilityData = {
      id: `avail-${doctorId}-${date}`,
      doctorId: doctorId,
      date: date || new Date().toISOString().split('T')[0],
      timeSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30'],
      isAvailable: doctor.is_available,
      notes: doctor.is_available ? 'Available for consultation' : 'Currently unavailable'
    };

    console.log('✅ Availability check result:', availabilityData);

    return NextResponse.json({
      success: true,
      data: availabilityData
    });

  } catch (error) {
    console.error('❌ Error fetching availability:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch availability'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { doctorId, date, timeSlots, isAvailable, notes } = await request.json();

    if (!doctorId || !date) {
      return NextResponse.json({
        success: false,
        error: 'Doctor ID and date are required'
      }, { status: 400 });
    }

    console.log('📝 Updating availability for doctor:', doctorId, 'date:', date);

    // Check if doctor exists in database first
    const { data: doctor, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .select('id, name')
      .eq('id', doctorId)
      .single();

    if (doctorError || !doctor) {
      console.log('❌ Doctor not found for availability update:', doctorId, doctorError);
      return NextResponse.json({
        success: false,
        error: 'Doctor not found'
      }, { status: 404 });
    }

    // Update doctor's availability in the database
    const { data: updatedDoctor, error: updateError } = await supabaseAdmin
      .from('doctors')
      .update({ is_available: isAvailable })
      .eq('id', doctorId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating doctor availability:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update availability'
      }, { status: 500 });
    }

    const availabilityData = {
      id: `avail-${doctorId}-${date}`,
      doctorId,
      date,
      timeSlots: timeSlots || ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30'],
      isAvailable,
      notes: notes || (isAvailable ? 'Available for consultation' : 'Currently unavailable'),
      updatedAt: new Date().toISOString()
    };

    console.log('✅ Availability updated successfully:', availabilityData);

    return NextResponse.json({
      success: true,
      data: availabilityData,
      message: 'Availability updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating availability:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update availability'
    }, { status: 500 });
  }
}

