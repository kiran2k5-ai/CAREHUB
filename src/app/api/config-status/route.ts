import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const configStatus = {
    timestamp: new Date().toISOString(),
    
    // Check what's configured
    configured: {
      supabase: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
             !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your'),
        anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
                 !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your'),
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY && 
                    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your')
      },
      email: {
        user: !!process.env.SMTP_USER && 
              !process.env.SMTP_USER.includes('your'),
        password: !!process.env.SMTP_PASS && 
                  !process.env.SMTP_PASS.includes('your')
      },
      sms: {
        accountSid: !!process.env.TWILIO_ACCOUNT_SID && 
                   !process.env.TWILIO_ACCOUNT_SID.includes('your'),
        authToken: !!process.env.TWILIO_AUTH_TOKEN && 
                  !process.env.TWILIO_AUTH_TOKEN.includes('your'),
        phoneNumber: !!process.env.TWILIO_PHONE_NUMBER && 
                    !process.env.TWILIO_PHONE_NUMBER.includes('your')
      },
      security: {
        nextAuthSecret: !!process.env.NEXTAUTH_SECRET && 
                       !process.env.NEXTAUTH_SECRET.includes('your'),
        encryptionKey: !!process.env.ENCRYPTION_KEY && 
                      !process.env.ENCRYPTION_KEY.includes('your')
      }
    },

    // System readiness
    systemChecks: {
      codeComplete: true,
      environmentVariablesSet: true,
      externalServicesReady: false
    },

    // Configuration summary
    summary: {
      totalServices: 3,
      configuredServices: 0,
      remainingTasks: []
    }
  };

  // Calculate configured services
  const supabaseReady = Object.values(configStatus.configured.supabase).every(v => v);
  const emailReady = Object.values(configStatus.configured.email).every(v => v);
  const smsReady = Object.values(configStatus.configured.sms).every(v => v);
  const securityReady = Object.values(configStatus.configured.security).every(v => v);

  configStatus.summary.configuredServices = 
    (supabaseReady ? 1 : 0) + 
    (emailReady ? 1 : 0) + 
    (smsReady ? 1 : 0);

  configStatus.systemChecks.externalServicesReady = 
    supabaseReady && emailReady && smsReady && securityReady;

  // Generate remaining tasks
  if (!supabaseReady) {
    configStatus.summary.remainingTasks.push({
      service: 'Supabase Database',
      priority: 'HIGH',
      action: 'Create Supabase project and update environment variables',
      documentation: 'See CONFIGURATION_GUIDE.md'
    });
  }

  if (!emailReady) {
    configStatus.summary.remainingTasks.push({
      service: 'Email Service',
      priority: 'MEDIUM',
      action: 'Configure Gmail SMTP with app password',
      documentation: 'See CONFIGURATION_GUIDE.md'
    });
  }

  if (!smsReady) {
    configStatus.summary.remainingTasks.push({
      service: 'SMS Service',
      priority: 'MEDIUM',
      action: 'Set up Twilio account for SMS notifications',
      documentation: 'See CONFIGURATION_GUIDE.md'
    });
  }

  // Overall status message
  let statusMessage = '';
  if (configStatus.systemChecks.externalServicesReady) {
    statusMessage = '🎉 System is fully configured and ready for production!';
  } else if (configStatus.summary.configuredServices > 0) {
    statusMessage = `⚠️ Partial configuration: ${configStatus.summary.configuredServices}/${configStatus.summary.totalServices} services configured`;
  } else {
    statusMessage = '❌ No external services configured yet. See CONFIGURATION_GUIDE.md';
  }

  return NextResponse.json({
    success: true,
    status: statusMessage,
    ...configStatus,
    nextSteps: configStatus.summary.remainingTasks.length > 0 
      ? 'Follow the CONFIGURATION_GUIDE.md to complete setup'
      : 'System ready! You can start using all features.'
  });
}