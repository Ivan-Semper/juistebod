import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    // Haal payment status op bij Mollie
    const payment = await mollieClient.payments.get(id);
    
    // Update order status in database
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: payment.status,
        payment_id: payment.id,
        amount_paid: payment.amount.value,
        updated_at: new Date().toISOString()
      })
      .eq('id', (payment.metadata as any)?.orderId);

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
