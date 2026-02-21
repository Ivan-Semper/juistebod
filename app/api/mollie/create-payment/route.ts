import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { DatabaseService } from '@/lib/services/DatabaseService';
import { logger } from '@/lib/utils/logger';
import { rateLimit, getClientIP } from '@/lib/utils/rateLimit';

const mollieApiKey = process.env.MOLLIE_API_KEY || 'placeholder-mollie-key';
const mollieClient = createMollieClient({ apiKey: mollieApiKey });

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const { allowed } = rateLimit(`payment:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Te veel verzoeken. Probeer het later opnieuw.' },
      { status: 429 }
    );
  }

  try {
    const { orderId, description } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await DatabaseService.getOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json(
        { success: false, error: 'Order is already paid' },
        { status: 400 }
      );
    }

    const amount = order.amount_paid || 60.44;

    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'https://juistebod.nl'}/checkout/success?orderId=${orderId}`;

    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: amount.toFixed(2)
      },
      description: description || 'Persoonlijk Bodadvies - JuisteBod',
      redirectUrl,
      webhookUrl: process.env.MOLLIE_WEBHOOK_URL || undefined,
      metadata: {
        orderId: orderId
      }
    });

    logger.info('Payment created', { orderId, paymentId: payment.id, amount });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutUrl: payment._links.checkout?.href || ''
    });

  } catch (error) {
    logger.error('Mollie payment error', { error });
    return NextResponse.json(
      { success: false, error: 'Payment creation failed' },
      { status: 500 }
    );
  }
}
