/**
 * Professional Funda Scraping API
 * Enhanced API route with validation, rate limiting, and comprehensive error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { ScrapingService } from '@/lib/services/ScrapingService';
import { RequestValidator, RateLimiter, PerformanceMonitor } from '@/lib/middleware/validation.middleware';
import { logger } from '@/lib/utils/logger';
import { AppConfig } from '@/lib/config/app.config';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = randomUUID();
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  
  // Start performance monitoring
  PerformanceMonitor.startRequest(requestId);
  
  try {
    // Rate limiting check
    if (RateLimiter.isRateLimited(clientIP)) {
      logger.warn('Rate limit exceeded', { clientIP, requestId });
      return RateLimiter.createRateLimitResponse();
    }

    // Request validation
    const requestValidation = RequestValidator.validateScrapingRequest(request);
    if (!requestValidation.isValid) {
      logger.warn('Request validation failed', { 
        errors: requestValidation.errors, 
        clientIP, 
        requestId 
      });
      return RequestValidator.createErrorResponse(requestValidation.errors);
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      logger.error('Invalid JSON in request body', { clientIP, requestId }, error as Error);
      return RequestValidator.createErrorResponse([
        {
          field: 'body',
          message: 'Invalid JSON format',
          code: 'INVALID_JSON',
        },
      ]);
    }

    const bodyValidation = await RequestValidator.validateScrapingBody(body);
    if (!bodyValidation.isValid) {
      logger.warn('Body validation failed', { 
        errors: bodyValidation.errors, 
        clientIP, 
        requestId 
      });
      return RequestValidator.createErrorResponse(bodyValidation.errors);
    }

    // Initialize scraping service
    const scrapingService = new ScrapingService();
    
    // Log the start of scraping
    logger.info('Starting property scraping', { 
      url: body.url, 
      clientIP, 
      requestId,
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // Perform the scraping
    const result = await scrapingService.scrapeProperty(body.url, {
      requestId,
      timeout: AppConfig.scraping.timeout,
      retryAttempts: AppConfig.scraping.retryAttempts,
    });

    // End performance monitoring
    const duration = PerformanceMonitor.endRequest(requestId);

    // Log the result
    logger.request('POST', '/api/scrape-funda', result.success ? 200 : 404, duration, requestId);

    if (result.success) {
      logger.info('Property scraping successful', { 
        url: body.url, 
        duration: result.duration, 
        attempts: result.attempts,
        clientIP, 
        requestId 
      });

      return NextResponse.json({
        success: true,
        data: result.data,
        metadata: {
          requestId,
          duration: result.duration,
          attempts: result.attempts,
          scrapedAt: result.timestamp,
          processingTime: duration,
        },
      }, { status: 200 });
    } else {
      logger.warn('Property scraping failed', { 
        url: body.url, 
        error: result.error,
        errorCode: result.errorCode,
        duration: result.duration, 
        attempts: result.attempts,
        clientIP, 
        requestId 
      });

      return NextResponse.json({
        success: false,
        error: 'Scraping failed',
        message: result.error || 'Could not extract property information',
        errorCode: result.errorCode,
        metadata: {
          requestId,
          duration: result.duration,
          attempts: result.attempts,
          timestamp: result.timestamp,
          processingTime: duration,
        },
      }, { status: 404 });
    }
  } catch (error) {
    const duration = PerformanceMonitor.endRequest(requestId);
    
    logger.error('Unexpected error in scraping endpoint', { 
      clientIP, 
      requestId,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error instanceof Error ? error : undefined);

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request',
      errorCode: 'INTERNAL_ERROR',
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime: duration,
      },
    }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  const requestId = randomUUID();
  
  logger.info('API info request', { requestId });

  return NextResponse.json({
    message: 'JuisteBod Scraping API',
    version: AppConfig.api.version,
    environment: AppConfig.api.environment,
    endpoints: {
      'POST /api/scrape-funda': 'Scrape property data from supported real estate websites',
    },
    supportedDomains: AppConfig.scraping.allowedDomains,
    rateLimit: {
      maxRequests: AppConfig.rateLimit.maxRequests,
      windowMs: AppConfig.rateLimit.windowMs,
    },
    config: {
      timeout: AppConfig.scraping.timeout,
      retryAttempts: AppConfig.scraping.retryAttempts,
      maxConcurrentRequests: AppConfig.scraping.maxConcurrentRequests,
    },
    status: 'operational',
    timestamp: new Date().toISOString(),
    requestId,
  }, { 
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=300', // 5 minutes
    },
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': AppConfig.api.corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 