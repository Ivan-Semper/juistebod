"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PropertyData } from "@/lib/types/PropertyTypes";
import GoogleMap from "../components/GoogleMap";
import CheckoutForm from "../components/CheckoutForm";
import PaymentButton from "../components/PaymentButton";
import EmailVerification from "../components/EmailVerification";

type Stage = 'form' | 'verify' | 'payment';

export default function CheckoutPage() {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderEmail, setOrderEmail] = useState<string>('');
  const [stage, setStage] = useState<Stage>('form');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get property data from session storage
    try {
      const storedData = sessionStorage.getItem('propertyData');
      if (storedData) {
        setPropertyData(JSON.parse(storedData));
        return;
      }
    } catch {
      // Corrupte data: opruimen en terug naar home
      try { sessionStorage.removeItem('propertyData'); } catch { /* ignore */ }
    }
    router.push('/');
  }, [router]);

  const handleFormSubmit = async (formData: any) => {
    setSubmitError(null);
    try {
      // Prepare the data for the API
      const orderData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        additionalInfo: formData.additionalInfo,
        propertyUrl: propertyData?.url || '',
        propertyAddress: propertyData?.address || '',
        propertyPrice: propertyData?.price || '',
        propertyData: propertyData
      };

      // Save order to database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        const newOrderId = result.data.orderId;
        const email = result.data.email || formData.email;
        setOrderId(newOrderId);
        setOrderEmail(email);

        // Send verification code email
        await fetch('/api/verify-email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: newOrderId }),
        });

        setStage('verify');
      } else {
        throw new Error(result.message || result.error || 'Failed to create order');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Er is iets misgegaan. Probeer het opnieuw.');
    }
  };

  if (!propertyData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#FAF9F6' }}>
      {/* Full Screen Background Map */}
      <div className="fixed inset-0 w-full h-full z-0">
        <GoogleMap 
          address={propertyData.address}
          propertyTitle={propertyData.title}
          fullScreen={true}
          showInfoWindow={false}
          showZoomControl={false}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block rounded-2xl bg-white/85 p-8 shadow-lg ring-1 ring-gray-900/5 backdrop-blur-md">
              <h1 className="font-serif text-4xl tracking-tight text-gray-900 mb-3 md:text-5xl">
                Persoonlijk bodadvies
              </h1>
              <p className="text-lg text-gray-600">
                Vul je gegevens in en ontvang binnen 48 uur professioneel advies
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Property Summary - Semi-transparent */}
            <div className="h-fit rounded-2xl bg-white/85 p-8 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-md">
              <h2 className="font-serif text-2xl tracking-tight text-gray-900 mb-6">
                Woning overzicht
              </h2>
              
              <div className="space-y-4">
                {propertyData.title &&
                  propertyData.title.trim() !== propertyData.address?.trim() && (
                    <h3 className="text-xl font-semibold" style={{ color: '#7C8471' }}>
                      {propertyData.title}
                    </h3>
                  )}
                
                <div>
                  <p className="text-lg font-semibold" style={{ color: '#7C8471' }}>
                    {propertyData.address}
                  </p>
                </div>

                <div className="mt-6 rounded-xl bg-gray-50 p-5 ring-1 ring-gray-900/5">
                  <h4 className="font-semibold text-gray-900 mb-3">Wat krijg je?</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {[
                      'Marktanalyse van vergelijkbare woningen',
                      'Persoonlijk bodadvies op maat',
                      'Strategie­tips voor de onderhandeling',
                      'Binnen 48 uur in je inbox',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#7C8471]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Form - Semi-transparent */}
            <div className="rounded-2xl bg-white/85 p-8 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-md">
              <h2 className="font-serif text-2xl tracking-tight text-gray-900 mb-6">
                Jouw gegevens
              </h2>

              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}
              
              {stage === 'form' && (
                <CheckoutForm 
                  propertyData={propertyData}
                  onSubmit={handleFormSubmit}
                />
              )}

              {stage === 'verify' && orderId && (
                <EmailVerification
                  orderId={orderId}
                  email={orderEmail}
                  onVerified={() => setStage('payment')}
                />
              )}

              {stage === 'payment' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Betaling
                    </h3>
                    <p className="text-gray-600">
                      Klik op de knop hieronder om te betalen met Mollie
                    </p>
                  </div>
                  
                  <PaymentButton
                    orderId={orderId!}
                    amount={241.94}
                    description="Persoonlijk Bodadvies - JuisteBod"
                  />

                  <p className="text-center text-sm text-gray-500">
                    Je wordt veilig doorgestuurd naar onze betaalprovider Mollie.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <div className="inline-block rounded-full bg-white/80 px-5 py-2.5 shadow-sm ring-1 ring-gray-900/5 backdrop-blur-md">
              <button
                onClick={() => router.back()}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
              >
                ← Terug naar woninggegevens
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 