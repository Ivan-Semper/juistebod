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

    // Simple fetch test
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      }, { status: response.status });
    }

    const html = await response.text();
    
    return NextResponse.json({
      success: true,
      data: {
        url,
        status: response.status,
        contentLength: html.length,
        title: html.includes('<title>') ? 'Title found' : 'No title found',
        hasPropertyData: html.includes('prijs') || html.includes('oppervlakte') || html.includes('kamers')
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
