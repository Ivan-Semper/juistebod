"use client";

import { useState, FormEvent } from 'react';
import { validateFundaUrl } from '@/lib/utils/linkValidator';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertyFormProps {
  onPropertyFound: (propertyData: any) => void;
}

export default function PropertyForm({ onPropertyFound }: PropertyFormProps) {
  const [showFields, setShowFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [formData, setFormData] = useState({
    postcode: '',
    houseNumber: '',
    fundaUrl: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const postcode = formData.postcode.replace(/\s+/g, '').toUpperCase();
    const houseNumber = formData.houseNumber.trim();
    const fundaUrl = formData.fundaUrl.trim();

    if (!postcode || !houseNumber) {
      setValidationError('Postcode en huisnummer zijn verplicht');
      return;
    }

    if (fundaUrl && !validateFundaUrl(fundaUrl)) {
      setValidationError('Voer een geldige Funda woninglink in (optioneel veld)');
      return;
    }

    setIsSubmitting(true);
    try {
      const address = `${postcode} ${houseNumber}`;
      const propertyData = {
        url: fundaUrl || 'Manual entry',
        title: `Woning in ${postcode}`,
        address,
        price: '',
        location: '',
        propertyType: '',
        surface: '',
        rooms: '',
        yearBuilt: '',
        images: [],
        description: '',
        features: [],
        scrapedAt: new Date().toISOString(),
      };

      onPropertyFound(propertyData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          Vul je woninggegevens in
        </h3>
        <p className="text-base text-white/90 mb-6">
          We hebben alleen postcode en huisnummer nodig om de locatie te vinden.
        </p>
        {!showFields && (
          <motion.button
            type="button"
            onClick={() => setShowFields(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/40 bg-white/10 text-white/90 hover:text-white hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Gegevens invullen
            <span className="text-lg leading-none">→</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showFields && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="mt-6 space-y-4 bg-white/75 rounded-2xl shadow-lg p-6 backdrop-blur-sm"
          >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-400 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Bijv: 3815LC"
                    pattern="[0-9]{4}[A-Za-z]{2}"
                    title="Voer een geldige Nederlandse postcode in (bijv: 3815LC)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Huisnummer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="houseNumber"
                    value={formData.houseNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-400 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Bijv: 93"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funda link (optioneel)
                </label>
                <input
                  type="url"
                  name="fundaUrl"
                  value={formData.fundaUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-400 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Plak hier je Funda woninglink"
                />
                <p className="text-xs text-gray-500 mt-2">
                  We gebruiken de link om een zo goed mogelijk bodadvies voor je te maken.
                </p>
              </div>

              {validationError && (
                <p className="text-sm text-red-600">{validationError}</p>
              )}

              <div className="flex justify-center">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'Bezig...' : 'Doorgaan'}
                </motion.button>
              </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}