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
      // More sophisticated headers to avoid bot detection
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
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

      // Check for bot detection page
      if (html.includes('Je bent bijna op de pagina die je zoekt') || 
          html.includes('bijna op de pagina') ||
          html.includes('bot detection') ||
          html.length < 1000) {
        console.log('🚫 Bot detection triggered - showing placeholder page');
        return NextResponse.json({
          success: false,
          error: 'Bot detection triggered',
          message: 'Funda is blocking automated requests. Try again later or use a different approach.',
          botDetection: true,
          contentLength: html.length
        }, { status: 429 });
      }

      // Better data extraction with multiple selectors
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'No title found';

      // Try multiple price patterns
      const pricePatterns = [
        /€\s*[\d.,]+/g,
        /prijs[^>]*>([^<]+)</i,
        /object-header__price[^>]*>([^<]+)</i,
        /[0-9]{1,3}\.[0-9]{3}/g
      ];
      
      let price = 'No price found';
      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match) {
          price = match[0] || match[1] || 'No price found';
          break;
        }
      }

      // Try multiple address patterns
      const addressPatterns = [
        /<h1[^>]*>([^<]+)<\/h1>/i,
        /object-header__address[^>]*>([^<]+)</i,
        /[A-Za-z\s]+[0-9]+[A-Za-z\s]*,\s*[0-9]{4}\s*[A-Za-z\s]+/g
      ];
      
      let address = 'No address found';
      for (const pattern of addressPatterns) {
        const match = html.match(pattern);
        if (match) {
          address = match[1] || match[0] || 'No address found';
          break;
        }
      }

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
