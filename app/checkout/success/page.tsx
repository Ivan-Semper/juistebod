"use client";

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

type PaymentState = 'loading' | 'paid' | 'pending' | 'failed';

const SUCCESS_BG_IMAGE = '/landing_page_photos/margaret-polinder-NzCVjuMW6ww-unsplash.jpg';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<PaymentState>('loading');

  const checkPayment = useCallback(async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders?orderId=${orderId}`);
      const data = await res.json();

      if (!data.success) {
        setState('failed');
        return false;
      }

      const status = data.data.payment_status;
      if (status === 'paid') {
        setState('paid');
        return true;
      } else if (status === 'failed' || status === 'expired' || status === 'canceled') {
        setState('failed');
        return true;
      } else {
        setState('pending');
        return false;
      }
    } catch {
      setState('failed');
      return true;
    }
  }, []);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      setState('failed');
      return;
    }

    let cancelled = false;
    let attempt = 0;
    const maxAttempts = 10;

    const poll = async () => {
      if (cancelled) return;
      const done = await checkPayment(orderId);
      attempt++;
      if (!done && attempt < maxAttempts && !cancelled) {
        setTimeout(poll, 2000);
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [searchParams, checkPayment]);

  if (state === 'loading' || state === 'pending') {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <Image
          src={SUCCESS_BG_IMAGE}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-md mx-auto text-center p-8">
          <div className="bg-white/90 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
            <div className="animate-spin h-12 w-12 border-3 border-gray-200 border-t-blue-600 rounded-full mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Betaling wordt verwerkt...</h1>
            <p className="text-gray-600">Even geduld, we controleren je betaling bij Mollie.</p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'failed') {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <Image
          src={SUCCESS_BG_IMAGE}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-md mx-auto text-center p-8">
          <div className="bg-white/90 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Betaling niet geslaagd</h1>
            <p className="text-gray-700 mb-6">
              Je betaling is niet gelukt of geannuleerd. Probeer het opnieuw of neem contact met ons op.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/checkout')}
                className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: '#1F3C88' }}
              >
                Opnieuw proberen
              </button>
              <p className="text-sm text-gray-500">
                Hulp nodig? Mail naar info@juistebod.nl
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <Image
        src={SUCCESS_BG_IMAGE}
        alt=""
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 max-w-md mx-auto text-center p-8">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#E8F0EC' }}>
            <svg className="w-8 h-8" style={{ color: '#1F3C88' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Betaling geslaagd!
          </h1>

          <p className="text-gray-700 mb-6">
            Je betaling is verwerkt. Je ontvangt een bevestiging per e-mail. Binnen 24 uur ontvang je jouw persoonlijke bodadvies.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/')}
              className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors hover:opacity-90"
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
