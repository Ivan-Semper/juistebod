import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';

const mollieApiKey = process.env.MOLLIE_API_KEY || 'placeholder-mollie-key';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

const mollieClient = createMollieClient({ apiKey: mollieApiKey });
const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const id = params.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing payment ID' }, { status: 400 });
    }

    // Fetch the actual payment from Mollie to verify authenticity
    const payment = await mollieClient.payments.get(id);

    const orderId = (payment.metadata as any)?.orderId;
    if (!orderId) {
      logger.error('Webhook: no orderId in payment metadata', { paymentId: id });
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Verify the order exists before updating
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('id', orderId)
      .single();

    if (!existingOrder) {
      logger.error('Webhook: order not found', { orderId, paymentId: id });
      return NextResponse.json({ success: false }, { status: 404 });
    }

    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: payment.status,
        payment_id: payment.id,
        amount_paid: payment.amount.value,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      logger.error('Webhook: database update failed', { error: error.message, orderId });
      return NextResponse.json({ success: false }, { status: 500 });
    }

    logger.info('Webhook: order updated', { orderId, paymentId: id, status: payment.status });
    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Webhook error', { error });
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
