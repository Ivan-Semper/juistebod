import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/services/DatabaseService'
import { logger } from '@/lib/utils/logger'
import { verifyToken, COOKIE_NAME } from '@/lib/admin/auth'

async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return false
  const payload = await verifyToken(token)
  return payload !== null
}

export async function POST(request: NextRequest) {
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
      amount: 60.44
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
      { 
        success: false, 
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
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
      { 
        success: false, 
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
