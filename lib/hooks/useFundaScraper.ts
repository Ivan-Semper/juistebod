"use client";

import { useState } from 'react';
import { PropertyData, ScrapingResponse } from '@/lib/types/PropertyTypes';
import { normalizeFundaUrl } from '@/lib/utils/linkValidator';

interface ScrapingMetadata {
  requestId: string;
  duration: number;
  attempts: number;
  scrapedAt: string;
  processingTime: number;
}

interface EnhancedScrapingResponse {
  success: boolean;
  data?: PropertyData;
  error?: string;
  message?: string;
  errorCode?: string;
  metadata?: ScrapingMetadata;
  details?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

interface UseFundaScraperReturn {
  scrapeProperty: (url: string) => Promise<PropertyData | null>;
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
  propertyData: PropertyData | null;
  metadata: ScrapingMetadata | null;
  clearData: () => void;
}

export function useFundaScraper(): UseFundaScraperReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [metadata, setMetadata] = useState<ScrapingMetadata | null>(null);

  const scrapeProperty = async (url: string): Promise<PropertyData | null> => {
    setIsLoading(true);
    setError(null);
    setErrorCode(null);
    setPropertyData(null);
    setMetadata(null);

    try {
      const normalizedUrl = normalizeFundaUrl(url);
      const startTime = Date.now();
      
      // Note: Client-side scraping is not possible due to CORS restrictions
      // Funda blocks cross-origin requests from browsers
      // We'll use server-side scraping with better error handling
      console.log('🖥️ Using server-side scraping...');
      
      // Try the basic scraping API first (most reliable)
      let response = await fetch('/api/scrape-funda-basic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: normalizedUrl }),
        });

        console.log('🔍 Basic API response status:', response.status);

        // If basic API fails, try the simple API
        if (!response.ok && response.status !== 429) {
          console.log('Basic API failed, trying simple API...');
          response = await fetch('/api/scrape-funda-simple', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: normalizedUrl }),
          });
          console.log('🔍 Simple API response status:', response.status);
        }

        // If simple API also fails, try the advanced API
        if (!response.ok && response.status !== 429) {
          console.log('Simple API failed, trying advanced API...');
          response = await fetch('/api/scrape-funda', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: normalizedUrl }),
          });
          console.log('🔍 Advanced API response status:', response.status);
        }

      const result: EnhancedScrapingResponse = await response.json();

      // Set metadata if available
      if (result.metadata) {
        setMetadata({
          ...result.metadata,
          processingTime: result.metadata.processingTime || (Date.now() - startTime),
        });
      }

      if (!response.ok) {
        // Handle different types of errors
        if (response.status === 429) {
          throw new Error('Te veel verzoeken. Wacht 1-2 minuten en probeer opnieuw.');
        } else if (response.status === 400) {
          // Validation errors
          if (result.details && result.details.length > 0) {
            const errorMessages = result.details.map(detail => detail.message).join(', ');
            throw new Error(`Validatie fout: ${errorMessages}`);
          } else {
            throw new Error(result.message || 'Ongeldige aanvraag');
          }
        } else if (response.status === 404) {
          throw new Error(result.message || 'Woning niet gevonden. Probeer de handmatige invoer of controleer of de link correct is.');
        } else {
          // Provide helpful error message with suggestion to use manual form
          const errorMsg = result.message || 'Automatisch ophalen werkt niet. Gebruik de handmatige invoer om door te gaan.';
          throw new Error(errorMsg);
        }
      }

      if (result.success && result.data) {
        setPropertyData(result.data);
        setErrorCode(null);
        
        // Log success for debugging
        console.log('✅ Property scraped successfully:', {
          url: normalizedUrl,
          duration: result.metadata?.duration,
          attempts: result.metadata?.attempts,
          requestId: result.metadata?.requestId,
        });
        
        return result.data;
      } else {
        const errorMessage = result.message || 'Geen woning data ontvangen';
        setErrorCode(result.errorCode || 'UNKNOWN_ERROR');
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Er is een onbekende fout opgetreden';
      setError(errorMessage);
      
      // Log error for debugging
      console.error('❌ Scraping error:', {
        url: url,
        error: errorMessage,
        errorCode: errorCode,
        metadata: metadata,
        fullError: err,
        errorStack: err instanceof Error ? err.stack : 'No stack trace'
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setPropertyData(null);
    setError(null);
    setErrorCode(null);
    setMetadata(null);
  };

  return {
    scrapeProperty,
    isLoading,
    error,
    errorCode,
    propertyData,
    metadata,
    clearData,
  };
} 