import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAllDoctorsWithRetry } from '@/lib/supabaseWithRetry';
import { fallbackDoctors } from '@/lib/fallbackData';

// GET /api/doctors - Get all doctors from database with retry logic
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching doctors from database...');

    // Try with retry logic first
    try {
      const { data: doctorProfiles, error } = await getAllDoctorsWithRetry();
      
      if (!error && doctorProfiles && doctorProfiles.length > 0) {
        console.log(`✅ Found ${doctorProfiles.length} doctor profiles`);
        
        const transformedDoctors = doctorProfiles.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.name || 'Unknown Doctor',
          specialization: doctor.specialization,
          experience: doctor.experience,
          rating: doctor.rating || 4.5,
          reviewCount: doctor.review_count || 127,
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
        }));

        return NextResponse.json({
          success: true,
          data: {
            doctors: transformedDoctors,
            pagination: {
              current_page: 1,
              per_page: transformedDoctors.length,
              total: transformedDoctors.length,
              total_pages: 1,
              has_next: false,
              has_prev: false
            }
          },
          message: `Found ${transformedDoctors.length} doctors`
        });
      } else {
        console.error('❌ Retry mechanism returned error:', error);
      }
    } catch (retryError) {
      console.error('❌ Retry mechanism failed:', retryError);
    }

    // Final fallback: Return fallback data
    console.log('⚠️ Using fallback doctor data');
    
    return NextResponse.json({
      success: true,
      data: {
        doctors: fallbackDoctors,
        pagination: {
          current_page: 1,
          per_page: fallbackDoctors.length,
          total: fallbackDoctors.length,
          total_pages: 1,
          has_next: false,
          has_prev: false
        }
      },
      message: `Returning ${fallbackDoctors.length} fallback doctors`,
      fallback: true
    });

  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    
    // Always return fallback data on any error
    return NextResponse.json({
      success: true,
      data: {
        doctors: fallbackDoctors,
        pagination: {
          current_page: 1,
          per_page: fallbackDoctors.length,
          total: fallbackDoctors.length,
          total_pages: 1,
          has_next: false,
          has_prev: false
        }
      },
      message: `Fallback doctors due to error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
