import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
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

    // Add random delay to appear more human
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    // Try to fetch with different strategies
    const strategies = [
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      },
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        }
      }
    ];

    let lastError;
    for (let i = 0; i < strategies.length; i++) {
      try {
        // Add delay between attempts
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: strategies[i].headers,
          redirect: 'follow',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        
        // Check for bot detection
        if (html.includes('bot') || html.includes('blocked') || html.includes('captcha')) {
          throw new Error('Bot detection triggered');
        }

        const $ = cheerio.load(html);
        
        // Extract basic property data
        const propertyData = {
          title: $('h1').first().text().trim() || $('title').text().trim(),
          price: $('[data-testid="price"]').text().trim() || 
                 $('.object-header__price').text().trim() ||
                 $('.price').text().trim(),
          address: $('[data-testid="address"]').text().trim() ||
                  $('.object-header__address').text().trim() ||
                  $('.address').text().trim(),
          description: $('[data-testid="description"]').text().trim() ||
                      $('.object-description').text().trim() ||
                      $('.description').text().trim(),
          images: $('img').map((_, el) => $(el).attr('src')).get().filter(src => src && src.includes('funda')),
          url: url,
          scrapedAt: new Date().toISOString()
        };

        return NextResponse.json({
          success: true,
          data: propertyData,
          strategy: i + 1,
          contentLength: html.length
        });

      } catch (error) {
        lastError = error;
        console.log(`Strategy ${i + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    return NextResponse.json({
      success: false,
      error: 'All scraping strategies failed',
      message: lastError instanceof Error ? lastError.message : 'Unknown error',
      note: 'Funda may be blocking automated requests. Try again later or use a different approach.'
    }, { status: 429 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Scraping failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
