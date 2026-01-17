import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({
      status: 'error',
      message: 'API key niet gevonden in environment variables',
      checks: {
        envFileExists: 'Unknown',
        apiKeyPresent: false,
        apiKeyLength: 0
      },
      solutions: [
        'Check of .env.local bestaat in de root van je project',
        'Zorg dat NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is ingesteld',
        'Herstart je development server na het toevoegen van de key'
      ]
    }, { status: 400 });
  }

  // Test the API key by making a simple request
  try {
    // Test Geocoding API (simpler than Maps JavaScript API)
    const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Amsterdam&key=${apiKey}`;
    const response = await fetch(testUrl);
    const data = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      return NextResponse.json({
        status: 'error',
        message: 'API key is geweigerd',
        apiKeyStatus: data.status,
        errorMessage: data.error_message,
        checks: {
          envFileExists: 'Yes',
          apiKeyPresent: true,
          apiKeyLength: apiKey.length,
          apiKeyPrefix: apiKey.substring(0, 10) + '...'
        },
        commonCauses: [
          'API key restricties zijn te streng (HTTP referrers)',
          'Maps JavaScript API of Geocoding API is niet geactiveerd',
          'Billing is niet ingeschakeld in Google Cloud Console',
          'API key is ongeldig of verwijderd'
        ],
        solutions: [
          'Ga naar Google Cloud Console > APIs & Services > Credentials',
          'Check of Maps JavaScript API en Geocoding API geactiveerd zijn',
          'Check of billing is ingeschakeld',
          'Check API key restricties (voeg localhost:3000/* toe als referrer)'
        ]
      }, { status: 400 });
    }

    if (data.status === 'OVER_QUERY_LIMIT') {
      return NextResponse.json({
        status: 'error',
        message: 'API quota is overschreden',
        apiKeyStatus: data.status,
        checks: {
          envFileExists: 'Yes',
          apiKeyPresent: true,
          apiKeyLength: apiKey.length
        },
        solutions: [
          'Wacht even en probeer later opnieuw',
          'Check je quota in Google Cloud Console',
          'Overweeg een billing account toe te voegen voor hogere quota'
        ]
      }, { status: 429 });
    }

    if (data.status === 'OK') {
      return NextResponse.json({
        status: 'success',
        message: 'Google Maps API key werkt correct!',
        apiKeyStatus: data.status,
        checks: {
          envFileExists: 'Yes',
          apiKeyPresent: true,
          apiKeyLength: apiKey.length,
          apiKeyPrefix: apiKey.substring(0, 10) + '...',
          geocodingApi: 'Working'
        }
      });
    }

    return NextResponse.json({
      status: 'warning',
      message: `API key test gaf status: ${data.status}`,
      apiKeyStatus: data.status,
      errorMessage: data.error_message,
      checks: {
        envFileExists: 'Yes',
        apiKeyPresent: true,
        apiKeyLength: apiKey.length
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Fout bij testen van API key',
      error: error.message,
      checks: {
        envFileExists: 'Yes',
        apiKeyPresent: true,
        apiKeyLength: apiKey.length
      }
    }, { status: 500 });
  }
}
