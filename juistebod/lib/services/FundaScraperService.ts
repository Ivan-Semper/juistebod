import * as cheerio from 'cheerio';
import { PropertyData } from '@/lib/types/PropertyTypes';

export class FundaScraperService {
  private readonly baseHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'nl-NL,nl;q=0.8,en-US;q=0.5,en;q=0.3',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  };

  async scrapeProperty(url: string): Promise<PropertyData | null> {
    try {
      console.log(`🔍 Scraping Funda URL: ${url}`);
      
      const response = await fetch(url, {
        headers: this.baseHeaders,
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract property data using CSS selectors
      const propertyData: PropertyData = {
        url,
        title: this.extractTitle($),
        address: this.extractAddress($, url),
        price: this.extractPrice($),
        location: this.extractLocation($),
        propertyType: this.extractPropertyType($),
        surface: this.extractSurface($),
        rooms: this.extractRooms($),
        yearBuilt: this.extractYearBuilt($),
        images: this.extractImages($),
        description: this.extractDescription($),
        features: this.extractFeatures($),
        scrapedAt: new Date().toISOString(),
      };

      console.log('✅ Successfully scraped property data');
      return propertyData;

    } catch (error) {
      console.error('❌ Error scraping property:', error);
      return null;
    }
  }

  private extractTitle($: cheerio.CheerioAPI): string {
    return $('.object-header__title, h1[data-test-id="street-name-house-number"]')
      .first()
      .text()
      .trim() || 'Title not found';
  }

  private extractAddress($: cheerio.CheerioAPI, url: string): string {
    // Try multiple selectors for address extraction
    const addressSelectors = [
      '.object-header__subtitle',
      '[data-test-id="street-name-house-number"]',
      '.object-header h1 + p',
      '.object-header__address',
      '.address-text',
      'h1 + div',
      '.object-header .subtitle',
      '.object-header div:nth-child(2)',
      '.object-header p'
    ];

    for (const selector of addressSelectors) {
      const address = $(selector).first().text().trim();
      if (address && address.length > 10 && !address.includes('€')) {
        return address;
      }
    }

    // Try to extract from title if available
    const title = this.extractTitle($);
    if (title && title.includes(',')) {
      const parts = title.split(',');
      if (parts.length >= 2) {
        return `${parts[0].trim()}, ${parts[1].trim()}`;
      }
    }

    // Fallback: extract from URL
    return this.extractAddressFromUrl(url) || 'Address not found';
  }

  private extractAddressFromUrl(url: string): string | null {
    try {
      // Extract from Funda URL pattern: /koop/city/huis-streetname-number/id/
      const match = url.match(/\/koop\/([^\/]+)\/huis-([^\/]+)\/\d+\//);
      if (match) {
        const city = match[1].replace(/-/g, ' ');
        const streetWithNumber = match[2].replace(/-/g, ' ');
        
        // Capitalize first letter of each word
        const formattedCity = city.replace(/\b\w/g, l => l.toUpperCase());
        const formattedStreet = streetWithNumber.replace(/\b\w/g, l => l.toUpperCase());
        
        return `${formattedStreet}, ${formattedCity}`;
      }
    } catch (error) {
      console.warn('Could not extract address from URL:', error);
    }
    
    return null;
  }

  private extractPrice($: cheerio.CheerioAPI): string {
    return $('.object-header__price, [data-test-id="price-label"]')
      .first()
      .text()
      .trim()
      .replace(/\s+/g, ' ') || 'Price not found';
  }

  private extractLocation($: cheerio.CheerioAPI): string {
    return $('.object-header__subtitle, [data-test-id="city"]')
      .text()
      .trim() || 'Location not found';
  }

  private extractPropertyType($: cheerio.CheerioAPI): string {
    return $('.object-kenmerken-list dt:contains("Soort woning"), .kenmerken-highlighted__label:contains("Soort")')
      .next('dd, .kenmerken-highlighted__value')
      .text()
      .trim() || 'Property type not found';
  }

  private extractSurface($: cheerio.CheerioAPI): string {
    return $('.object-kenmerken-list dt:contains("Woonoppervlakte"), .kenmerken-highlighted__label:contains("Woonoppervlakte")')
      .next('dd, .kenmerken-highlighted__value')
      .text()
      .trim() || 'Surface not found';
  }

  private extractRooms($: cheerio.CheerioAPI): string {
    return $('.object-kenmerken-list dt:contains("Aantal kamers"), .kenmerken-highlighted__label:contains("kamers")')
      .next('dd, .kenmerken-highlighted__value')
      .text()
      .trim() || 'Rooms not found';
  }

  private extractYearBuilt($: cheerio.CheerioAPI): string {
    return $('.object-kenmerken-list dt:contains("Bouwjaar"), .kenmerken-highlighted__label:contains("Bouwjaar")')
      .next('dd, .kenmerken-highlighted__value')
      .text()
      .trim() || 'Year built not found';
  }

  private extractImages($: cheerio.CheerioAPI): string[] {
    const images: string[] = [];
    
    $('.media-gallery img, .object-media img').each((_, element) => {
      const src = $(element).attr('src') || $(element).attr('data-src');
      if (src && !src.includes('placeholder')) {
        images.push(src.startsWith('//') ? `https:${src}` : src);
      }
    });

    return images.slice(0, 10); // Limit to first 10 images
  }

  private extractDescription($: cheerio.CheerioAPI): string {
    return $('.object-description-body, .object-omschrijving')
      .text()
      .trim()
      .substring(0, 500) || 'Description not found';
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

    return features.slice(0, 20); // Limit to most important features
  }
} 