import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    console.log('🔍 Basic scraping attempt for:', url);
    
    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    // Validate URL
    if (!url.includes('funda.nl') && !url.includes('jaap.nl')) {
      return NextResponse.json({
        success: false,
        error: 'Only Funda.nl and Jaap.nl URLs are supported'
      }, { status: 400 });
    }

    try {
      // Simple fetch with minimal headers
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        }, { status: response.status });
      }

      const html = await response.text();
      console.log('📊 HTML length:', html.length);

      // Simple data extraction
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'No title found';

      const priceMatch = html.match(/€\s*[\d.,]+/g);
      const price = priceMatch ? priceMatch[0] : 'No price found';

      const addressMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const address = addressMatch ? addressMatch[1].trim() : 'No address found';

      const propertyData = {
        title: title,
        price: price,
        address: address,
        url: url,
        scrapedAt: new Date().toISOString(),
        contentLength: html.length,
        hasPropertyData: html.includes('prijs') || html.includes('oppervlakte') || html.includes('kamers'),
        // Add required fields with safe defaults
        images: [], // Empty array instead of undefined
        description: '', // Empty string instead of undefined
        propertyType: 'Onbekend',
        surface: 'Onbekend',
        rooms: 'Onbekend',
        yearBuilt: 'Onbekend'
      };

      console.log('✅ Basic scraping successful:', propertyData);

      return NextResponse.json({
        success: true,
        data: propertyData
      });

    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Fetch failed',
        message: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json({
      success: false,
      error: 'API failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
