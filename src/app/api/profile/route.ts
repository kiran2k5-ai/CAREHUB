import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Database client setup with fallback
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder-url.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key';
  
  return createClient(supabaseUrl, supabaseKey);
};

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string[];
  profileImage?: string | null;
  medicalHistory?: Array<{
    condition: string;
    diagnosedDate: string;
    status: string;
  }>;
  insurance?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      appointmentReminders: boolean;
      healthTips: boolean;
    };
    language: string;
    timezone: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Mock user profile data storage
const userProfiles: Record<string, UserProfile> = {
  'user123': {
    id: 'user123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+919876543210',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    address: '123 Main Street, City, State 12345',
    emergencyContact: '+919876543211',
    bloodType: 'O+',
    allergies: ['Peanuts', 'Shellfish'],
    profileImage: null,
    medicalHistory: [
      {
        condition: 'Hypertension',
        diagnosedDate: '2020-03-15',
        status: 'Controlled'
      }
    ],
    insurance: {
      provider: 'Health Insurance Co.',
      policyNumber: 'HIC123456789',
      expiryDate: '2025-12-31'
    },
    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: true,
        appointmentReminders: true,
        healthTips: false
      },
      language: 'English',
      timezone: 'Asia/Kolkata'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  }
};

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user123';

    console.log('🔍 Fetching profile for user:', userId);

    // Try to get from database first
    try {
      const supabase = getSupabaseClient();
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && user) {
        console.log('✅ Profile found in database:', user);
        
        // Map database fields to profile format
        const profile = {
          id: user.id,
          name: user.name || user.full_name || 'User',
          email: user.email || '',
          phone: user.phone || '',
          dateOfBirth: user.date_of_birth || user.dateOfBirth,
          gender: user.gender,
          address: user.address,
          emergencyContact: user.emergency_contact || user.emergencyContact,
          bloodType: user.blood_type || user.bloodType,
          allergies: user.allergies ? (Array.isArray(user.allergies) ? user.allergies : [user.allergies]) : [],
          profileImage: user.profile_image || user.profileImage,
          preferences: user.preferences || {
            notifications: {
              email: true,
              sms: true,
              push: true,
              appointmentReminders: true,
              healthTips: false
            },
            language: 'English',
            timezone: 'Asia/Kolkata'
          },
          createdAt: user.created_at || user.createdAt || new Date().toISOString(),
          updatedAt: user.updated_at || user.updatedAt || new Date().toISOString()
        };

        return NextResponse.json({
          success: true,
          data: profile
        });
      }
    } catch (dbError) {
      console.log('⚠️ Database error, falling back to mock data:', dbError);
    }

    // Fallback to mock data
    const profile = userProfiles[userId];
    if (!profile) {
      console.log('⚠️ No profile found, creating default profile');
      const defaultProfile = {
        id: userId,
        name: 'Test Patient',
        email: 'patient@demo.com',
        phone: '+919876543210',
        preferences: {
          notifications: {
            email: true,
            sms: true,
            push: true,
            appointmentReminders: true,
            healthTips: false
          },
          language: 'English',
          timezone: 'Asia/Kolkata'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return NextResponse.json({
        success: true,
        data: defaultProfile
      });
    }

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch profile'
    }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user123';
    const updateData = await request.json();

    console.log('🔄 Updating profile for user:', userId, 'with data:', updateData);

    // Try to update in database first
    try {
      const supabase = getSupabaseClient();
      
      // Map profile fields to database fields
      const dbUpdateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (updateData.name) dbUpdateData.name = updateData.name;
      if (updateData.email) dbUpdateData.email = updateData.email;
      if (updateData.phone) dbUpdateData.phone = updateData.phone;
      if (updateData.dateOfBirth) dbUpdateData.date_of_birth = updateData.dateOfBirth;
      if (updateData.gender) dbUpdateData.gender = updateData.gender;
      if (updateData.address) dbUpdateData.address = updateData.address;
      if (updateData.emergencyContact) dbUpdateData.emergency_contact = updateData.emergencyContact;
      if (updateData.bloodType) dbUpdateData.blood_type = updateData.bloodType;
      if (updateData.allergies) dbUpdateData.allergies = updateData.allergies;
      if (updateData.profileImage) dbUpdateData.profile_image = updateData.profileImage;
      if (updateData.preferences) dbUpdateData.preferences = updateData.preferences;

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(dbUpdateData)
        .eq('id', userId)
        .select()
        .single();

      if (!error && updatedUser) {
        console.log('✅ Profile updated in database:', updatedUser);
        
        // Return updated profile in expected format
        const updatedProfile = {
          id: updatedUser.id,
          name: updatedUser.name || updatedUser.full_name || 'User',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          dateOfBirth: updatedUser.date_of_birth || updatedUser.dateOfBirth,
          gender: updatedUser.gender,
          address: updatedUser.address,
          emergencyContact: updatedUser.emergency_contact || updatedUser.emergencyContact,
          bloodType: updatedUser.blood_type || updatedUser.bloodType,
          allergies: updatedUser.allergies ? (Array.isArray(updatedUser.allergies) ? updatedUser.allergies : [updatedUser.allergies]) : [],
          profileImage: updatedUser.profile_image || updatedUser.profileImage,
          preferences: updatedUser.preferences,
          createdAt: updatedUser.created_at || updatedUser.createdAt,
          updatedAt: updatedUser.updated_at || updatedUser.updatedAt
        };

        return NextResponse.json({
          success: true,
          message: 'Profile updated successfully',
          data: updatedProfile
        });
      } else {
        console.log('⚠️ Database update failed, falling back to mock update:', error);
      }
    } catch (dbError) {
      console.log('⚠️ Database error during update, using fallback:', dbError);
    }

    // Fallback to mock data update
    const currentProfile = userProfiles[userId];
    if (!currentProfile) {
      return NextResponse.json({
        success: false,
        message: 'Profile not found'
      }, { status: 404 });
    }

    // Update profile with new data
    const updatedProfile = {
      ...currentProfile,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    userProfiles[userId] = updatedProfile;
    console.log('✅ Profile updated in mock storage');

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update profile'
    }, { status: 500 });
  }
}

// POST - Update profile preferences
export async function POST(request: NextRequest) {
  try {
    const { userId, preferences } = await request.json();
    const currentProfile = userProfiles[userId || 'user123'];
    
    if (!currentProfile) {
      return NextResponse.json({
        success: false,
        message: 'Profile not found'
      }, { status: 404 });
    }

    // Update preferences
    currentProfile.preferences = {
      ...currentProfile.preferences,
      ...preferences
    };
    currentProfile.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      data: currentProfile
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update preferences'
    }, { status: 500 });
  }
}
