"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="max-w-md mx-auto text-center p-8">
        <div className="bg-white/80 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#E8F0EC' }}>
            <svg className="w-8 h-8" style={{ color: '#1F3C88' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Betaling geslaagd
          </h1>

          <p className="text-gray-700 mb-6">
            Je betaling is verwerkt. Je ontvangt een bevestiging per e-mail. Binnen 24 uur ontvang je jouw bodadvies.
          </p>

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                Order ID: <span className="font-mono">{orderId}</span>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => router.push('/')}
              className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              style={{ backgroundColor: '#1F3C88' }}
            >
              Terug naar Home
            </button>

            <p className="text-sm text-gray-500">
              Heb je vragen? Neem contact met ons op via info@juistebod.nl
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
