import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET /api/specialties - Get all available specialties
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching specialties from database');

    // Get all doctors from database
    const doctors = await DatabaseService.getAllDoctors({ available: true });
    
    // Extract unique specialties
    const specialtiesSet = new Set(doctors.map(doctor => doctor.specialization));
    const specialties = Array.from(specialtiesSet);
    
    // Count doctors for each specialty
    const specialtiesWithCount = specialties.map(specialty => ({
      name: specialty,
      count: doctors.filter(doctor => doctor.specialization === specialty).length,
      available_doctors: doctors.filter(doctor => 
        doctor.specialization === specialty && doctor.is_available
      ).length
    }));

    // Sort by count (most popular first)
    specialtiesWithCount.sort((a, b) => b.count - a.count);

    console.log(`🏥 Found ${specialties.length} specialties in database`);

    return NextResponse.json({
      success: true,
      data: {
        specialties: specialtiesWithCount,
        total: specialties.length
      },
      message: 'Specialties fetched successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching specialties:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch specialties',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
