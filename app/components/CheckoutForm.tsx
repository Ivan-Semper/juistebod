"use client";

import { useState, FormEvent, Fragment, useRef } from 'react';
import { PropertyData } from '@/lib/types/PropertyTypes';

interface CheckoutFormProps {
  propertyData: PropertyData;
  onSubmit: (formData: any) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  phone: string;
  gender: string;
  age: string;
  currentSituation: string;
  budgetRange: string;
  firstTimeBuyer: string;
  additionalInfo: string;
}

export default function CheckoutForm({ propertyData, onSubmit }: CheckoutFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    phone: '',
    gender: '',
    age: '',
    currentSituation: '',
    budgetRange: '',
    firstTimeBuyer: '',
    additionalInfo: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsError, setTermsError] = useState('');
  const termsRef = useRef<HTMLDivElement>(null);

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

    if (!formData.confirmEmail.trim()) {
      newErrors.confirmEmail = 'Bevestig je emailadres';
    } else if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Emailadressen komen niet overeen';
    }

    setErrors(newErrors);
    // Algemene voorwaarden verplicht
    if (!termsAccepted) {
      setTermsError('Je moet akkoord gaan met de algemene voorwaarden');
      return false;
    } else {
      setTermsError('');
    }
    return Object.keys(newErrors).length === 0 && termsAccepted;
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
          Bevestig emailadres *
        </label>
        <input
          type="email"
          name="confirmEmail"
          value={formData.confirmEmail}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-gray-900 ${
            errors.confirmEmail ? 'border-red-500' : 'border-gray-400'
          }`}
          placeholder="Herhaal je emailadres"
        />
        {errors.confirmEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmEmail}</p>
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

          {/* Removed urgency field */}
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

      {/* Algemene voorwaarden checkbox en link */}
      <div className="flex items-center mt-4">
        <input
          id="terms"
          type="checkbox"
          checked={termsAccepted}
          onChange={e => setTermsAccepted(e.target.checked)}
          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="terms" className="ml-3 text-sm text-gray-800 select-none">
          Ik ga akkoord met de{' '}
          <button
            type="button"
            className="text-blue-600 underline hover:text-blue-800 focus:outline-none"
            onClick={() => setShowTermsModal(true)}
          >
            algemene voorwaarden
          </button>
        </label>
      </div>
      {termsError && <p className="text-sm text-red-600 mt-1">{termsError}</p>}

      {/* Modal voor algemene voorwaarden */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
          <div ref={termsRef} className="bg-white rounded-lg shadow-lg max-w-lg w-full p-8 relative animate-fade-in">
            <h2 className="text-2xl font-extrabold uppercase mb-4 text-center tracking-wide" style={{ color: '#1F3C88', textDecoration: 'underline', textUnderlineOffset: '6px' }}>Algemene Voorwaarden</h2>
            <div className="text-gray-700 text-sm space-y-3 max-h-96 overflow-y-auto">
              <p>1. JuisteBod.nl levert eenmalig een persoonlijk bodadvies op basis van de door jou aangeleverde gegevens.</p>
              <p>2. Het advies is informatief en niet bindend. Je blijft zelf verantwoordelijk voor je uiteindelijke bod en aankoopbeslissing.</p>
              <p>3. JuisteBod.nl is niet aansprakelijk voor schade of verlies voortvloeiend uit het opvolgen van het advies.</p>
              <p>4. Je gegevens worden vertrouwelijk behandeld en alleen gebruikt voor het opstellen van het bodadvies.</p>
              <p>5. Betaling is eenmalig en geeft recht op één adviesrapport. Restitutie is alleen mogelijk binnen 14 dagen en vóór levering van het rapport.</p>
              <p>6. Door akkoord te gaan verklaar je deze voorwaarden te hebben gelezen en begrepen.</p>
              <p>7. Je ontvangt het rapport binnen maximaal 24 uur op werkdagen (ma-vr). In het weekend kan de levering langer duren.</p>
            </div>
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold focus:outline-none"
              onClick={() => setShowTermsModal(false)}
              aria-label="Sluit"
            >
              ×
            </button>
            <div className="mt-6 text-right">
              <button
                type="button"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none"
                onClick={() => setShowTermsModal(false)}
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

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
        Door op 'Betaal €49 en ontvang advies' te klikken, ga je akkoord met onze <span className="font-semibold">algemene voorwaarden</span> (max. 24 uur op werkdagen, niet in het weekend) en <a href="/privacy" className="text-blue-600 hover:underline">privacybeleid</a>.
      </p>
    </form>
  );
} 