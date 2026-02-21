import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    status: 'checking',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      RENDER: process.env.RENDER,
    },
    envVars: {
      // Supabase configuration
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
      
      // NextAuth configuration
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
      
      // Google OAuth (optional)
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
      
      // Email configuration (optional)
      SMTP_HOST: process.env.SMTP_HOST ? '✅ Set' : '❌ Missing',
      SMTP_USER: process.env.SMTP_USER ? '✅ Set' : '❌ Missing',
      SMTP_PASS: process.env.SMTP_PASS ? '✅ Set' : '❌ Missing',
      
      // Twilio SMS (optional)
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing',
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing',
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ? '✅ Set' : '❌ Missing',
    },
    services: {
      supabase: 'checking',
      email: 'checking',
      sms: 'checking',
    },
    issues: [] as string[],
    recommendations: [] as string[]
  };

  try {
    // Test Supabase connection
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
      
      if (supabaseUrl === 'https://placeholder-url.supabase.co' || supabaseKey === 'placeholder-key') {
        diagnostics.services.supabase = '⚠️ Using placeholders';
        diagnostics.issues.push('Supabase credentials not configured properly');
        diagnostics.recommendations.push('Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Render environment variables');
      } else {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
          diagnostics.services.supabase = `❌ Error: ${error.message}`;
          diagnostics.issues.push(`Supabase connection failed: ${error.message}`);
        } else {
          diagnostics.services.supabase = '✅ Connected';
        }
      }
    } catch (error: any) {
      diagnostics.services.supabase = `❌ Exception: ${error.message}`;
      diagnostics.issues.push(`Supabase error: ${error.message}`);
    }

    // Test email service (optional)
    try {
      if (process.env.SMTP_HOST) {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        await transporter.verify();
        diagnostics.services.email = '✅ Configured';
      } else {
        diagnostics.services.email = '⚠️ Not configured (optional)';
      }
    } catch (error: any) {
      diagnostics.services.email = `❌ Error: ${error.message}`;
      diagnostics.recommendations.push('Email service configuration issue (non-critical)');
    }

    // Test SMS service (optional)
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        diagnostics.services.sms = '✅ Configured';
      } else {
        diagnostics.services.sms = '⚠️ Not configured (optional)';
      }
    } catch (error: any) {
      diagnostics.services.sms = `❌ Error: ${error.message}`;
      diagnostics.recommendations.push('SMS service configuration issue (non-critical)');
    }

    // Check required environment variables
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXTAUTH_SECRET'
    ];

    const missingRequired = requiredVars.filter(varName => 
      !process.env[varName] || 
      process.env[varName] === 'placeholder-url.supabase.co' ||
      process.env[varName] === 'placeholder-key' ||
      process.env[varName] === 'placeholder-service-key'
    );

    if (missingRequired.length > 0) {
      diagnostics.issues.push(`Missing required environment variables: ${missingRequired.join(', ')}`);
      diagnostics.recommendations.push('Configure missing environment variables in Render dashboard');
    }

    // Determine overall status
    if (diagnostics.issues.length === 0) {
      diagnostics.status = '✅ All systems operational';
    } else if (diagnostics.services.supabase.includes('✅')) {
      diagnostics.status = '⚠️ Operational with warnings';
    } else {
      diagnostics.status = '❌ Critical issues detected';
    }

    return NextResponse.json(diagnostics, { 
      status: diagnostics.issues.length === 0 ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      ...diagnostics,
      status: '❌ Health check failed',
      error: error.message,
      stack: error.stack,
      issues: [...diagnostics.issues, `Health check exception: ${error.message}`]
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}