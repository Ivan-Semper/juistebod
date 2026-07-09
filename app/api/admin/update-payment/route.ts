import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';
import { verifyToken, COOKIE_NAME } from '@/lib/admin/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ALLOWED_STATUSES = ['pending', 'paid', 'failed', 'expired', 'canceled', 'refunded'];

export async function POST(request: NextRequest) {
  // Extra verdedigingslaag naast de middleware: verifieer het admin-token in de route zelf
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, paymentStatus, paymentId, amountPaid } = await request.json();

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }
    if (!paymentStatus || !ALLOWED_STATUSES.includes(paymentStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid payment status' }, { status: 400 });
    }

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
      logger.error('Database update error', { error: error.message });
      return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully'
    });

  } catch (error) {
    logger.error('Update payment error', { error });
    return NextResponse.json(
      { success: false, error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}
