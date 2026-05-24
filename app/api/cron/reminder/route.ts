import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/config/supabase.config'
import { EmailService } from '@/lib/services/EmailService'
import { logger } from '@/lib/utils/logger'

// Called by Vercel Cron every 30 minutes.
// Finds pending emails older than 1 hour that haven't been reminded yet
// and have no completed payment.
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent abuse
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    // Get pending emails older than 1 hour that haven't been reminded yet
    const { data: pendingEmails, error } = await supabaseAdmin
      .from('pending_emails')
      .select('email, created_at')
      .eq('reminded', false)
      .lt('created_at', oneHourAgo)

    if (error) {
      logger.error('Failed to fetch pending emails', { error })
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({ success: true, sent: 0 })
    }

    let sent = 0
    for (const row of pendingEmails) {
      // Check if this email already has a paid order — skip if so
      const { data: paidOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('email', row.email)
        .eq('payment_status', 'paid')
        .maybeSingle()

      if (paidOrder) {
        // Mark as reminded so we don't check again
        await supabaseAdmin.from('pending_emails').update({ reminded: true }).eq('email', row.email)
        continue
      }

      await EmailService.sendAbandonedCartReminder(row.email)
      await supabaseAdmin.from('pending_emails').update({ reminded: true }).eq('email', row.email)
      sent++
    }

    logger.info('Abandoned cart reminders sent', { sent })
    return NextResponse.json({ success: true, sent })
  } catch (error) {
    logger.error('Error in cron reminder', { error })
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
