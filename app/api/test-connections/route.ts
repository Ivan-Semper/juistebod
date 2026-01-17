import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/config/supabase.config';
import { createMollieClient } from '@mollie/api-client';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const results: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabase: {
      envVars: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'
      },
      connection: null as any,
      tables: null as any
    },
    mollie: {
      envVars: {
        apiKey: process.env.MOLLIE_API_KEY ? '✅ Set' : '❌ Missing',
        webhookUrl: process.env.MOLLIE_WEBHOOK_URL || 'Not set'
      },
      connection: null as any
    },
    googleMaps: {
      envVars: {
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✅ Set' : '❌ Missing'
      }
    }
  };

  // Test Supabase connection
  try {
    // Test 1: Check if we can query the orders table
    const { data: ordersData, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .limit(1);

    if (ordersError) {
      results.supabase.connection = {
        status: '❌ Error',
        message: ordersError.message,
        code: ordersError.code
      };
    } else {
      results.supabase.connection = {
        status: '✅ Connected',
        message: 'Successfully queried orders table'
      };
    }

    // Test 2: Check if we can query the property_reports table
    const { data: reportsData, error: reportsError } = await supabaseAdmin
      .from('property_reports')
      .select('id')
      .limit(1);

    if (reportsError) {
      results.supabase.tables = {
        orders: '✅ Accessible',
        property_reports: `❌ Error: ${reportsError.message}`
      };
    } else {
      results.supabase.tables = {
        orders: '✅ Accessible',
        property_reports: '✅ Accessible'
      };
    }

  } catch (error: any) {
    results.supabase.connection = {
      status: '❌ Failed',
      message: error.message || 'Unknown error'
    };
  }

  // Test Mollie connection
  try {
    const mollieApiKey = process.env.MOLLIE_API_KEY;
    
    if (!mollieApiKey || mollieApiKey.includes('placeholder') || mollieApiKey.includes('test_')) {
      results.mollie.connection = {
        status: '⚠️ Test/Placeholder Key',
        message: 'Using test or placeholder key. Real API key needed for production.'
      };
    } else {
      // Try to create a Mollie client and test connection
      const mollieClient = createMollieClient({ apiKey: mollieApiKey });
      
      // Test by trying to get methods (lightweight API call)
      try {
        const methods = await mollieClient.methods.list();
        results.mollie.connection = {
          status: '✅ Connected',
          message: `Successfully connected. Found ${methods.length} payment methods.`
        };
      } catch (mollieError: any) {
        results.mollie.connection = {
          status: '❌ Error',
          message: mollieError.message || 'Failed to connect to Mollie API',
          details: mollieError.toString()
        };
      }
    }
  } catch (error: any) {
    results.mollie.connection = {
      status: '❌ Failed',
      message: error.message || 'Unknown error'
    };
  }

  // Test Google Maps API key
  try {
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!googleMapsKey) {
      results.googleMaps.connection = {
        status: '❌ Missing',
        message: 'API key niet gevonden in environment variables'
      };
    } else {
      // Test Geocoding API (simpler than Maps JavaScript API)
      const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Amsterdam&key=${googleMapsKey}`;
      const geocodeResponse = await fetch(testUrl);
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status === 'REQUEST_DENIED') {
        results.googleMaps.connection = {
          status: '❌ API Key Denied',
          message: geocodeData.error_message || 'API key is geweigerd',
          commonCauses: [
            'API key restricties zijn te streng (HTTP referrers)',
            'Maps JavaScript API of Geocoding API is niet geactiveerd',
            'Billing is niet ingeschakeld in Google Cloud Console'
          ]
        };
      } else if (geocodeData.status === 'OVER_QUERY_LIMIT') {
        results.googleMaps.connection = {
          status: '⚠️ Quota Exceeded',
          message: 'API quota is overschreden'
        };
      } else if (geocodeData.status === 'OK') {
        results.googleMaps.connection = {
          status: '✅ Working',
          message: 'Google Maps API key werkt correct!'
        };
      } else {
        results.googleMaps.connection = {
          status: '⚠️ Unknown Status',
          message: `API returned status: ${geocodeData.status}`,
          errorMessage: geocodeData.error_message
        };
      }
    }
  } catch (error: any) {
    results.googleMaps.connection = {
      status: '❌ Test Failed',
      message: error.message || 'Unknown error'
    };
  }

  // Determine overall status
  const supabaseWorking = results.supabase.connection?.status === '✅ Connected';
  const mollieWorking = results.mollie.connection?.status === '✅ Connected' || 
                       results.mollie.connection?.status === '⚠️ Test/Placeholder Key';
  const googleMapsWorking = results.googleMaps.connection?.status === '✅ Working';

  return NextResponse.json({
    overall: {
      status: supabaseWorking && mollieWorking && googleMapsWorking ? '✅ All connections working' : '⚠️ Some issues detected',
      supabase: supabaseWorking,
      mollie: mollieWorking,
      googleMaps: googleMapsWorking
    },
    details: results
  });
}
