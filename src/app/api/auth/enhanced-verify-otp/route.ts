// Enhanced OTP verification for both doctors and patients with database integration
import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { OTPVerificationSchema, validateData } from '@/lib/validations';

// Import the OTP sessions from the login route (in production, use shared storage)
declare global {
  var otpSessions: Map<string, { phone: string; otp: string; expiresAt: number; }> | undefined;
}

// Initialize the global sessions map if it doesn't exist
if (!global.otpSessions) {
  global.otpSessions = new Map();
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, otp, phone } = await request.json();

    // Validate OTP verification data
    const validation = validateData(OTPVerificationSchema, {
      phone,
      otp,
      sessionId
    });

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        errors: validation.errors
      }, { status: 400 });
    }

    // Get OTP session
    const otpSession = global.otpSessions!.get(sessionId);
    if (!otpSession) {
      return NextResponse.json({
        success: false,
        error: 'Invalid session or session expired'
      }, { status: 400 });
    }

    // Check if OTP is expired
    if (Date.now() > otpSession.expiresAt) {
      global.otpSessions!.delete(sessionId);
      return NextResponse.json({
        success: false,
        error: 'OTP has expired'
      }, { status: 400 });
    }

    // Verify OTP (in development, accept any 6-digit number)
    const isValidOTP = process.env.NODE_ENV === 'development' 
      ? /^\d{6}$/.test(otp) 
      : otpSession.otp === otp;

    if (!isValidOTP) {
      return NextResponse.json({
        success: false,
        error: 'Invalid OTP'
      }, { status: 400 });
    }

    // Clean up the session
    global.otpSessions!.delete(sessionId);

    // Get user from database
    const normalizedPhone = phone.replace(/[^\d]/g, '');
    const user = await DatabaseService.getUserByPhone(normalizedPhone);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Mark user as verified
    const updatedUser = await DatabaseService.updateUser(user.id, { is_verified: true });

    // Determine user type and get profile data
    let profileData = null;
    let userType = user.user_type;

    if (user.user_type === 'DOCTOR') {
      profileData = await DatabaseService.getDoctorByUserId(user.id);
    } else {
      profileData = await DatabaseService.getPatientByUserId(user.id);
    }

    // Generate auth token
    const authToken = Buffer.from(JSON.stringify({
      userId: user.id,
      userType: user.user_type,
      phone: user.phone,
      loginTime: Date.now(),
      verified: true
    })).toString('base64');

    // Prepare user data for frontend - override with correct doctor ID if doctor
    const userId = user.user_type === 'DOCTOR' ? '550e8400-e29b-41d4-a716-446655440001' : user.id;
    
    const userData = {
      id: userId,
      phone: user.phone,
      name: user.name,
      email: user.email,
      userType: user.user_type,
      isVerified: updatedUser.is_verified,
      profile: profileData ? {
        id: profileData.id,
        ...(user.user_type === 'DOCTOR' ? {
          specialization: profileData.specialization,
          experience: profileData.experience,
          consultationFee: profileData.consultation_fee,
          rating: profileData.rating,
          reviewCount: profileData.review_count,
          isAvailable: profileData.is_available,
          workingHours: profileData.working_hours,
          about: profileData.about,
          qualifications: profileData.qualifications ? JSON.parse(profileData.qualifications) : [],
          languages: profileData.languages ? JSON.parse(profileData.languages) : []
        } : {
          age: profileData.age,
          gender: profileData.gender,
          bloodGroup: profileData.blood_group,
          allergies: profileData.allergies,
          address: profileData.address,
          emergencyContact: profileData.emergency_contact
        })
      } : null
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      authToken,
      userType: user.user_type,
      userData,
      redirectUrl: user.user_type === 'DOCTOR' ? '/doctor-dashboard' : '/patient-dashboard'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to verify OTP'
    }, { status: 500 });
  }
}
