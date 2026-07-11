import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';
import { verifyToken, COOKIE_NAME } from '@/lib/admin/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ALLOWED_STATUSES = ['new', 'in_progress', 'completed', 'cancelled'];

export async function POST(request: NextRequest) {
  // Extra verdedigingslaag naast de middleware: verifieer het admin-token in de route zelf
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, orderStatus } = await request.json();

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }
    if (!orderStatus || !ALLOWED_STATUSES.includes(orderStatus)) {
      return NextResponse.json({ success: false, error: 'Invalid order status' }, { status: 400 });
    }

    const { error } = await supabase
      .from('orders')
      .update({
        order_status: orderStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      logger.error('Order status update error', { error: error.message, orderId });
      return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
    }

    logger.info('Order status updated via admin', { orderId, orderStatus });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in update-order-status', { error });
    return NextResponse.json({ success: false, error: 'Unknown error' }, { status: 500 });
  }
}
