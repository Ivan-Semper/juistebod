import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    console.log('🔍 Proxy scraping attempt for:', url);
    
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
      // Try with different user agents and delays
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];

      let lastError;
      
      for (let i = 0; i < userAgents.length; i++) {
        try {
          // Add delay between attempts
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
          }

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'User-Agent': userAgents[i],
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
              'Upgrade-Insecure-Requests': '1',
              'Referer': 'https://www.google.com/',
              'DNT': '1'
            }
          });

          console.log(`📊 User agent ${i + 1} response status:`, response.status);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const html = await response.text();
          console.log(`📊 User agent ${i + 1} HTML length:`, html.length);

          // Check for bot detection
          if (html.includes('Je bent bijna op de pagina die je zoekt') || 
              html.includes('bijna op de pagina') ||
              html.includes('bot detection') ||
              html.length < 1000) {
            console.log(`🚫 User agent ${i + 1} triggered bot detection`);
            throw new Error('Bot detection triggered');
          }

          // Extract basic data
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : 'No title found';

          // Try to find price
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

          // Try to find address
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
            userAgent: userAgents[i],
            success: true
          };

          console.log('✅ Proxy scraping successful:', propertyData);

          return NextResponse.json({
            success: true,
            data: propertyData
          });

        } catch (error) {
          lastError = error;
          console.log(`❌ User agent ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
        }
      }

      return NextResponse.json({
        success: false,
        error: 'All user agents failed',
        message: 'Funda is actively blocking all automated requests. This is a known limitation.',
        lastError: lastError instanceof Error ? lastError.message : 'Unknown error',
        suggestion: 'Consider using a different approach or manual data entry.'
      }, { status: 429 });

    } catch (fetchError) {
      console.error('❌ Proxy fetch error:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Proxy fetch failed',
        message: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Proxy API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Proxy API failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
