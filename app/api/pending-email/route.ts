import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/config/supabase.config'
import { rateLimit, getClientIP } from '@/lib/utils/rateLimit'

// Store a pending (abandoned) email for cart-recovery reminders.
// Requires a `pending_emails` table in Supabase:
//   CREATE TABLE pending_emails (
//     email text PRIMARY KEY,
//     created_at timestamptz DEFAULT now(),
//     reminded boolean DEFAULT false
//   );
export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const { allowed } = rateLimit(`pending-email:${ip}`, 5, 60_000)
  if (!allowed) {
    return NextResponse.json({ success: false }, { status: 429 })
  }

  try {
    const { email } = await request.json()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email) || email.length > 254) {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    // Upsert: reset reminded flag and timestamp if email already exists
    await supabaseAdmin
      .from('pending_emails')
      .upsert({ email, created_at: new Date().toISOString(), reminded: false }, { onConflict: 'email' })

    return NextResponse.json({ success: true })
  } catch {
    // Fail silently — do not block the user flow
    return NextResponse.json({ success: true })
  }
}
