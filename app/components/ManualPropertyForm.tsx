"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ManualPropertyFormProps {
  onPropertyFound: (propertyData: any) => void;
  onBack: () => void;
}

export default function ManualPropertyForm({ onPropertyFound, onBack }: ManualPropertyFormProps) {
  const [formData, setFormData] = useState({
    postcode: '',
    houseNumber: '',
    price: '',
    propertyType: '',
    surface: '',
    rooms: '',
    yearBuilt: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine postcode and house number into address
    const address = `${formData.houseNumber}, ${formData.postcode}`;
    
    const propertyData = {
      title: `${formData.propertyType || 'Woning'} in ${formData.postcode}`,
      price: formData.price,
      address: address,
      propertyType: formData.propertyType,
      surface: formData.surface,
      rooms: formData.rooms,
      yearBuilt: formData.yearBuilt,
      description: formData.description,
      url: 'Manual entry',
      scrapedAt: new Date().toISOString(),
      manualEntry: true,
      images: [],
      postcode: formData.postcode,
      houseNumber: formData.houseNumber
    };

    onPropertyFound(propertyData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Woninggegevens Invoeren
        </h2>
        <p className="text-gray-600">
          Vul alleen de <strong>postcode en huisnummer</strong> in. De andere gegevens zijn optioneel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Verplichte velden */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Verplichte gegevens</h3>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bijv: 1012AB"
                pattern="[0-9]{4}[A-Za-z]{2}"
                title="Voer een geldige Nederlandse postcode in (bijv: 1012AB)"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bijv: 123"
                required
              />
            </div>
          </div>
        </div>

        {/* Optionele velden */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Optionele gegevens</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prijs
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bijv: € 450.000"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecteer type</option>
                  <option value="Eengezinswoning">Eengezinswoning</option>
                  <option value="Appartement">Appartement</option>
                  <option value="Tussenwoning">Tussenwoning</option>
                  <option value="Hoekwoning">Hoekwoning</option>
                  <option value="Villa">Villa</option>
                  <option value="Anders">Anders</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oppervlakte (m²)
                </label>
                <input
                  type="text"
                  name="surface"
                  value={formData.surface}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bijv: 120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kamers
                </label>
                <input
                  type="text"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bijv: 4"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bouwjaar
              </label>
              <input
                type="text"
                name="yearBuilt"
                value={formData.yearBuilt}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bijv: 1995"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschrijving (optioneel)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Korte beschrijving van de woning..."
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <motion.button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ← Terug naar Link
          </motion.button>
          
          <motion.button
            type="submit"
            className="flex-1 px-6 py-3 text-white rounded-lg font-medium transition-all"
            style={{ backgroundColor: '#1F3C88' }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 8px 25px rgba(31, 60, 136, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            ✓ Doorgaan met deze gegevens
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
