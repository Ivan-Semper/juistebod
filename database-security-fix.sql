-- ============================================================
-- JuisteBod — Beveiligingsfix voor Row Level Security (RLS)
-- ============================================================
-- WAAROM: De oude policies gebruikten `USING (true)` zonder `TO service_role`.
-- Daardoor gold de policy voor IEDEREEN, inclusief de publieke `anon`-key die
-- in de browser zit. Gevolg: iedereen kon orders (naam, e-mail, telefoon)
-- lezen, wijzigen (payment_status op 'paid' zetten) en verwijderen.
--
-- OPLOSSING: De app benadert deze tabellen UITSLUITEND server-side met de
-- service-role-key. Die key omzeilt RLS sowieso. We hoeven de anon-rol dus
-- helemaal geen toegang te geven. Met RLS aan en GEEN policy voor anon geldt
-- automatisch: alles geweigerd. Extra vangnet: we trekken ook de table-grants
-- van anon/authenticated in.
--
-- Plak dit hele script in Supabase → SQL Editor → Run.
-- Veilig om meerdere keren te draaien (idempotent).
-- ============================================================

-- 1. RLS aanzetten op alle tabellen (voor het geval het ergens uitstond)
ALTER TABLE public.orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_emails    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content      ENABLE ROW LEVEL SECURITY;

-- 2. De gevaarlijke, te ruime policies verwijderen
DROP POLICY IF EXISTS "Service role can do everything on orders"            ON public.orders;
DROP POLICY IF EXISTS "Service role can do everything on property_reports"  ON public.property_reports;
-- Mochten er onder andere namen policies bestaan, verwijder die ook handmatig
-- via Dashboard → Authentication → Policies.

-- 3. Alle table-grants voor de publieke rollen intrekken (vangnet naast RLS)
REVOKE ALL ON public.orders            FROM anon, authenticated;
REVOKE ALL ON public.property_reports  FROM anon, authenticated;
REVOKE ALL ON public.pending_emails    FROM anon, authenticated;
REVOKE ALL ON public.site_content      FROM anon, authenticated;

-- 4. Zeker stellen dat de service-role (server) volledige toegang houdt
GRANT ALL ON public.orders            TO service_role;
GRANT ALL ON public.property_reports  TO service_role;
GRANT ALL ON public.pending_emails    TO service_role;
GRANT ALL ON public.site_content      TO service_role;

-- 5. Bonus: verkeerde standaardprijs corrigeren (stond nog op het oude 60,44)
ALTER TABLE public.orders ALTER COLUMN amount_paid SET DEFAULT 241.94;

-- ============================================================
-- VERIFICATIE — draai dit los om te bevestigen dat RLS aan staat
-- en er geen policy meer is die anon toegang geeft:
-- ============================================================
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN ('orders','property_reports','pending_emails','site_content');
--
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public';
-- ============================================================
