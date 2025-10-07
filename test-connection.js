// Test script om database connectie te controleren
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Testing environment variables...')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')

// Test database connectie
async function testDatabase() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    console.log('\n🔗 Testing database connection...')
    
    // Test orders tabel
    const { data: orders, error } = await supabase
      .from('orders')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Database error:', error.message)
    } else {
      console.log('✅ Database connection successful!')
    }
    
    // Test property_reports tabel
    const { data: reports, error: reportsError } = await supabase
      .from('property_reports')
      .select('count')
      .limit(1)
    
    if (reportsError) {
      console.log('❌ Property reports table error:', reportsError.message)
    } else {
      console.log('✅ Property reports table accessible!')
    }
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message)
  }
}

testDatabase()
