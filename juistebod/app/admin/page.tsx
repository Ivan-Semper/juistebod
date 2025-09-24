"use client";

import { useState } from 'react';

export default function AdminPage() {
  const [orderId, setOrderId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [paymentId, setPaymentId] = useState('');
  const [amountPaid, setAmountPaid] = useState(29.95);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdatePayment = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/update-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          paymentStatus,
          paymentId,
          amountPaid
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Payment status updated successfully!');
        setOrderId('');
        setPaymentId('');
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to update payment status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FAF9F6' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Admin - Update Payment Status
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Enter order ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment ID (optional)
              </label>
              <input
                type="text"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Mollie payment ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Paid
              </label>
              <input
                type="number"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <button
              onClick={handleUpdatePayment}
              disabled={isLoading || !orderId}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update Payment Status'}
            </button>

            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 Development Note</h3>
          <p className="text-yellow-700 text-sm">
            In development, webhooks don't work with localhost. Use this admin panel to manually update payment status after testing payments.
          </p>
        </div>
      </div>
    </div>
  );
}
