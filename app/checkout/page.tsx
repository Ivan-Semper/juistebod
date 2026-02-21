"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PropertyData } from "@/lib/types/PropertyTypes";
import GoogleMap from "../components/GoogleMap";
import CheckoutForm from "../components/CheckoutForm";
import PaymentButton from "../components/PaymentButton";

export default function CheckoutPage() {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get property data from session storage
    const storedData = sessionStorage.getItem('propertyData');
    if (storedData) {
      setPropertyData(JSON.parse(storedData));
    } else {
      // If no property data, redirect to home
      router.push('/');
    }
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
        // Store order ID for payment
        setOrderId(result.data.orderId);
        setShowPayment(true);
        
        // Order created; show payment section
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
            <div className="bg-white/40 backdrop-blur-sm rounded-lg p-6 inline-block">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
                Persoonlijk Bodadvies
              </h1>
              <p className="text-lg text-gray-800">
                Vul je gegevens in en ontvang binnen 24 uur professioneel advies
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Property Summary - Semi-transparent */}
            <div className="bg-white/40 backdrop-blur-sm rounded-lg shadow-lg p-8 h-fit">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Woning Overzicht
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

                <div className="mt-6 p-4 bg-gray-50/20 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Wat krijg je?</h4>
                                      <ul className="text-sm text-gray-800 space-y-1">
                      <li>✓ Marktanalyse van vergelijkbare woningen</li>
                      <li>✓ Persoonlijk bodadvies op maat</li>
                      <li>✓ Strategie tips voor onderhandeling</li>
                      <li>✓ Binnen 24 uur in je inbox</li>
                    </ul>
                </div>
              </div>
            </div>

            {/* Contact Form - Semi-transparent */}
            <div className="bg-white/40 backdrop-blur-sm rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Jouw Gegevens
              </h2>

              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}
              
              {!showPayment ? (
                <CheckoutForm 
                  propertyData={propertyData}
                  onSubmit={handleFormSubmit}
                />
              ) : (
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
                    amount={60.44}
                    description="Persoonlijk Bodadvies - JuisteBod"
                    onPaymentSuccess={() => {
                      router.push(`/checkout/success?orderId=${orderId}`);
                    }}
                  />
                  
                  <div className="text-center">
                    <button
                      onClick={() => setShowPayment(false)}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      ← Terug naar formulier
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <div className="bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
              <button 
                onClick={() => router.back()}
                className="text-gray-800 hover:text-gray-900 transition-colors"
              >
                ← Terug naar woning gegevens
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 