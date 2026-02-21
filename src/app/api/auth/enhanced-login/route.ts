// Direct login API - phone number only, no OTP required
import { NextRequest, NextResponse } from 'next/server';
import { validateData } from '@/lib/validations';
import { LoginSchema } from '@/lib/validations';
import { supabaseAdmin } from '@/lib/supabase';

// Create supabaseAdmin client


export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    console.log('Received phone number:', phone, 'Type:', typeof phone, 'Length:', phone?.length);

    // Validate phone number
    const validation = validateData(LoginSchema, { phone });
    if (!validation.success) {
      console.log('Phone validation failed for:', phone);
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number format',
        errors: validation.errors
      }, { status: 400 });
    }

    // Normalize phone number (remove any non-digits)
    const normalizedPhone = phone.replace(/\D/g, '');
    
    console.log('Normalized phone:', normalizedPhone);

    // First, try to find user in database
    try {
      const { data: existingUser, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('phone', normalizedPhone)
        .single();

      if (!error && existingUser) {
        console.log('Found existing user in database:', existingUser);
        
        const redirectUrl = existingUser.user_type === 'DOCTOR' ? '/doctor-dashboard' : '/patient-dashboard';
        const authToken = `auth_${normalizedPhone}_${Date.now()}`;

        // Return REAL database UUID instead of fake ID
        return NextResponse.json({
          success: true,
          userData: {
            id: existingUser.id, // Use actual UUID from database
            phone: existingUser.phone,
            name: existingUser.name,
            userType: existingUser.user_type.toLowerCase()
          },
          userType: existingUser.user_type.toLowerCase(),
          authToken,
          redirectUrl,
          message: `Welcome back, ${existingUser.name}!`,
          source: 'database'
        });
      }
    } catch (dbError) {
      console.log('Database lookup failed, falling back to demo mode:', dbError);
    }

    // If user not found in database, create new user in database
    console.log('User not found in database, creating new user');
    
    // Determine user type based on phone number
    let userType: 'PATIENT' | 'DOCTOR' = 'PATIENT';
    let redirectUrl = '/patient-dashboard';
    
    // Check if it's a doctor number (numbers starting with 987654321X or ending with 0)
    if (normalizedPhone.startsWith('987654321') || normalizedPhone.endsWith('0')) {
      userType = 'DOCTOR';
      redirectUrl = '/doctor-dashboard';
    }

    try {
      // Create new user in database with proper UUID
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert([{
          phone: normalizedPhone,
          name: userType === 'DOCTOR' ? `Dr. ${normalizedPhone.slice(-4)}` : `Patient ${normalizedPhone.slice(-4)}`,
          user_type: userType
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Created new user in database:', newUser);

      // Create user data for response
      const userData = {
        id: newUser.id, // Use actual UUID from database
        phone: newUser.phone,
        name: newUser.name,
        userType: newUser.user_type.toLowerCase()
      };

      // Generate auth token
      const authToken = `auth_${normalizedPhone}_${Date.now()}`;

      console.log(`Database user creation successful for ${userType.toLowerCase()}: ${normalizedPhone}`);

      return NextResponse.json({
        success: true,
        userData,
        userType: userType.toLowerCase(),
        authToken,
        redirectUrl,
        message: `Welcome, ${newUser.name}!`,
        source: 'database_new'
      });

    } catch (createError) {
      console.error('Failed to create user in database:', createError);
      
      // Only fallback to demo mode if database creation fails
      const userData = {
        id: userType === 'DOCTOR' ? '5a7ec831-cd80-42ef-ae13-9805d4293261' : `demo_patient_${normalizedPhone}`,
        phone: normalizedPhone,
        name: userType === 'DOCTOR' ? `Dr. Demo ${normalizedPhone.slice(-4)}` : `Demo Patient ${normalizedPhone.slice(-4)}`,
        userType: userType.toLowerCase()
      };

      const authToken = `auth_demo_${normalizedPhone}_${Date.now()}`;

      return NextResponse.json({
        success: true,
        userData,
        userType: userType.toLowerCase(),
        authToken,
        redirectUrl,
        message: `Welcome to demo mode, ${userData.name}!`,
        source: 'demo_fallback'
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process login request'
    }, { status: 500 });
  }
}

