import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/services/DatabaseService'
import { logger } from '@/lib/utils/logger'
import { verifyToken, COOKIE_NAME } from '@/lib/admin/auth'
import { rateLimit, getClientIP } from '@/lib/utils/rateLimit'

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return false
  const payload = await verifyToken(token)
  return payload !== null
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const { allowed } = rateLimit(`orders:${ip}`, 10, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Te veel verzoeken. Probeer het later opnieuw.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    
    const {
      firstName,
      lastName, 
      email,
      phone,
      additionalInfo,
      propertyUrl,
      propertyAddress,
      propertyPrice,
      propertyData
    } = body

    if (!firstName || !lastName || !email || !phone || !propertyUrl || !propertyData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Ongeldig email adres' },
        { status: 400 }
      )
    }

    if (firstName.length > 100 || lastName.length > 100 || email.length > 254 || phone.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Input too long' },
        { status: 400 }
      )
    }

    if (typeof additionalInfo === 'string' && additionalInfo.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Aanvullende informatie is te lang (max 2000 tekens)' },
        { status: 400 }
      )
    }

    if (typeof propertyUrl !== 'string' || propertyUrl.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Ongeldige woninglink' },
        { status: 400 }
      )
    }

    const order = await DatabaseService.createOrder({
      email,
      firstName,
      lastName,
      phone,
      propertyUrl,
      propertyData: {
        ...propertyData,
        customerInfo: {
          phone,
          additionalInfo
        }
      },
      amount: 241.94
    })

    logger.info('Order created successfully', { 
      orderId: order.id, 
      email: order.email,
      propertyAddress
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        email: order.email,
        status: order.order_status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at
      }
    })

  } catch (error) {
    logger.error('Error creating order', { error })

    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    // Single order lookup by ID (used by success page to verify payment)
    if (orderId) {
      // Valideer UUID-formaat zodat Supabase geen 500 teruggeeft op rommel-invoer
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(orderId)) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        )
      }
      const order = await DatabaseService.getOrderById(orderId)
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        )
      }
      // Public: only return payment status (no PII)
      return NextResponse.json({
        success: true,
        data: {
          id: order.id,
          payment_status: order.payment_status,
          order_status: order.order_status,
        }
      })
    }

    // All other queries require admin auth
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const email = searchParams.get('email')

    if (email) {
      const orders = await DatabaseService.getOrdersByEmail(email)
      return NextResponse.json({ success: true, data: orders })
    }

    const orders = await DatabaseService.getAllOrders()
    return NextResponse.json({ success: true, data: orders })

  } catch (error) {
    logger.error('Error fetching orders', { error })

    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
