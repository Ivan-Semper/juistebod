'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="max-w-md mx-auto text-center p-8">
        <div className="bg-white/80 rounded-2xl shadow-lg p-10 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Er ging iets mis</h1>
          <p className="text-gray-600 mb-8">
            Er is een onverwachte fout opgetreden. Probeer het opnieuw.
          </p>
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: '#1F3C88' }}
            >
              Opnieuw proberen
            </button>
            <a
              href="/"
              className="block text-gray-600 hover:text-gray-800 text-sm"
            >
              Terug naar Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
