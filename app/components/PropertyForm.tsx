"use client";

import { useState, FormEvent } from 'react';
import { useFundaScraper } from '@/lib/hooks/useFundaScraper';
import { validateFundaUrl } from '@/lib/utils/linkValidator';
import { motion } from 'framer-motion';

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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <motion.div 
        className="bg-white rounded-full p-2 shadow-lg"
        whileHover={{ 
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          transition: { duration: 0.2 }
        }}
        whileFocus={{ 
          boxShadow: "0 8px 30px rgba(31, 60, 136, 0.15)",
          transition: { duration: 0.2 }
        }}
      >
        <div className="flex items-center">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Plak hier je Funda woninglink"
            className="flex-1 px-6 py-4 text-gray-700 placeholder-gray-500 bg-transparent border-none outline-none text-sm md:text-base min-w-0"
            disabled={isLoading}
          />
          <motion.button 
            type="submit"
            disabled={isLoading || !url.trim()}
            className="text-white px-6 py-4 rounded-full font-medium transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1F3C88' }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(31, 60, 136, 0.3)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ 
              scale: 0.98,
              transition: { duration: 0.1 }
            }}
            animate={{
              boxShadow: "0 4px 15px rgba(31, 60, 136, 0.2)"
            }}
          >
            {isLoading ? 'Analyseren...' : 'Ontvang advies'}
          </motion.button>
        </div>
      </motion.div>

      {validationError && (
        <motion.p 
          className="mt-4 text-red-600 text-center text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {validationError}
        </motion.p>
      )}
      
      {error && (
        <motion.p 
          className="mt-4 text-red-600 text-center text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}

      {isLoading && (
        <motion.div 
          className="mt-4 text-center text-gray-600"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full mr-2"></div>
            Woning gegevens ophalen...
          </div>
        </motion.div>
      )}
    </form>
  );
} 