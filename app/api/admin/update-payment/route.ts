import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentStatus, paymentId, amountPaid } = await request.json();

    // Update order in database
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        payment_id: paymentId,
        amount_paid: amountPaid,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment status updated successfully' 
    });

  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}
