import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    mollieApiKey: process.env.MOLLIE_API_KEY ? 'Set' : 'Missing',
    mollieWebhookUrl: process.env.MOLLIE_WEBHOOK_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
    googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Set' : 'Missing'
  });
}
