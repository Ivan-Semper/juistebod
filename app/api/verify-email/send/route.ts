import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/config/supabase.config'
import { EmailService } from '@/lib/services/EmailService'
import { rateLimit, getClientIP } from '@/lib/utils/rateLimit'
import { logger } from '@/lib/utils/logger'

function generateCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

// POST: Send verification code for an order
// PATCH: Change email and resend code
export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const { allowed } = rateLimit(`verify-send:${ip}`, 10, 60_000)
  if (!allowed) {
    return NextResponse.json({ success: false, error: 'Te veel verzoeken.' }, { status: 429 })
  }

  try {
    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId vereist' }, { status: 400 })
    }

    // Fetch the order
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, email, first_name, property_data')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ success: false, error: 'Bestelling niet gevonden' }, { status: 404 })
    }

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min

    // Store code in property_data
    const updatedPropertyData = {
      ...(order.property_data || {}),
      emailVerification: { code, expiresAt, attempts: 0 },
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ property_data: updatedPropertyData })
      .eq('id', orderId)

    if (updateError) {
      logger.error('Failed to store verification code', { updateError, orderId })
      return NextResponse.json({ success: false, error: 'Opslaan mislukt' }, { status: 500 })
    }

    // Send the code by email
    await EmailService.sendVerificationCode(order.email, order.first_name, code)

    return NextResponse.json({ success: true, email: order.email })
  } catch (error) {
    logger.error('Error in verify-email/send', { error })
    return NextResponse.json({ success: false, error: 'Onbekende fout' }, { status: 500 })
  }
}

// PATCH: Change email on an order and resend verification code
export async function PATCH(request: NextRequest) {
  const ip = getClientIP(request)
  const { allowed } = rateLimit(`verify-change:${ip}`, 5, 60_000)
  if (!allowed) {
    return NextResponse.json({ success: false, error: 'Te veel verzoeken.' }, { status: 429 })
  }

  try {
    const { orderId, newEmail } = await request.json()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!orderId || !newEmail || !emailRegex.test(newEmail) || newEmail.length > 254) {
      return NextResponse.json({ success: false, error: 'Ongeldig verzoek' }, { status: 400 })
    }

    // Fetch order
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, first_name, property_data')
      .eq('id', orderId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ success: false, error: 'Bestelling niet gevonden' }, { status: 404 })
    }

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    const updatedPropertyData = {
      ...(order.property_data || {}),
      emailVerification: { code, expiresAt, attempts: 0 },
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ email: newEmail, property_data: updatedPropertyData })
      .eq('id', orderId)

    if (updateError) {
      logger.error('Failed to update email/code', { updateError, orderId })
      return NextResponse.json({ success: false, error: 'Opslaan mislukt' }, { status: 500 })
    }

    await EmailService.sendVerificationCode(newEmail, order.first_name, code)

    return NextResponse.json({ success: true, email: newEmail })
  } catch (error) {
    logger.error('Error in verify-email/send PATCH', { error })
    return NextResponse.json({ success: false, error: 'Onbekende fout' }, { status: 500 })
  }
}
