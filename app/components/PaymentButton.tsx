'use client';

import { useState } from 'react';

interface PaymentButtonProps {
  orderId: string;
  amount: number;
  description: string;
  onPaymentSuccess?: () => void;
}

export default function PaymentButton({ 
  orderId, 
  amount, 
  description, 
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mollie/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'Betaling kon niet worden aangemaakt');
      }
    } catch (err) {
      setError('Er is een fout opgetreden');
    } finally {
      setIsLoading(false);
    };
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#1F3C88] px-6 py-4 text-lg font-semibold text-white shadow-md transition-all hover:bg-[#162E6B] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        {isLoading ? 'Bezig...' : `Betaal €${amount.toFixed(2).replace('.', ',')} via Mollie`}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
