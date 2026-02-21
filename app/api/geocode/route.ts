import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { postcode, houseNumber } = await request.json();

    if (!postcode || !houseNumber) {
      return NextResponse.json(
        { success: false, error: 'Postcode en huisnummer zijn verplicht' },
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Onbekende fout' },
      { status: 500 }
    );
  }
}
