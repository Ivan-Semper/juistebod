"use client";

import { useState, FormEvent } from 'react';
import { validateFundaUrl } from '@/lib/utils/linkValidator';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertyFormProps {
  onPropertyFound: (propertyData: any) => void;
}

export default function PropertyForm({ onPropertyFound }: PropertyFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [formData, setFormData] = useState({
    postcode: '',
    houseNumber: '',
    fundaUrl: '',
    email: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const postcode = formData.postcode.replace(/\s+/g, '').toUpperCase();
    const houseNumber = formData.houseNumber.trim();
    const fundaUrl = formData.fundaUrl.trim();
    const email = formData.email.trim();

    if (!postcode || !houseNumber) {
      setValidationError('Postcode en huisnummer zijn verplicht');
      return;
    }

    if (!fundaUrl) {
      setValidationError('Funda link is verplicht');
      return;
    }

    if (!validateFundaUrl(fundaUrl)) {
      setValidationError('Voer een geldige Funda woninglink in');
      return;
    }

    // Store email for abandoned cart reminder (if provided)
    if (email && /\S+@\S+\.\S+/.test(email)) {
      try {
        localStorage.setItem('pendingEmail', email);
      } catch {
        // ignore
      }
      fetch('/api/pending-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {/* ignore */});
    }

    setIsSubmitting(true);
    try {
      const fallbackAddress = `${postcode} ${houseNumber}`;
      let resolvedAddress = fallbackAddress;

      try {
        const response = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postcode, houseNumber }),
        });
        const data = await response.json();
        if (response.ok && data?.success && data.formattedAddress) {
          resolvedAddress = data.formattedAddress;
        }
      } catch {
        // Fallback to postcode + huisnummer
      }

      if (!resolvedAddress.includes(houseNumber)) {
        resolvedAddress = `${resolvedAddress} ${houseNumber}`.trim();
      }

      const propertyData = {
        url: fundaUrl,
        title: resolvedAddress,
        address: resolvedAddress,
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
        pendingEmail: email || undefined,
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
        {!showForm && (
          <div>
            <motion.button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-semibold text-[#1F3C88] shadow-xl transition-colors hover:bg-white/90"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Start aanvraag
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
              </svg>
            </motion.button>
            <p className="mt-4 text-sm text-white/80">
              Klaar in 2 minuten · Rapport binnen 48 uur · €199,95 excl. btw
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-6 space-y-4 rounded-2xl bg-white/85 p-6 text-left shadow-xl ring-1 ring-white/40 backdrop-blur-md md:p-8"
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
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20"
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
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20"
                  placeholder="Bijv: 93"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funda link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="fundaUrl"
                value={formData.fundaUrl}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20"
                placeholder="Plak hier je Funda woninglink"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                We gebruiken de link om een zo goed mogelijk bodadvies voor je te maken.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mailadres
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20"
                placeholder="jouw.naam@email.com"
              />
            </div>

            {validationError && (
              <p className="text-sm text-red-600">{validationError}</p>
            )}

            <div className="flex justify-center">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#1F3C88] px-9 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-[#162E6B] hover:shadow-lg disabled:opacity-50"
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
