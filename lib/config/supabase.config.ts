import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (has full access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          gender: string | null
          property_url: string
          property_data: any
          payment_status: string
          order_status: string
          payment_id: string | null
          amount_paid: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          gender?: string | null
          property_url: string
          property_data: any
          payment_status?: string
          order_status?: string
          payment_id?: string | null
          amount_paid?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          gender?: string | null
          property_url?: string
          property_data?: any
          payment_status?: string
          order_status?: string
          payment_id?: string | null
          amount_paid?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      property_reports: {
        Row: {
          id: string
          order_id: string
          report_file_url: string | null
          report_filename: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          report_file_url?: string | null
          report_filename?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          report_file_url?: string | null
          report_filename?: string | null
          sent_at?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type PropertyReport = Database['public']['Tables']['property_reports']['Row']
export type PropertyReportInsert = Database['public']['Tables']['property_reports']['Insert']
export type PropertyReportUpdate = Database['public']['Tables']['property_reports']['Update'] 