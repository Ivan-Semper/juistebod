"use client";

import { useState, FormEvent } from 'react';
import { PropertyData } from '@/lib/types/PropertyTypes';

interface CheckoutFormProps {
  propertyData: PropertyData;
  onSubmit: (formData: any) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  age: string;
  currentSituation: string;
  budgetRange: string;
  firstTimeBuyer: string;
  urgency: string;
  additionalInfo: string;
}

export default function CheckoutForm({ propertyData, onSubmit }: CheckoutFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    currentSituation: '',
    budgetRange: '',
    firstTimeBuyer: '',
    urgency: '',
    additionalInfo: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Voornaam is verplicht';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Achternaam is verplicht';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is verplicht';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Voer een geldig email adres in';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Combine form data with property data
      const submissionData = {
        ...formData,
        propertyUrl: propertyData.url,
        propertyAddress: propertyData.address,
        propertyPrice: propertyData.price,
        submittedAt: new Date().toISOString()
      };

      await onSubmit(submissionData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Voornaam *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900 ${
              errors.firstName ? 'border-red-500' : 'border-gray-400'
            }`}
            placeholder="Jouw voornaam"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Achternaam *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900 ${
              errors.lastName ? 'border-red-500' : 'border-gray-400'
            }`}
            placeholder="Jouw achternaam"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Email adres *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900 ${
            errors.email ? 'border-red-500' : 'border-gray-400'
          }`}
          placeholder="jouw.naam@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Telefoonnummer <span className="text-green-600">(aanbevolen)</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900"
          placeholder="06 12345678"
        />
        <p className="mt-1 text-sm text-gray-700">
          Voor snelle communicatie indien nodig
        </p>
      </div>

      {/* Demographics for Analysis */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Aanvullende informatie
          <span className="text-sm font-normal text-gray-700 ml-2">
            (helpt ons bij het opstellen van gepersonaliseerd advies)
          </span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Geslacht
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Selecteer...</option>
              <option value="man">Man</option>
              <option value="vrouw">Vrouw</option>
              <option value="anders">Anders</option>
              <option value="geen_antwoord">Wil ik niet zeggen</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Leeftijd
            </label>
            <select
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Selecteer...</option>
              <option value="18-25">18-25 jaar</option>
              <option value="26-35">26-35 jaar</option>
              <option value="36-45">36-45 jaar</option>
              <option value="46-55">46-55 jaar</option>
              <option value="56-65">56-65 jaar</option>
              <option value="65+">65+ jaar</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Huidige woonsituatie
            </label>
            <select
              name="currentSituation"
              value={formData.currentSituation}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Selecteer...</option>
              <option value="huur">Huur</option>
              <option value="eigen_woning">Eigen woning</option>
              <option value="bij_ouders">Bij ouders/familie</option>
              <option value="anders">Anders</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Budget range
            </label>
            <select
              name="budgetRange"
              value={formData.budgetRange}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Selecteer...</option>
              <option value="tot_300k">Tot €300.000</option>
              <option value="300k_500k">€300.000 - €500.000</option>
              <option value="500k_750k">€500.000 - €750.000</option>
              <option value="750k_1m">€750.000 - €1.000.000</option>
              <option value="1m_plus">€1.000.000+</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Eerste keer kopen?
            </label>
            <select
              name="firstTimeBuyer"
              value={formData.firstTimeBuyer}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Selecteer...</option>
              <option value="ja">Ja, eerste keer</option>
              <option value="nee">Nee, niet eerste keer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Hoe urgent is de aankoop?
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Selecteer...</option>
              <option value="zeer_urgent">Zeer urgent (binnen 1 maand)</option>
              <option value="urgent">Urgent (binnen 3 maanden)</option>
              <option value="normaal">Normaal (binnen 6 maanden)</option>
              <option value="niet_urgent">Niet urgent (langer dan 6 maanden)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Aanvullende informatie
        </label>
        <textarea
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900"
          placeholder="Heb je specifieke wensen of bijzonderheden die we moeten weten voor het bodadvies?"
        />
      </div>

      {/* Pricing Information */}
      <div className="bg-gray-50/20 backdrop-blur-sm p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-gray-800">
            Professioneel Bodadvies
          </span>
          <span className="text-2xl font-bold" style={{ color: '#1F3C88' }}>
            €49
          </span>
        </div>
        <p className="text-sm text-gray-800 mb-4">
          Binnen 24 uur ontvangt u een uitgebreid rapport met marktanalyse, bodadvies en onderhandelingsstrategie.
        </p>
        
        <div className="text-xs text-gray-700 space-y-1">
          <p>✓ Geen abonnement - eenmalige betaling</p>
          <p>✓ 14 dagen geld-terug-garantie</p>
          <p>✓ Persoonlijk advies van vastgoedexperts</p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        style={{ backgroundColor: '#1F3C88' }}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Verwerken...
          </div>
        ) : (
          'Betaal €49 en ontvang advies'
        )}
      </button>

      <p className="text-xs text-gray-700 text-center mt-4">
        Door op 'Betaal €49 en ontvang advies' te klikken, ga je akkoord met onze{' '}
        <a href="/voorwaarden" className="text-blue-600 hover:underline">
          algemene voorwaarden
        </a>{' '}
        en{' '}
        <a href="/privacy" className="text-blue-600 hover:underline">
          privacybeleid
        </a>
        .
      </p>
    </form>
  );
} 