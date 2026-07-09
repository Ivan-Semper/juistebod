import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/utils/rateLimit';

export async function POST(request: NextRequest) {
  // Rate limit: voorkomt misbruik van onze Google Maps-quota
  const ip = getClientIP(request);
  const { allowed } = rateLimit(`geocode:${ip}`, 15, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Te veel verzoeken. Probeer het later opnieuw.' },
      { status: 429 }
    );
  }

  try {
    const { postcode, houseNumber } = await request.json();

    if (!postcode || !houseNumber || typeof postcode !== 'string' || typeof houseNumber !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Postcode en huisnummer zijn verplicht' },
        { status: 400 }
      );
    }

    if (postcode.length > 10 || houseNumber.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Ongeldige invoer' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Google Maps API key ontbreekt' },
        { status: 500 }
      );
    }

    const addressQuery = `${postcode} ${houseNumber}, Nederland`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      addressQuery
    )}&key=${apiKey}&language=nl&region=nl`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results?.length) {
      const components = data.results[0].address_components || [];
      const get = (type: string) =>
        components.find((c: any) => c.types?.includes(type))?.long_name || '';

      const street = get('route');
      const number = get('street_number') || houseNumber;
      const postal = get('postal_code') || postcode;
      const city = get('locality') || get('postal_town') || get('administrative_area_level_2');

      const line1 = [street, number].filter(Boolean).join(' ').trim();
      const line2 = [postal, city].filter(Boolean).join(' ').trim();
      const formattedAddress = [line1, line2].filter(Boolean).join(', ').trim();

      return NextResponse.json({
        success: true,
        formattedAddress: formattedAddress || data.results[0].formatted_address,
        street,
        houseNumber: number,
        postcode: postal,
        city
      });
    }

    return NextResponse.json({
      success: false,
      status: data.status,
      error: data.error_message || 'Adres niet gevonden'
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Adres opzoeken is mislukt' },
      { status: 500 }
    );
  }
}
