import { NextRequest, NextResponse } from 'next/server';

// Simple system test endpoint
export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test 1: Import Database Service
  try {
    await import('@/lib/database');
    results.tests.push({ name: 'Database Service', status: '✅ PASS', details: 'Successfully imported' });
  } catch (error) {
    results.tests.push({ name: 'Database Service', status: '❌ FAIL', details: error.message });
  }

  // Test 2: Import Validation
  try {
    await import('@/lib/validations');
    results.tests.push({ name: 'Validation System', status: '✅ PASS', details: 'Successfully imported' });
  } catch (error) {
    results.tests.push({ name: 'Validation System', status: '❌ FAIL', details: error.message });
  }

  // Test 3: Import Notifications
  try {
    await import('@/lib/notifications');
    results.tests.push({ name: 'Notification System', status: '✅ PASS', details: 'Successfully imported' });
  } catch (error) {
    results.tests.push({ name: 'Notification System', status: '❌ FAIL', details: error.message });
  }

  // Test 4: Import WebSocket
  try {
    await import('@/lib/websocket');
    results.tests.push({ name: 'WebSocket System', status: '✅ PASS', details: 'Successfully imported' });
  } catch (error) {
    results.tests.push({ name: 'WebSocket System', status: '❌ FAIL', details: error.message });
  }

  // Test 5: Import Supabase
  try {
    await import('@/lib/supabase');
    results.tests.push({ name: 'Supabase Client', status: '✅ PASS', details: 'Successfully imported' });
  } catch (error) {
    results.tests.push({ name: 'Supabase Client', status: '❌ FAIL', details: error.message });
  }

  // Environment Variables Check
  const envCheck = {
    supabase: process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url',
    email: process.env.SMTP_USER !== 'your_email@gmail.com',
    sms: process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid'
  };

  results.tests.push({
    name: 'Environment Variables',
    status: Object.values(envCheck).some(v => v) ? '⚠️ PARTIAL' : '❌ NOT CONFIGURED',
    details: {
      supabase: envCheck.supabase ? 'Configured' : 'Needs configuration',
      email: envCheck.email ? 'Configured' : 'Needs configuration',
      sms: envCheck.sms ? 'Configured' : 'Needs configuration'
    }
  });

  const passedTests = results.tests.filter(t => t.status.includes('PASS')).length;
  const totalTests = results.tests.length - 1; // Exclude env vars test

  return NextResponse.json({
    success: true,
    summary: `${passedTests}/${totalTests} core systems working`,
    codeComplete: passedTests === totalTests,
    needsConfiguration: !Object.values(envCheck).every(v => v),
    results
  });
}