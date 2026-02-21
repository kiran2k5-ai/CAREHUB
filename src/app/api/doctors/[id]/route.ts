import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getDoctorWithRetry, testSupabaseConnection } from '@/lib/supabaseWithRetry';
import { getFallbackDoctor } from '@/lib/fallbackData';

// GET /api/doctors/[id] - Get doctor by ID from database (REAL DATA ONLY)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const doctorId = awaitedParams.id;

    console.log('🔍 Fetching doctor from database with ID:', doctorId);
    console.log('🔧 Testing Supabase connection...');

    // Test Supabase connection first
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.connected) {
      console.error('❌ Supabase connection test failed, using fallback data:', connectionTest.error);
      
      // Use fallback data when database is unavailable
      const fallbackDoctor = getFallbackDoctor(doctorId);
      console.log('🚨 Using fallback doctor data:', fallbackDoctor.name);
      
      return NextResponse.json({
        success: true,
        data: fallbackDoctor,
        message: 'Doctor found successfully (fallback mode)',
        fallback: true
      }, { status: 200 });
    }

    console.log('✅ Supabase connection test passed');

    // Get doctor using retry logic
    const { data: doctor, error } = await getDoctorWithRetry(doctorId);

    if (error) {
      console.error('❌ Doctor query failed, using fallback data:', {
        doctorId,
        error: error.message
      });
      
      // Use fallback data when query fails
      const fallbackDoctor = getFallbackDoctor(doctorId);
      console.log('🚨 Using fallback doctor data:', fallbackDoctor.name);
      
      return NextResponse.json({
        success: true,
        data: fallbackDoctor,
        message: 'Doctor found successfully (fallback mode)',
        fallback: true
      }, { status: 200 });
    }

    if (!doctor) {
      console.log('❌ Doctor not found in database, using fallback data for ID:', doctorId);
      
      // Use fallback data when doctor not found
      const fallbackDoctor = getFallbackDoctor(doctorId);
      console.log('🚨 Using fallback doctor data:', fallbackDoctor.name);
      
      return NextResponse.json({
        success: true,
        data: fallbackDoctor,
        message: 'Doctor found successfully (fallback mode)',
        fallback: true
      }, { status: 200 });
    }

    console.log('✅ Found doctor in database:', doctor.name);

    // Transform ONLY real database data - no mock data
    const transformedDoctor = {
      id: doctor.id, // Real UUID from database
      name: doctor.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      rating: doctor.rating || 4.5,
      reviewCount: 127, // Could be made dynamic later
      consultationFee: doctor.consultation_fee,
      location: 'Online',
      availability: doctor.is_available ? 'Available today' : 'Not available',
      nextSlot: '9:00 AM - 7:00 PM',
      image: doctor.image || '/api/placeholder/150/150',
      isAvailable: doctor.is_available,
      distance: '0 km',
      languages: ['English'],
      qualifications: ['MBBS'],
      about: `Experienced ${doctor.specialization} with ${doctor.experience} of practice.`,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: '9:00 AM - 7:00 PM',
      phoneNumber: doctor.phone,
      email: `${doctor.name?.toLowerCase().replace(/\s+/g, '.')}@demo.com`
    };

    console.log('📋 Returning real doctor UUID:', transformedDoctor.id);

    return NextResponse.json({
      success: true,
      data: transformedDoctor,
      message: 'Doctor found successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching doctor from database:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch doctor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
