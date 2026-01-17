import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/config/supabase.config';

/**
 * Quick status check endpoint
 * Returns basic health status of all services
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      supabase: 'unknown',
      mollie: 'unknown',
      googleMaps: 'unknown'
    },
    envVars: {
      supabase: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      mollie: {
        apiKey: !!process.env.MOLLIE_API_KEY
      },
      googleMaps: {
        apiKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      }
    }
  };

  // Quick Supabase test
  try {
    const { error } = await supabaseAdmin.from('orders').select('id').limit(1);
    status.services.supabase = error ? 'error' : 'ok';
  } catch {
    status.services.supabase = 'error';
  }

  // Check Mollie
  const mollieKey = process.env.MOLLIE_API_KEY;
  if (!mollieKey || mollieKey.includes('placeholder')) {
    status.services.mollie = 'not-configured';
  } else {
    status.services.mollie = 'configured';
  }

  // Check Google Maps
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!googleMapsKey) {
    status.services.googleMaps = 'not-configured';
  } else {
    status.services.googleMaps = 'configured';
  }

  return NextResponse.json(status);
}
