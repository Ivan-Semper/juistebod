import { supabaseAdmin, Order, OrderInsert, OrderUpdate, PropertyReport, PropertyReportInsert } from '@/lib/config/supabase.config'
import { PropertyData } from '@/lib/types/PropertyTypes'
import { logger } from '@/lib/utils/logger'

export class DatabaseService {
  // Create new order
  static async createOrder(data: {
    email: string
    firstName: string
    lastName: string
    gender?: string
    propertyUrl: string
    propertyData: PropertyData
  }): Promise<Order> {
    try {
      const orderData: OrderInsert = {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        gender: data.gender || null,
        property_url: data.propertyUrl,
        property_data: data.propertyData,
        payment_status: 'pending',
        order_status: 'new',
        amount_paid: 39.95
      }

      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) {
        logger.error('Failed to create order', { error: error.message })
        throw new Error(`Failed to create order: ${error.message}`)
      }

      logger.info('Order created successfully', { orderId: order.id, email: data.email })
      return order
    } catch (error) {
      logger.error('Error creating order', { error })
      throw error
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Order not found
        }
        logger.error('Failed to get order', { error: error.message, orderId })
        throw new Error(`Failed to get order: ${error.message}`)
      }

      return order
    } catch (error) {
      logger.error('Error getting order', { error, orderId })
      throw error
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .update({ order_status: status })
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        logger.error('Failed to update order status', { error: error.message, orderId })
        throw new Error(`Failed to update order status: ${error.message}`)
      }

      logger.info('Order status updated', { orderId, status })
      return order
    } catch (error) {
      logger.error('Error updating order status', { error, orderId })
      throw error
    }
  }

  // Update payment status
  static async updatePaymentStatus(orderId: string, paymentStatus: string, paymentId?: string): Promise<Order> {
    try {
      const updateData: OrderUpdate = {
        payment_status: paymentStatus
      }

      if (paymentId) {
        updateData.payment_id = paymentId
      }

      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        logger.error('Failed to update payment status', { error: error.message, orderId })
        throw new Error(`Failed to update payment status: ${error.message}`)
      }

      logger.info('Payment status updated', { orderId, paymentStatus, paymentId })
      return order
    } catch (error) {
      logger.error('Error updating payment status', { error, orderId })
      throw error
    }
  }

  // Get all orders (for admin dashboard)
  static async getAllOrders(limit = 50, offset = 0): Promise<Order[]> {
    try {
      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1)

      if (error) {
        logger.error('Failed to get orders', { error: error.message })
        throw new Error(`Failed to get orders: ${error.message}`)
      }

      return orders || []
    } catch (error) {
      logger.error('Error getting orders', { error })
      throw error
    }
  }

  // Get orders by email
  static async getOrdersByEmail(email: string): Promise<Order[]> {
    try {
      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Failed to get orders by email', { error: error.message, email })
        throw new Error(`Failed to get orders by email: ${error.message}`)
      }

      return orders || []
    } catch (error) {
      logger.error('Error getting orders by email', { error, email })
      throw error
    }
  }

  // Create property report
  static async createPropertyReport(data: {
    orderId: string
    reportFileUrl: string
    reportFilename: string
  }): Promise<PropertyReport> {
    try {
      const reportData: PropertyReportInsert = {
        order_id: data.orderId,
        report_file_url: data.reportFileUrl,
        report_filename: data.reportFilename
      }

      const { data: report, error } = await supabaseAdmin
        .from('property_reports')
        .insert(reportData)
        .select()
        .single()

      if (error) {
        logger.error('Failed to create property report', { error: error.message, orderId: data.orderId })
        throw new Error(`Failed to create property report: ${error.message}`)
      }

      logger.info('Property report created', { reportId: report.id, orderId: data.orderId })
      return report
    } catch (error) {
      logger.error('Error creating property report', { error, orderId: data.orderId })
      throw error
    }
  }

  // Mark report as sent
  static async markReportAsSent(reportId: string): Promise<PropertyReport> {
    try {
      const { data: report, error } = await supabaseAdmin
        .from('property_reports')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', reportId)
        .select()
        .single()

      if (error) {
        logger.error('Failed to mark report as sent', { error: error.message, reportId })
        throw new Error(`Failed to mark report as sent: ${error.message}`)
      }

      logger.info('Report marked as sent', { reportId })
      return report
    } catch (error) {
      logger.error('Error marking report as sent', { error, reportId })
      throw error
    }
  }

  // Get reports for order
  static async getReportsForOrder(orderId: string): Promise<PropertyReport[]> {
    try {
      const { data: reports, error } = await supabaseAdmin
        .from('property_reports')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Failed to get reports for order', { error: error.message, orderId })
        throw new Error(`Failed to get reports for order: ${error.message}`)
      }

      return reports || []
    } catch (error) {
      logger.error('Error getting reports for order', { error, orderId })
      throw error
    }
  }

  // Get order statistics (for dashboard)
  static async getOrderStats(): Promise<{
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    totalRevenue: number
  }> {
    try {
      const { data: stats, error } = await supabaseAdmin
        .from('orders')
        .select('order_status, payment_status, amount_paid')

      if (error) {
        logger.error('Failed to get order stats', { error: error.message })
        throw new Error(`Failed to get order stats: ${error.message}`)
      }

      const totalOrders = stats.length
      const pendingOrders = stats.filter(order => order.order_status === 'new' || order.order_status === 'in_progress').length
      const completedOrders = stats.filter(order => order.order_status === 'completed').length
      const totalRevenue = stats
        .filter(order => order.payment_status === 'paid')
        .reduce((sum, order) => sum + (order.amount_paid || 0), 0)

      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue
      }
    } catch (error) {
      logger.error('Error getting order stats', { error })
      throw error
    }
  }
} 