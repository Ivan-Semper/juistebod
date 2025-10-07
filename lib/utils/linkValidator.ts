/**
 * Validates if a URL is a valid Funda property URL
 * Supports various Funda URL formats:
 * - https://www.funda.nl/koop/amsterdam/huis-12345678-address/
 * - https://www.funda.nl/huur/rotterdam/appartement-87654321-address/
 * - https://www.funda.nl/detail/koop/deil/huis-appeldijk-5/43956018/
 * - https://funda.nl/koop/den-haag/huis-11111111-address/
 */
export function validateFundaUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    
    // Check if it's a Funda domain
    const validDomains = ['funda.nl', 'www.funda.nl'];
    if (!validDomains.includes(urlObj.hostname)) {
      return false;
    }

    // Check for different Funda URL patterns
    const path = urlObj.pathname;
    
    // Pattern 1: Classic format - /koop/city/property-id-address/
    const classicPattern = /\/(koop|huur)\/[^\/]+\/(huis|appartement|woning|studio|kamer|penthouse)-\d{8}-/;
    
    // Pattern 2: Detail format - /detail/koop/city/property-name/property-id/
    const detailPattern = /\/detail\/(koop|huur)\/[^\/]+\/[^\/]+\/\d{8}\/?$/;
    
    // Pattern 3: Alternative detail format - /detail/koop/city/property-type-address/property-id/
    const altDetailPattern = /\/detail\/(koop|huur)\/[^\/]+\/(huis|appartement|woning|studio|kamer|penthouse)-[^\/]+\/\d{8}\/?$/;
    
    return classicPattern.test(path) || detailPattern.test(path) || altDetailPattern.test(path);
  } catch (error) {
    return false;
  }
}

/**
 * Extracts the property ID from a Funda URL
 * Supports both classic and detail URL formats
 */
export function extractPropertyId(url: string): string | null {
  if (!validateFundaUrl(url)) {
    return null;
  }

  // For classic format: extract 8-digit ID from property-id-address pattern
  const classicMatch = url.match(/-(\d{8})-/);
  if (classicMatch) {
    return classicMatch[1];
  }

  // For detail format: extract 8-digit ID from end of URL
  const detailMatch = url.match(/\/(\d{8})\/?$/);
  if (detailMatch) {
    return detailMatch[1];
  }

  return null;
}

/**
 * Normalizes a Funda URL (adds https and www if missing)
 */
export function normalizeFundaUrl(url: string): string {
  if (!url) return '';
  
  let normalizedUrl = url.trim();
  
  // Add protocol if missing
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  
  // Add www if missing
  if (normalizedUrl.includes('funda.nl') && !normalizedUrl.includes('www.funda.nl')) {
    normalizedUrl = normalizedUrl.replace('funda.nl', 'www.funda.nl');
  }
  
  return normalizedUrl;
}

/**
 * Determines the URL format type for debugging
 */
export function getFundaUrlType(url: string): 'classic' | 'detail' | 'unknown' {
  if (!validateFundaUrl(url)) {
    return 'unknown';
  }

  const path = new URL(url).pathname;
  
  if (path.includes('/detail/')) {
    return 'detail';
  } else if (/-\d{8}-/.test(path)) {
    return 'classic';
  }
  
  return 'unknown';
} 