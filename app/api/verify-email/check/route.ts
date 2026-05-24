import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/config/supabase.config'
import { rateLimit, getClientIP } from '@/lib/utils/rateLimit'
import { logger } from '@/lib/utils/logger'

const MAX_ATTEMPTS = 5

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const { allowed } = rateLimit(`verify-check:${ip}`, 15, 60_000)
  if (!allowed) {
    return NextResponse.json({ success: false, error: 'Te veel pogingen. Probeer het later opnieuw.' }, { status: 429 })
  }

  try {
    const { orderId, code } = await request.json()
    if (!orderId || !code || !/^\d{4}$/.test(code)) {
      return NextResponse.json({ success: false, error: 'Ongeldige invoer' }, { status: 400 })
    }

    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, property_data')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ success: false, error: 'Bestelling niet gevonden' }, { status: 404 })
    }

    const verification = order.property_data?.emailVerification
    if (!verification) {
      return NextResponse.json({ success: false, error: 'Geen verificatiecode gevonden. Vraag een nieuwe aan.' }, { status: 400 })
    }

    // Check expiry
    if (new Date(verification.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: 'Code verlopen. Vraag een nieuwe aan.' }, { status: 400 })
    }

    // Check attempt count
    if ((verification.attempts || 0) >= MAX_ATTEMPTS) {
      return NextResponse.json({ success: false, error: 'Te veel onjuiste pogingen. Vraag een nieuwe code aan.' }, { status: 400 })
    }

    if (verification.code !== code) {
      // Increment attempts
      const updatedPropertyData = {
        ...order.property_data,
        emailVerification: { ...verification, attempts: (verification.attempts || 0) + 1 },
      }
      await supabaseAdmin.from('orders').update({ property_data: updatedPropertyData }).eq('id', orderId)
      return NextResponse.json({ success: false, error: 'Onjuiste code. Probeer het opnieuw.' }, { status: 400 })
    }

    // Mark as verified — remove the code from property_data
    const { emailVerification: _removed, ...restPropertyData } = order.property_data
    const updatedPropertyData = { ...restPropertyData, emailVerified: true }
    await supabaseAdmin.from('orders').update({ property_data: updatedPropertyData }).eq('id', orderId)

    logger.info('Email verified for order', { orderId })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error in verify-email/check', { error })
    return NextResponse.json({ success: false, error: 'Onbekende fout' }, { status: 500 })
  }
}
