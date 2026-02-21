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
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {isLoading ? 'Bezig...' : `€${amount.toFixed(2)} betalen met Mollie`}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
