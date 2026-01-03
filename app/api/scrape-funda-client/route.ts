/**
 * Client-Side Scraping API
 * Receives HTML from client-side fetch and parses it
 * This avoids IP blocking because the request comes from the user's browser
 */

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { PropertyData } from '@/lib/types/PropertyTypes';
import { logger } from '@/lib/utils/logger';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = randomUUID();
  
  try {
    const body = await request.json();
    const { html, url } = body;

    if (!html || !url) {
      return NextResponse.json({
        success: false,
        error: 'HTML and URL are required',
        message: 'Both HTML content and URL must be provided',
      }, { status: 400 });
    }

    // Validate URL
    if (!url.includes('funda.nl') && !url.includes('jaap.nl')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid URL',
        message: 'Only Funda.nl and Jaap.nl URLs are supported',
      }, { status: 400 });
    }

    logger.info('Parsing client-side scraped HTML', { 
      url, 
      htmlLength: html.length,
      requestId 
    });

    // Parse HTML
    const $ = cheerio.load(html);
    
    // Check for bot detection
    const lowerHtml = html.toLowerCase();
    const botIndicators = [
      'we houden ons platform graag veilig',
      'verifiëren dat onze bezoekers echte mensen zijn',
      'je bent bijna op de pagina die je zoekt',
    ];

    for (const indicator of botIndicators) {
      if (lowerHtml.includes(indicator)) {
        logger.warn('Bot detection page detected in client HTML', { url, indicator, requestId });
        return NextResponse.json({
          success: false,
          error: 'Bot detection detected',
          message: 'Funda detected automated access. Please try again or use manual entry.',
          errorCode: 'BOT_DETECTED',
        }, { status: 403 });
      }
    }

    // Extract property data
    const propertyData: PropertyData = extractPropertyData($, url);

    logger.info('Successfully parsed property data', { 
      url, 
      title: propertyData.title,
      requestId 
    });

    return NextResponse.json({
      success: true,
      data: propertyData,
      metadata: {
        requestId,
        scrapedAt: new Date().toISOString(),
        method: 'client-side',
      },
    }, { status: 200 });

  } catch (error) {
    logger.error('Error parsing client-side HTML', { 
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error instanceof Error ? error : undefined);

    return NextResponse.json({
      success: false,
      error: 'Parsing failed',
      message: error instanceof Error ? error.message : 'Failed to parse property data',
      errorCode: 'PARSING_ERROR',
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    }, { status: 500 });
  }
}

function extractPropertyData($: cheerio.CheerioAPI, url: string): PropertyData {
  // Extract title
  const title = $('h1').first().text().trim() || 
                $('title').text().trim() || 
                'Title not found';

  // Extract address - try multiple strategies
  let address = 'Address not found';
  const addressSelectors = [
    '.object-header__subtitle',
    '[data-test-id="street-name-house-number"]',
    '.object-header h1 + p',
    '.address-text',
  ];

  for (const selector of addressSelectors) {
    const addr = $(selector).first().text().trim();
    if (addr && addr.length > 10 && !addr.includes('€')) {
      address = addr;
      break;
    }
  }

  // Extract price
  const price = $('.object-header__price, [data-test-id="price-label"]')
    .first()
    .text()
    .trim()
    .replace(/\s+/g, ' ') || 'Price not found';

  // Extract location
  const location = $('.object-header__subtitle, [data-test-id="city"]')
    .first()
    .text()
    .trim() || 'Location not found';

  // Extract property type
  const propertyType = $('.object-kenmerken-list dt:contains("Soort woning")')
    .next('dd')
    .text()
    .trim() || 'Property type not found';

  // Extract surface
  const surface = $('.object-kenmerken-list dt:contains("Woonoppervlakte")')
    .next('dd')
    .text()
    .trim() || 'Surface not found';

  // Extract rooms
  const rooms = $('.object-kenmerken-list dt:contains("Aantal kamers")')
    .next('dd')
    .text()
    .trim() || 'Rooms not found';

  // Extract year built
  const yearBuilt = $('.object-kenmerken-list dt:contains("Bouwjaar")')
    .next('dd')
    .text()
    .trim() || 'Year built not found';

  // Extract images
  const images: string[] = [];
  $('.media-gallery img, .object-media img').each((_, element) => {
    const src = $(element).attr('src') || $(element).attr('data-src');
    if (src && !src.includes('placeholder')) {
      images.push(src.startsWith('//') ? `https:${src}` : src);
    }
  });

  // Extract description
  const description = $('.object-description-body, .object-omschrijving')
    .text()
    .trim()
    .substring(0, 500) || 'Description not found';

  // Extract features
  const features: string[] = [];
  $('.object-kenmerken-list dt').each((_, element) => {
    const label = $(element).text().trim();
    const value = $(element).next('dd').text().trim();
    if (label && value) {
      features.push(`${label}: ${value}`);
    }
  });

  return {
    url,
    title,
    address,
    price,
    location,
    propertyType,
    surface,
    rooms,
    yearBuilt,
    images: images.slice(0, 10),
    description,
    features: features.slice(0, 20),
    scrapedAt: new Date().toISOString(),
  };
}

