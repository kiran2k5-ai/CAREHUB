import { NextRequest, NextResponse } from 'next/server';

// Debug API route to check authentication status
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Auth debug endpoint accessible',
      timestamp: new Date().toISOString(),
      headers: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        origin: request.headers.get('origin')
      }
    });
  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Auth state received',
      receivedData: {
        hasUserData: !!body.userData,
        userType: body.userType,
        hasAuthToken: !!body.authToken,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Auth debug POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process auth debug request'
    }, { status: 500 });
  }
}
