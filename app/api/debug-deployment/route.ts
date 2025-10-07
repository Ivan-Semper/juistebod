import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    return NextResponse.json({
      success: true,
      deployment: {
        environment: process.env.NODE_ENV,
        vercel: process.env.VERCEL ? 'Yes' : 'No',
        region: process.env.VERCEL_REGION || 'Unknown',
        url: process.env.VERCEL_URL || 'Unknown',
        gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || 'Unknown',
        timestamp: new Date().toISOString(),
        clientIP
      },
      environment: {
        // Check critical environment variables
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
        mollieApiKey: process.env.MOLLIE_API_KEY ? 'Set' : 'Missing',
        googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Set' : 'Missing',
      },
      headers: {
        host: request.headers.get('host'),
        userAgent: request.headers.get('user-agent'),
        xForwardedFor: request.headers.get('x-forwarded-for'),
        xRealIp: request.headers.get('x-real-ip'),
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Debug deployment failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
