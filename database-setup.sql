-- ============================================
-- Supabase Database Setup voor JuisteBod
-- ============================================
-- 
-- Instructies:
-- 1. Maak een nieuw Supabase project aan op https://supabase.com
-- 2. Ga naar je project dashboard
-- 3. Klik op "SQL Editor" in het linker menu
-- 4. Plak deze hele query en klik op "Run"
-- ============================================

-- Enable UUID extension (voor auto-generatie van IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ORDERS TABLE
-- ============================================
-- Deze tabel slaat alle bestellingen op
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT,
  property_url TEXT NOT NULL,
  property_data JSONB NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'new',
  payment_id TEXT,
  amount_paid DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index voor snelle zoekopdrachten op email
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
-- Index voor payment status
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
-- Index voor order status
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
-- Index voor created_at (voor sorteren)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- PROPERTY_REPORTS TABLE
-- ============================================
-- Deze tabel slaat de gegenereerde rapporten op
CREATE TABLE IF NOT EXISTS property_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  report_file_url TEXT,
  report_filename TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index voor snelle zoekopdrachten op order_id
CREATE INDEX IF NOT EXISTS idx_property_reports_order_id ON property_reports(order_id);
-- Index voor sent_at (om te zien welke rapporten al verzonden zijn)
CREATE INDEX IF NOT EXISTS idx_property_reports_sent_at ON property_reports(sent_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS voor beide tabellen
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Service role kan alles (voor server-side operaties)
CREATE POLICY "Service role can do everything on orders"
  ON orders FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on property_reports"
  ON property_reports FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================
-- Functie om updated_at automatisch bij te werken
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger voor orders tabel
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run deze queries om te verifiëren dat alles werkt:

-- Check of tabellen bestaan
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('orders', 'property_reports');

-- Check of indexes bestaan
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('orders', 'property_reports');

-- Test insert (optioneel - verwijder deze na testen)
-- INSERT INTO orders (email, first_name, last_name, property_url, property_data)
-- VALUES ('test@example.com', 'Test', 'User', 'https://funda.nl/test', '{}');
-- 
-- DELETE FROM orders WHERE email = 'test@example.com';
