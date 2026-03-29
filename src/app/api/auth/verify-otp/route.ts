import { NextRequest, NextResponse } from 'next/server';
import { otpStorage, mockUsers } from '../storage';

export async function POST(request: NextRequest) {
  try {
    const { contact, otp } = await request.json();

    if (!contact || !otp) {
      return NextResponse.json(
        { error: 'Contact and OTP are required' },
        { status: 400 }
      );
    }

    // For development: Accept any 4-digit OTP
    if (!/^\d{4}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be 4 digits' },
        { status: 400 }
      );
    }

    // Get stored OTP (if exists)
    const storedOtpData = otpStorage.get(contact);

    // For development: If no stored OTP or expired, still allow any 4-digit code
    if (!storedOtpData || Date.now() > storedOtpData.expires) {
      // Clear expired OTP
      if (storedOtpData) {
        otpStorage.delete(contact);
      }
      
      // For development: Create a temporary user for any 4-digit OTP
      const baseUser = {
        id: `temp-${Date.now()}`,
        email: contact.includes('@') ? contact : 'temp@example.com',
        phone: contact.includes('@') ? '+919999999999' : contact,
        name: 'Test User',
        userType: contact.includes('doctor') || contact.includes('987654') ? 'doctor' : 'patient'
      };
      // Override doctor ID with the correct one
      const userId = baseUser.userType === 'doctor' ? '550e8400-e29b-41d4-a716-446655440001' : baseUser.id;

      const token = `mock-jwt-token-${userId}-${Date.now()}`;

      return NextResponse.json({
        message: 'OTP verified successfully (dev mode)',
        user: {
          id: userId,
          name: baseUser.name,
          email: baseUser.email,
          phone: baseUser.phone
        },
        token
      });
    }

    // If we have stored OTP, verify it normally
    if (storedOtpData.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Find user
    let user = mockUsers.find(u => u.id === storedOtpData.userId);

    // If user not found, create a temporary mock user for testing
    if (!user) {
      user = {
        id: storedOtpData.userId,
        email: contact.includes('@') ? contact : 'temp@example.com',
        phone: contact.includes('@') ? '+919999999999' : contact,
        name: 'Test User',
        userType: contact.includes('doctor') || contact.includes('987654') ? 'doctor' : 'patient'
      };
    }

    // Clear OTP after successful verification
    otpStorage.delete(contact);

    // Override doctor ID with the correct one if it's a doctor
    const userId = user.userType === 'doctor' || user.name?.includes('Doctor') ? '550e8400-e29b-41d4-a716-446655440001' : user.id;

    // In production, generate JWT token here
    const token = `mock-jwt-token-${userId}-${Date.now()}`;

    return NextResponse.json({
      message: 'OTP verified successfully',
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      token
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
