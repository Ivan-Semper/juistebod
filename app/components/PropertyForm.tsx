"use client";

import { useState, FormEvent } from 'react';
import { useFundaScraper } from '@/lib/hooks/useFundaScraper';
import { validateFundaUrl } from '@/lib/utils/linkValidator';
import { motion } from 'framer-motion';

interface PropertyFormProps {
  onPropertyFound: (propertyData: any) => void;
  onShowManualForm?: () => void;
}

export default function PropertyForm({ onPropertyFound, onShowManualForm }: PropertyFormProps) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showManualOption, setShowManualOption] = useState(true); // Always show manual option
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
    <div className="w-full max-w-2xl mx-auto">
      {/* Manual Entry - Prominent Option */}
      {onShowManualForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                📝 Handmatige Invoer
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Voer je woninggegevens direct in. Werkt altijd en is snel!
              </p>
              <motion.button
                onClick={onShowManualForm}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium shadow-md hover:shadow-lg transition-all border-2 border-blue-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start met handmatige invoer →
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Divider */}
      {onShowManualForm && (
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">of</span>
          </div>
        </div>
      )}

      {/* Automatic Scraping Form */}
      <form onSubmit={handleSubmit} className="w-full">
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
              placeholder="Plak hier je Funda woninglink (optioneel)"
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
              {isLoading ? 'Analyseren...' : 'Probeer automatisch'}
            </motion.button>
          </div>
        </motion.div>
      </form>

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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <p className="text-red-600 text-sm text-center mb-3">
            {error}
          </p>
          {onShowManualForm && (
            <div className="text-center">
              <motion.button
                onClick={onShowManualForm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Gebruik handmatige invoer →
              </motion.button>
            </div>
          )}
        </motion.div>
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
    </div>
  );
} 