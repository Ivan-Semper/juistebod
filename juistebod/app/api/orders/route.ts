import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/services/DatabaseService'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract required fields
    const {
      firstName,
      lastName, 
      email,
      phone,
      gender,
      age,
      currentSituation,
      budgetRange,
      firstTimeBuyer,
      urgency,
      additionalInfo,
      propertyUrl,
      propertyAddress,
      propertyPrice,
      propertyData
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !propertyUrl || !propertyData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create order in database
    const order = await DatabaseService.createOrder({
      email,
      firstName,
      lastName,
      gender,
      propertyUrl,
      propertyData: {
        ...propertyData,
        customerInfo: {
          phone,
          age,
          currentSituation,
          budgetRange,
          firstTimeBuyer,
          urgency,
          additionalInfo
        }
      }
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
    const email = searchParams.get('email')
    const orderId = searchParams.get('orderId')

    if (orderId) {
      // Get specific order
      const order = await DatabaseService.getOrderById(orderId)
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: order
      })
    }

    if (email) {
      // Get orders by email
      const orders = await DatabaseService.getOrdersByEmail(email)
      return NextResponse.json({
        success: true,
        data: orders
      })
    }

    // Get all orders (admin only - we'll add auth later)
    const orders = await DatabaseService.getAllOrders()
    return NextResponse.json({
      success: true,
      data: orders
    })

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