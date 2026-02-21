import { NextRequest, NextResponse } from 'next/server';

// Simple health check without external dependencies
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
}