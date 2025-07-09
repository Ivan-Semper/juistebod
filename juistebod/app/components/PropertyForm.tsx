"use client";

import { useState, FormEvent } from 'react';
import { useFundaScraper } from '@/lib/hooks/useFundaScraper';
import { validateFundaUrl } from '@/lib/utils/linkValidator';

interface PropertyFormProps {
  onPropertyFound: (propertyData: any) => void;
}

export default function PropertyForm({ onPropertyFound }: PropertyFormProps) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const { scrapeProperty, isLoading, error } = useFundaScraper();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!url.trim()) {
      setValidationError('Voer een Funda link in');
      return;
    }

    if (!validateFundaUrl(url)) {
      setValidationError('Voer een geldige Funda woninglink in');
      return;
    }

    const propertyData = await scrapeProperty(url);
    if (propertyData) {
      onPropertyFound(propertyData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-full p-2 shadow-lg">
        <div className="flex items-center">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Plak hier je woninglink (Funda, Jaap, etc.)"
            className="flex-1 px-6 py-4 text-gray-700 placeholder-gray-500 bg-transparent border-none outline-none text-sm md:text-base"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={isLoading || !url.trim()}
            className="text-white px-6 py-4 rounded-full font-medium transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1F3C88' }}
          >
            {isLoading ? 'Analyseren...' : 'Ontvang advies'}
          </button>
        </div>
      </div>

      {validationError && (
        <p className="mt-4 text-red-600 text-center text-sm">
          {validationError}
        </p>
      )}
      
      {error && (
        <p className="mt-4 text-red-600 text-center text-sm">
          {error}
        </p>
      )}

      {isLoading && (
        <div className="mt-4 text-center text-gray-600">
          <div className="inline-flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full mr-2"></div>
            Woning gegevens ophalen...
          </div>
        </div>
      )}
    </form>
  );
} 