import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'API Routes Working',
    environment: {
      mollieApiKey: process.env.MOLLIE_API_KEY ? 'Set' : 'Missing (using placeholder)',
      mollieWebhookUrl: process.env.MOLLIE_WEBHOOK_URL || 'Not set',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing (using placeholder)',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing (using placeholder)',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing (using placeholder)',
      googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Set' : 'Missing'
    },
    note: 'API routes work with placeholder values but need real environment variables for full functionality'
  });
}
