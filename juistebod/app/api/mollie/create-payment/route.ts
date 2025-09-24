import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Mollie API Key:', process.env.MOLLIE_API_KEY ? 'Set' : 'Missing');
    console.log('🔍 Webhook URL:', process.env.MOLLIE_WEBHOOK_URL);
    
    const { orderId, amount, description, redirectUrl } = await request.json();
    console.log('🔍 Payment data:', { orderId, amount, description, redirectUrl });

    // Maak een nieuwe betaling aan bij Mollie
    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: amount.toFixed(2)
      },
      description: description,
      redirectUrl: redirectUrl,
      // webhookUrl: process.env.MOLLIE_WEBHOOK_URL, // Uitgeschakeld voor development
      metadata: {
        orderId: orderId
      }
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutUrl: payment._links.checkout.href
    });

  } catch (error) {
    console.error('Mollie payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment creation failed' },
      { status: 500 }
    );
  }
}
