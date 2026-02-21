import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    const db = new DatabaseService();
    
    // Test basic connection by trying to fetch users
    const { data: users, error } = await db.supabase
      .from('users')
      .select('id, phone, user_type, created_at')
      .limit(5);

    if (error) {
      console.log('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        error: error.message,
        fallback: 'Using mock data'
      }, { status: 500 });
    }

    console.log('✅ Database connection successful!');
    console.log('📊 Found users:', users?.length || 0);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        users: users || [],
        userCount: users?.length || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test endpoint error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}