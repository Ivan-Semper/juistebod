import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    console.log('🔍 Debug scraping for URL:', url);

    // Test basic fetch
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        }
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        });
      }

      const html = await response.text();
      console.log('📊 HTML length:', html.length);
      console.log('📊 HTML preview:', html.substring(0, 500));

      // Check for bot detection
      const botDetectionKeywords = ['bot', 'blocked', 'captcha', 'access denied', 'forbidden'];
      const hasBotDetection = botDetectionKeywords.some(keyword => 
        html.toLowerCase().includes(keyword)
      );

      return NextResponse.json({
        success: true,
        data: {
          url,
          status: response.status,
          contentLength: html.length,
          hasBotDetection,
          title: html.includes('<title>') ? 'Title found' : 'No title found',
          hasPropertyData: html.includes('prijs') || html.includes('oppervlakte') || html.includes('kamers'),
          htmlPreview: html.substring(0, 200),
          headers: Object.fromEntries(response.headers.entries())
        }
      });

    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Fetch failed',
        message: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
        stack: fetchError instanceof Error ? fetchError.stack : 'No stack trace'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 });
  }
}
