/**
 * Request Validation Middleware
 * Validates and sanitizes incoming requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { AppConfig } from '@/lib/config/app.config';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: any;
}

export class RequestValidator {
  static validateScrapingRequest(request: NextRequest): ValidationResult {
    const errors: ValidationError[] = [];
    
    try {
      // Check content type
      const contentType = request.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        errors.push({
          field: 'content-type',
          message: 'Content-Type must be application/json',
          code: 'INVALID_CONTENT_TYPE',
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      logger.error('Request validation error', { error });
      errors.push({
        field: 'request',
        message: 'Invalid request format',
        code: 'INVALID_REQUEST',
      });
      
      return {
        isValid: false,
        errors,
      };
    }
  }

  static async validateScrapingBody(body: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    
    try {
      // Check if body exists
      if (!body) {
        errors.push({
          field: 'body',
          message: 'Request body is required',
          code: 'MISSING_BODY',
        });
        return { isValid: false, errors };
      }

      // Check URL field
      if (!body.url) {
        errors.push({
          field: 'url',
          message: 'URL is required',
          code: 'MISSING_URL',
        });
      } else if (typeof body.url !== 'string') {
        errors.push({
          field: 'url',
          message: 'URL must be a string',
          code: 'INVALID_URL_TYPE',
        });
      } else if (body.url.length > AppConfig.validation.maxUrlLength) {
        errors.push({
          field: 'url',
          message: `URL too long (max ${AppConfig.validation.maxUrlLength} characters)`,
          code: 'URL_TOO_LONG',
        });
      } else {
        // Validate URL format
        try {
          new URL(body.url);
        } catch {
          errors.push({
            field: 'url',
            message: 'Invalid URL format',
            code: 'INVALID_URL_FORMAT',
          });
        }
      }

      // Check for allowed domains
      if (body.url && typeof body.url === 'string') {
        try {
          const urlObj = new URL(body.url);
          if (!AppConfig.scraping.allowedDomains.includes(urlObj.hostname)) {
            errors.push({
              field: 'url',
              message: `Domain not allowed. Allowed domains: ${AppConfig.scraping.allowedDomains.join(', ')}`,
              code: 'DOMAIN_NOT_ALLOWED',
            });
          }
        } catch {
          // URL validation error already handled above
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        data: body,
      };
    } catch (error) {
      logger.error('Body validation error', { error });
      errors.push({
        field: 'body',
        message: 'Invalid request body format',
        code: 'INVALID_BODY_FORMAT',
      });
      
      return {
        isValid: false,
        errors,
      };
    }
  }

  static createErrorResponse(
    errors: ValidationError[],
    status: number = 400
  ): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        message: 'Request validation failed',
        details: errors,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }
}

export class RateLimiter {
  private static requests = new Map<string, number[]>();

  static isRateLimited(ip: string): boolean {
    const now = Date.now();
    const windowStart = now - AppConfig.rateLimit.windowMs;
    
    // Get existing requests for this IP
    const ipRequests = this.requests.get(ip) || [];
    
    // Filter out requests outside the window
    const validRequests = ipRequests.filter(timestamp => timestamp > windowStart);
    
    // Update the map
    this.requests.set(ip, validRequests);
    
    // Check if rate limit is exceeded
    if (validRequests.length >= AppConfig.rateLimit.maxRequests) {
      logger.warn('Rate limit exceeded', { ip, requestCount: validRequests.length });
      return true;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(ip, validRequests);
    
    return false;
  }

  static createRateLimitResponse(): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${AppConfig.rateLimit.maxRequests} per ${AppConfig.rateLimit.windowMs / 1000} seconds`,
        timestamp: new Date().toISOString(),
      },
      { status: 429 }
    );
  }
}

// Performance monitoring middleware
export class PerformanceMonitor {
  private static activeRequests = new Map<string, number>();

  static startRequest(requestId: string): void {
    this.activeRequests.set(requestId, Date.now());
  }

  static endRequest(requestId: string): number {
    const startTime = this.activeRequests.get(requestId);
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    this.activeRequests.delete(requestId);
    
    return duration;
  }

  static getActiveRequestsCount(): number {
    return this.activeRequests.size;
  }
} 