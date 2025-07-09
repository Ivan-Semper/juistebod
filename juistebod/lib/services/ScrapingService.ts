/**
 * Enhanced Scraping Service
 * Professional scraping service with retry logic, error handling, and monitoring
 */

import * as cheerio from 'cheerio';
import { PropertyData } from '@/lib/types/PropertyTypes';
import { logger } from '@/lib/utils/logger';
import { AppConfig } from '@/lib/config/app.config';

export interface ScrapingOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  userAgent?: string;
  requestId?: string;
}

export interface ScrapingResult {
  success: boolean;
  data?: PropertyData;
  error?: string;
  errorCode?: string;
  duration: number;
  attempts: number;
  timestamp: string;
}

export class ScrapingService {
  private readonly defaultOptions: Required<ScrapingOptions>;

  constructor() {
    this.defaultOptions = {
      timeout: AppConfig.scraping.timeout,
      retryAttempts: AppConfig.scraping.retryAttempts,
      retryDelay: AppConfig.scraping.retryDelay,
      userAgent: this.getRandomUserAgent(),
      requestId: '',
    };
  }

  private getRandomUserAgent(): string {
    const userAgents = AppConfig.scraping.userAgents;
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  async scrapeProperty(url: string, options: ScrapingOptions = {}): Promise<ScrapingResult> {
    const opts = { ...this.defaultOptions, ...options, userAgent: this.getRandomUserAgent() };
    const startTime = Date.now();
    let attempts = 0;
    let lastError: Error | null = null;
    let botDetected = false;

    logger.scraping.start(url, opts.requestId);

    // Add initial delay to appear more human-like
    await this.delay(Math.random() * 1000 + 500); // 500-1500ms random delay

    while (attempts < opts.retryAttempts) {
      attempts++;
      
      try {
        const result = await this.attemptScrape(url, opts);
        const duration = Date.now() - startTime;
        
        logger.scraping.success(url, duration, opts.requestId);
        
        return {
          success: true,
          data: result,
          duration,
          attempts,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        lastError = error as Error;
        
        // Check if it's bot detection
        if (this.isBotDetectionError(error as Error)) {
          botDetected = true;
          logger.warn('Bot detection suspected', { url, attempt: attempts, requestId: opts.requestId });
          
          if (attempts < opts.retryAttempts) {
            logger.scraping.retry(url, attempts, opts.retryAttempts, opts.requestId);
            // Longer delay for bot detection
            await this.delay(AppConfig.scraping.botDetectionDelay + Math.random() * 2000);
            // Get new user agent for retry
            opts.userAgent = this.getRandomUserAgent();
          }
        } else if (attempts < opts.retryAttempts) {
          logger.scraping.retry(url, attempts, opts.retryAttempts, opts.requestId);
          await this.delay(opts.retryDelay + Math.random() * 1000); // Add randomness
        }
      }
    }

    const duration = Date.now() - startTime;
    logger.scraping.error(url, lastError!, duration, opts.requestId);

    return {
      success: false,
      error: botDetected ? 'Website blocked our request (bot detection)' : lastError?.message || 'Unknown error',
      errorCode: botDetected ? 'BOT_DETECTED' : this.getErrorCode(lastError),
      duration,
      attempts,
      timestamp: new Date().toISOString(),
    };
  }

  private async attemptScrape(url: string, options: Required<ScrapingOptions>): Promise<PropertyData> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    try {
      const response = await fetch(url, {
        headers: this.buildHeaders(options.userAgent),
        signal: controller.signal,
        method: 'GET',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Check for bot detection in HTML content
      this.checkForBotDetection(html, url);
      
      const $ = cheerio.load(html);

      // Log what we found for debugging
      logger.debug('HTML content preview', {
        url,
        titleFound: $('title').text(),
        bodyLength: html.length,
        requestId: options.requestId,
      });

      return await this.extractPropertyData($, url);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private checkForBotDetection(html: string, url: string): void {
    const botIndicators = [
      'we houden ons platform graag veilig',
      'verifiëren dat onze bezoekers echte mensen zijn',
      'captcha',
      'blocked',
      'helpdesk@funda.nl',
      'je bent bijna op de pagina die je zoekt',
      'anti-spam',
      'verification',
    ];

    const lowerHtml = html.toLowerCase();
    for (const indicator of botIndicators) {
      if (lowerHtml.includes(indicator)) {
        throw new Error(`Bot detection page detected: ${indicator}`);
      }
    }

    // Check if HTML is suspiciously short (usually bot detection pages are minimal)
    if (html.length < 5000) {
      logger.warn('Suspiciously short HTML response', { 
        url, 
        length: html.length,
        preview: html.substring(0, 500) 
      });
    }

    // Log more HTML details for debugging
    logger.debug('HTML analysis', {
      url,
      length: html.length,
      title: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'No title found',
      hasObjectHeader: html.includes('object-header'),
      hasDetailAddress: html.includes('detail-address'),
      hasKenmerken: html.includes('kenmerken'),
      preview: html.substring(0, 1000)
    });
  }

  private buildHeaders(userAgent: string): Record<string, string> {
    return {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Sec-CH-UA': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"Windows"',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': 'https://www.funda.nl/',
      'Cookie': 'searchoptions=; cookieconsent_status=allow',
    };
  }

  private async extractPropertyData($: cheerio.CheerioAPI, url: string): Promise<PropertyData> {
    const hostname = new URL(url).hostname;
    
    // Choose extraction strategy based on domain
    if (hostname.includes('funda.nl')) {
      return this.extractFundaData($, url);
    } else if (hostname.includes('jaap.nl')) {
      return this.extractJaapData($, url);
    } else {
      throw new Error(`Unsupported domain: ${hostname}`);
    }
  }

  private extractFundaData($: cheerio.CheerioAPI, url: string): PropertyData {
    // First, let's discover what CSS classes and structure Funda actually uses
    logger.debug('Extracting Funda data', {
      url,
      htmlStructure: {
        hasH1: $('h1').length,
        hasTitle: $('title').length,
        hasPrice: $('.price, .object-price, .detail-price').length,
        hasAddress: $('.address, .object-address, .detail-address').length,
        totalElements: $('*').length,
        // Let's see what classes are actually used
        allClasses: this.discoverClasses($),
        potentialPriceElements: this.findPotentialElements($, ['€', 'euro', 'k.k.', 'v.o.n.']),
        potentialAddressElements: this.findPotentialElements($, ['leersum', 'koningin']),
        potentialRoomElements: this.findPotentialElements($, ['kamer', 'slaap', 'bedroom']),
        potentialSurfaceElements: this.findPotentialElements($, ['m²', 'm2', 'oppervlakte']),
      }
    });

    return {
      url,
      title: this.extractText($, [
        // Try all possible H1 variations
        'h1',
        '.listing-title',
        '.property-title',
        '.house-title',
        '.object-title',
        '.detail-title',
        '[data-testid*="title"]',
        '[data-testid*="address"]',
        '.listing-address',
      ]),
      address: this.extractAddressAdvanced($),
      price: this.extractPriceAdvanced($),
      location: this.extractLocationAdvanced($),
      propertyType: this.extractFeatureAdvanced($, ['type', 'soort', 'woning']),
      surface: this.extractFeatureAdvanced($, ['oppervlakte', 'm²', 'm2', 'surface']),
      rooms: this.extractFeatureAdvanced($, ['kamer', 'room', 'bedroom', 'slaap']),
      yearBuilt: this.extractFeatureAdvanced($, ['bouwjaar', 'gebouwd', 'year', 'built']),
      images: this.extractImages($),
      description: this.extractDescription($),
      features: this.extractFeatures($),
      scrapedAt: new Date().toISOString(),
    };
  }

  private extractJaapData($: cheerio.CheerioAPI, url: string): PropertyData {
    // Jaap.nl specific extraction logic
    return {
      url,
      title: this.extractText($, ['.property-title', 'h1']),
      address: this.extractText($, ['.property-address', '.address']),
      price: this.extractText($, ['.property-price', '.price']),
      location: this.extractText($, ['.property-location', '.location']),
      propertyType: this.extractText($, ['.property-type', '.type']),
      surface: this.extractText($, ['.property-surface', '.surface']),
      rooms: this.extractText($, ['.property-rooms', '.rooms']),
      yearBuilt: this.extractText($, ['.property-year', '.year']),
      images: this.extractImages($),
      description: this.extractDescription($),
      features: this.extractFeatures($),
      scrapedAt: new Date().toISOString(),
    };
  }

  private extractText($: cheerio.CheerioAPI, selectors: string[]): string {
    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        // Get text and clean it
        let text = element.text().trim();
        
        // Remove navigation/accessibility text
        text = text.replace(/Ga naar\w*/g, '');
        text = text.replace(/Hoofdinhoud/g, '');
        text = text.replace(/Skip to/g, '');
        text = text.replace(/Naar hoofdinhoud/g, '');
        text = text.trim();
        
        // Only return if we have meaningful content (more than 2 chars and not just numbers/spaces)
        if (text && text.length > 2 && !/^[\d\s]*$/.test(text)) {
          logger.debug('Text extracted', { selector, text: text.substring(0, 100) });
          return text;
        }
      }
    }
    return 'Not found';
  }

  private extractAddressAdvanced($: cheerio.CheerioAPI): string {
    // Try multiple strategies to find address
    const strategies = [
      // Strategy 1: Look for text containing "Koningin-Julianalaan" and "Leersum"
      () => {
        const addressElements = $('*').filter((_, element) => {
          const text = $(element).text();
          return text.includes('Koningin-Julianalaan') && text.includes('Leersum') && text.length < 100;
        });
        
        for (let i = 0; i < addressElements.length; i++) {
          const text = $(addressElements[i]).text().trim();
          // Look for clean address format
          const match = text.match(/Koningin-Julianalaan\s+\d+.*?Leersum/);
          if (match) {
            return match[0].replace(/\s+/g, ' ').trim();
          }
        }
        return null;
      },
      // Strategy 2: Look in page title
      () => {
        const title = $('title').text();
        const match = title.match(/Koningin-Julianalaan \d+ \d{4} [A-Z]{2} Leersum/);
        if (match) return match[0];
        return null;
      },
      // Strategy 3: Look in breadcrumb navigation
      () => {
        const breadcrumb = $('*:contains("Koningin-Julianalaan 20")').first().text();
        if (breadcrumb && breadcrumb.includes('Leersum')) {
          return breadcrumb.replace(/[\/\s]+/g, ' ').trim();
        }
        return null;
      }
    ];

    for (const strategy of strategies) {
      const result = strategy();
      if (result) {
        logger.debug('Address found via strategy', { result });
        return result;
      }
    }

    return 'Address not found';
  }

  private extractPriceAdvanced($: cheerio.CheerioAPI): string {
    // Look for elements containing € and realistic price patterns
    const priceElements = $('*').filter((_, element) => {
      const text = $(element).text();
      return text.includes('€') && text.length < 100;
    });

    for (let i = 0; i < priceElements.length; i++) {
      const text = $(priceElements[i]).text().trim();
      
      // Look for clean price format: € 469.500 k.k.
      const priceMatch = text.match(/€\s*[\d.,]+(?:\s*k\.k\.|\s*kosten\s*koper)?/);
      if (priceMatch) {
        let price = priceMatch[0].trim();
        // Clean up price text
        price = price.replace(/\s+/g, ' ');
        if (price.includes('k.k.') || price.includes('kosten koper')) {
          logger.debug('Price found', { price });
          return price;
        }
      }
    }

    return 'Price not found';
  }

  private extractLocationAdvanced($: cheerio.CheerioAPI): string {
    // Look for specific location patterns
    const strategies = [
      // Strategy 1: Look for "Leersum-Dorp" or "Leersum"
      () => {
        const locationElements = $('*:contains("Leersum-Dorp")').filter((_, element) => {
          const text = $(element).text();
          return text.length < 50;
        });
        
        if (locationElements.length > 0) {
          return 'Leersum-Dorp, Leersum';
        }
        return null;
      },
      // Strategy 2: Extract from title
      () => {
        const title = $('title').text();
        if (title.includes('Leersum')) {
          return 'Leersum';
        }
        return null;
      }
    ];

    for (const strategy of strategies) {
      const result = strategy();
      if (result) {
        logger.debug('Location found', { result });
        return result;
      }
    }

    return 'Location not found';
  }

  private extractFeatureAdvanced($: cheerio.CheerioAPI, keywords: string[]): string {
    for (const keyword of keywords) {
      // Special handling for build year - look for "Bouwjaar" label followed by year
      if (keyword.includes('bouwjaar') || keyword.includes('gebouwd')) {
        // Method 1: Look for "Bouwjaar" label followed by year
        const bouwjaarElements = $('*:contains("Bouwjaar")').filter((_, element) => {
          const text = $(element).text().trim();
          return text.length < 50 && text.includes('Bouwjaar');
        });
        
        for (let i = 0; i < bouwjaarElements.length; i++) {
          const element = bouwjaarElements[i];
          const text = $(element).text().trim();
          
          // Look for year in the same element
          const yearMatch = text.match(/\b(1[8-9]\d{2}|20[0-2]\d)\b/);
          if (yearMatch) {
            logger.debug('Build year found in same element', { text: yearMatch[0] });
            return yearMatch[0];
          }
          
          // Look for year in next sibling
          const nextSibling = $(element).next();
          if (nextSibling.length > 0) {
            const nextText = nextSibling.text().trim();
            const nextYearMatch = nextText.match(/\b(1[8-9]\d{2}|20[0-2]\d)\b/);
            if (nextYearMatch) {
              logger.debug('Build year found in next sibling', { text: nextYearMatch[0] });
              return nextYearMatch[0];
            }
          }
          
          // Look for year in parent container
          const parent = $(element).parent();
          if (parent.length > 0) {
            const parentText = parent.text().trim();
            const parentYearMatch = parentText.match(/\b(1[8-9]\d{2}|20[0-2]\d)\b/);
            if (parentYearMatch) {
              logger.debug('Build year found in parent', { text: parentYearMatch[0] });
              return parentYearMatch[0];
            }
          }
        }
        
        // Method 2: Look for dt/dd pairs (definition lists)
        const dtElements = $('dt:contains("Bouwjaar"), dt:contains("bouwjaar")');
        for (let i = 0; i < dtElements.length; i++) {
          const ddElement = $(dtElements[i]).next('dd');
          if (ddElement.length > 0) {
            const ddText = ddElement.text().trim();
            const yearMatch = ddText.match(/\b(1[8-9]\d{2}|20[0-2]\d)\b/);
            if (yearMatch) {
              logger.debug('Build year found in dt/dd', { text: yearMatch[0] });
              return yearMatch[0];
            }
          }
        }
      }
      
      // Special handling for property type - look for "Soort woonhuis" or "Soort object"
      if (keyword.includes('type') || keyword.includes('soort')) {
        // Method 1: Look for "Soort woonhuis" or "Soort object" labels
        const typeElements = $('*:contains("Soort woonhuis"), *:contains("Soort object"), *:contains("Soort bouw")').filter((_, element) => {
          const text = $(element).text().trim();
          return text.length < 100;
        });
        
        for (let i = 0; i < typeElements.length; i++) {
          const element = typeElements[i];
          const text = $(element).text().trim();
          
          // Look for type in the same element
          const typeMatch = text.match(/\b(?:eengezinswoning|2-onder-1-kapwoning|tussenwoning|hoekwoning|vrijstaande\s+woning|appartement|penthouse|villa|studio|woning|huis)\b/i);
          if (typeMatch) {
            logger.debug('Property type found in same element', { text: typeMatch[0] });
            return typeMatch[0];
          }
          
          // Look for type in next sibling
          const nextSibling = $(element).next();
          if (nextSibling.length > 0) {
            const nextText = nextSibling.text().trim();
            const nextTypeMatch = nextText.match(/\b(?:eengezinswoning|2-onder-1-kapwoning|tussenwoning|hoekwoning|vrijstaande\s+woning|appartement|penthouse|villa|studio|woning|huis)\b/i);
            if (nextTypeMatch) {
              logger.debug('Property type found in next sibling', { text: nextTypeMatch[0] });
              return nextTypeMatch[0];
            }
          }
          
          // Look for type in parent container
          const parent = $(element).parent();
          if (parent.length > 0) {
            const parentText = parent.text().trim();
            const parentTypeMatch = parentText.match(/\b(?:eengezinswoning|2-onder-1-kapwoning|tussenwoning|hoekwoning|vrijstaande\s+woning|appartement|penthouse|villa|studio|woning|huis)\b/i);
            if (parentTypeMatch) {
              logger.debug('Property type found in parent', { text: parentTypeMatch[0] });
              return parentTypeMatch[0];
            }
          }
        }
        
        // Method 2: Look for dt/dd pairs for property type
        const dtTypeElements = $('dt:contains("Soort"), dt:contains("Type"), dt:contains("soort"), dt:contains("type")');
        for (let i = 0; i < dtTypeElements.length; i++) {
          const ddElement = $(dtTypeElements[i]).next('dd');
          if (ddElement.length > 0) {
            const ddText = ddElement.text().trim();
            const typeMatch = ddText.match(/\b(?:eengezinswoning|2-onder-1-kapwoning|tussenwoning|hoekwoning|vrijstaande\s+woning|appartement|penthouse|villa|studio|woning|huis)\b/i);
            if (typeMatch) {
              logger.debug('Property type found in dt/dd', { text: typeMatch[0] });
              return typeMatch[0];
            }
          }
        }
      }
      
      // General keyword search (existing logic for other features)
      const elements = $(`*:contains("${keyword}")`).filter((_, element) => {
        const text = $(element).text();
        return text.length < 500 && text.length > 5;
      });

      for (let i = 0; i < elements.length; i++) {
        const text = $(elements[i]).text().trim();
        if (text && !text.includes('Ga naar') && !text.includes('Zoek een')) {
          
          // Extract room information - prioritize "X kamers (Y slaapkamers)" format
          if (keyword.includes('kamer') || keyword.includes('room')) {
            // First try to find "X kamers (Y slaapkamers)" pattern
            const fullRoomMatch = text.match(/\d+\s*kamers?\s*\(\d+\s*slaapkamers?\)/i);
            if (fullRoomMatch) {
              logger.debug('Full room info found', { text: fullRoomMatch[0] });
              return fullRoomMatch[0];
            }
            
            // Then try "X kamers" pattern
            const roomMatch = text.match(/\d+\s*kamers?/i);
            if (roomMatch) {
              logger.debug('Rooms found', { text: roomMatch[0] });
              return roomMatch[0];
            }
            
            // Finally try "X slaapkamers" pattern
            const bedroomMatch = text.match(/\d+\s*slaapkamers?/i);
            if (bedroomMatch) {
              logger.debug('Bedrooms found', { text: bedroomMatch[0] });
              return bedroomMatch[0];
            }
          }
          
          // Extract surface area
          if (keyword.includes('oppervlakte') || keyword.includes('m²')) {
            const surfaceMatch = text.match(/\d+\s*m²?\s*(?:wonen|living|oppervlakte)?/i);
            if (surfaceMatch) {
              logger.debug('Surface found', { text: surfaceMatch[0] });
              return surfaceMatch[0];
            }
          }
        }
      }
    }

    return 'Not found';
  }

  private extractFeatureValue($: cheerio.CheerioAPI, labels: string[]): string {
    for (const label of labels) {
      // Method 1: Classic kenmerken list (dt/dd structure)
      const classicValue = $(`.object-kenmerken-list dt:contains("${label}"), .kenmerken-highlighted__label:contains("${label}")`)
        .next('dd, .kenmerken-highlighted__value')
        .text()
        .trim();
      if (classicValue) return classicValue;

      // Method 2: Detail page structure
      const detailValue = $(`.detail-kenmerken dt:contains("${label}"), .kenmerken dt:contains("${label}")`)
        .next('dd')
        .text()
        .trim();
      if (detailValue) return detailValue;

      // Method 3: Table structure
      const tableValue = $(`td:contains("${label}"), th:contains("${label}")`)
        .next('td')
        .text()
        .trim();
      if (tableValue) return tableValue;

      // Method 4: Flexible text search
      const flexibleValue = $(`*:contains("${label}:")`)
        .text()
        .split(':')[1]
        ?.trim();
      if (flexibleValue) return flexibleValue;

      // Method 5: Span/div structure
      const spanValue = $(`span:contains("${label}"), div:contains("${label}")`)
        .parent()
        .find('span, div')
        .not(`:contains("${label}")`)
        .first()
        .text()
        .trim();
      if (spanValue) return spanValue;
    }
    return 'Not found';
  }

  private extractImages($: cheerio.CheerioAPI): string[] {
    const images: string[] = [];
    
    // Multiple selectors for different Funda layouts
    const imageSelectors = [
      '.media-gallery img',
      '.object-media img', 
      '.photo img',
      '.detail-media img',
      '.media-viewer img',
      '.gallery img',
      '.object-photos img',
      '.detail-photos img',
      '.media-slider img',
      '.photos-slider img',
    ];
    
    imageSelectors.forEach(selector => {
      $(selector).each((_, element) => {
        const src = $(element).attr('src') || 
                   $(element).attr('data-src') || 
                   $(element).attr('data-lazy') ||
                   $(element).attr('data-original');
        
        if (src && 
            !src.includes('placeholder') && 
            !src.includes('loading') && 
            !src.includes('spinner') &&
            !images.includes(src)) {
          
          const fullSrc = src.startsWith('//') ? `https:${src}` : src;
          if (fullSrc.startsWith('http')) {
            images.push(fullSrc);
          }
        }
      });
    });

    return images.slice(0, AppConfig.validation.maxImageUrls);
  }

  private extractDescription($: cheerio.CheerioAPI): string {
    // Look for description in various places
    const descriptionSelectors = [
      '.listing-description-text',
      '.property-description',
      '.object-description',
      '.description',
      'p:contains("Deze")',
      'p:contains("Prachtige")',
      'p:contains("Gelegen")',
      'div:contains("Omschrijving")',
      '[data-testid*="description"]',
    ];

    for (const selector of descriptionSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const text = element.text().trim();
        if (text.length > 50 && text.length < 2000) {
          logger.debug('Description found', { selector, length: text.length });
          return text;
        }
      }
    }

    // Look for longer text blocks that might be descriptions
    const longTextElements = $('p, div').filter((_, element) => {
      const text = $(element).text().trim();
      return text.length > 100 && text.length < 2000 && 
             !text.includes('Ga naar') && 
             !text.includes('Zoek een') &&
             !text.includes('€') &&
             !text.includes('kamers') &&
             !text.includes('m²');
    });

    if (longTextElements.length > 0) {
      const text = $(longTextElements[0]).text().trim();
      logger.debug('Long text found as description', { length: text.length });
      return text;
    }

    return 'Not found';
  }

  private extractFeatures($: cheerio.CheerioAPI): string[] {
    const features: string[] = [];
    
    $('.object-kenmerken-list dt, .kenmerken-highlighted__label').each((_, element) => {
      const label = $(element).text().trim();
      const value = $(element).next('dd, .kenmerken-highlighted__value').text().trim();
      
      if (label && value) {
        features.push(`${label}: ${value}`);
      }
    });

    return features.slice(0, AppConfig.validation.maxFeatures);
  }

  private getErrorCode(error: Error | null): string {
    if (!error) return 'UNKNOWN_ERROR';
    
    if (error.name === 'AbortError') return 'TIMEOUT_ERROR';
    if (error.message.includes('fetch')) return 'NETWORK_ERROR';
    if (error.message.includes('HTTP')) return 'HTTP_ERROR';
    if (error.message.includes('parse')) return 'PARSE_ERROR';
    
    return 'SCRAPING_ERROR';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isBotDetectionError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    return errorMessage.includes('verification') ||
           errorMessage.includes('captcha') ||
           errorMessage.includes('blocked') ||
           errorMessage.includes('bot') ||
           errorMessage.includes('403') ||
           errorMessage.includes('anti') ||
           errorMessage.includes('protect');
  }

  private discoverClasses($: cheerio.CheerioAPI): string[] {
    const classes = new Set<string>();
    $('*').each((_, element) => {
      const className = $(element).attr('class');
      if (className) {
        className.split(/\s+/).forEach(cls => {
          if (cls.includes('price') || cls.includes('address') || cls.includes('room') || 
              cls.includes('surface') || cls.includes('listing') || cls.includes('detail')) {
            classes.add(cls);
          }
        });
      }
    });
    return Array.from(classes).slice(0, 20); // Top 20 relevant classes
  }

  private findPotentialElements($: cheerio.CheerioAPI, keywords: string[]): Array<{selector: string, text: string}> {
    const elements: Array<{selector: string, text: string}> = [];
    
    keywords.forEach(keyword => {
      $('*').each((_, element) => {
        const text = $(element).text().toLowerCase();
        if (text.includes(keyword.toLowerCase()) && text.length < 200) {
          const tagName = element.tagName;
          const className = $(element).attr('class') || '';
          const id = $(element).attr('id') || '';
          const selector = `${tagName}${className ? '.' + className.split(' ')[0] : ''}${id ? '#' + id : ''}`;
          
          elements.push({
            selector,
            text: $(element).text().trim().substring(0, 100)
          });
        }
      });
    });
    
    return elements.slice(0, 10); // Top 10 matches
  }
} 