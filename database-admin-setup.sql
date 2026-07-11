-- ============================================
-- Admin CMS: site_content table
-- ============================================
-- Voer dit uit in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'text',
  section TEXT NOT NULL DEFAULT 'general',
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on site_content"
  ON site_content FOR ALL
  USING (true)
  WITH CHECK (true);

DROP TRIGGER IF EXISTS update_site_content_updated_at ON site_content;
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Seed default content
-- ============================================

INSERT INTO site_content (key, value, content_type, section, label) VALUES
-- Hero
('hero_subtitle', 'Het juiste bod op elke woning', 'text', 'hero', 'Hero ondertitel'),
('hero_title', 'Persoonlijk woningbodadvies', 'text', 'hero', 'Hero titel'),

-- Pricing
('price_old', '75', 'price', 'pricing', 'Oude prijs (doorgestreept)'),
('price_excl_btw', '49,95', 'price', 'pricing', 'Prijs excl. BTW'),
('price_incl_btw', '60,44', 'price', 'pricing', 'Prijs incl. BTW'),

-- How it works
('how_it_works_title', 'Zo werkt het', 'text', 'how_it_works', 'Sectie titel'),
('step1_title', 'Plak je Funda-link', 'text', 'how_it_works', 'Stap 1 titel'),
('step1_text', 'Heb je een huis op het oog? Vul je postcode en huisnummer in, plak de Funda-link van de woning erbij en dien je aanvraag in.', 'text', 'how_it_works', 'Stap 1 tekst'),
('step1_tip', 'Aanvragen duurt nog geen minuut', 'text', 'how_it_works', 'Stap 1 tip'),
('step2_title', 'Onze makelaars gaan voor je aan de slag', 'text', 'how_it_works', 'Stap 2 titel'),
('step2_text', 'Je aanvraag komt direct terecht bij onze ervaren makelaars. Geen standaardmodel of automatische schatting, maar een handmatige analyse van de woning, de buurt en recente transacties.', 'text', 'how_it_works', 'Stap 2 tekst'),
('step2_tip', 'Al je gegevens worden veilig opgeslagen', 'text', 'how_it_works', 'Stap 2 tip'),
('step3_title', 'Je ontvangt een onderbouwd biedadvies', 'text', 'how_it_works', 'Stap 3 titel'),
('step3_text', 'Binnen 48 uur ontvang je een volledig en downloadbaar adviesrapport in je mailbox, inclusief 7 slimme biedtips voor een sterkere onderhandelingspositie.', 'text', 'how_it_works', 'Stap 3 tekst'),
('step3_tip', 'Handmatig opgesteld door ervaren makelaars', 'text', 'how_it_works', 'Stap 3 tip'),

-- What you get
('what_you_get_title', 'Wat krijg je precies?', 'text', 'what_you_get', 'Sectie titel'),
('market_analysis_items', '["Vergelijking met soortgelijke woningen","Prijsontwikkeling in de buurt","Marktcondities en vraag/aanbod"]', 'json', 'what_you_get', 'Marktanalyse punten'),
('personal_advice_items', '["Optimaal bodbedrag op basis van markt","Onderhandelingsstrategie","Tips voor het biedingsproces"]', 'json', 'what_you_get', 'Persoonlijk advies punten'),

-- Personal advice section
('personal_advice_title', 'Persoonlijk biedadvies', 'text', 'personal_advice', 'Sectie titel'),
('personal_advice_intro', 'Bij Juiste bod krijg je persoonlijk biedadvies van een ervaren vastgoedprofesional. Geen algoritme, maar menselijk inzicht. Op basis van kennis van de markt, vergelijkbare woningen én strategieën die echt werken.', 'text', 'personal_advice', 'Introductie tekst'),
('personal_advice_subtext', 'Ontvang binnen 24 uur een onderbouwd advies dat je helpt slim te bieden zonder honderden euro''s uit te geven aan een aankoopmakelaar. Geen gok, geen koude data. Gewoon het juiste bod.', 'text', 'personal_advice', 'Ondertekst'),

-- Benefits
('benefit_1_title', 'Menselijk inzicht', 'text', 'benefits', 'Voordeel 1 titel'),
('benefit_1_text', 'Geen AI, maar advies van een vastgoedprofessional', 'text', 'benefits', 'Voordeel 1 tekst'),
('benefit_2_title', 'Afgestemd op jouw woning', 'text', 'benefits', 'Voordeel 2 titel'),
('benefit_2_text', 'We kijken naar afwerking, ligging, populariteit van de buurt en meer', 'text', 'benefits', 'Voordeel 2 tekst'),
('benefit_3_title', 'Slimme biedstrategie', 'text', 'benefits', 'Voordeel 3 titel'),
('benefit_3_text', 'Niet alleen wat je moet bieden, maar ook hoe je het aanpakt', 'text', 'benefits', 'Voordeel 3 tekst'),
('benefit_4_title', 'Snelle levering', 'text', 'benefits', 'Voordeel 4 titel'),
('benefit_4_text', 'Binnen 24 uur jouw persoonlijke biedadvies in je mailbox', 'text', 'benefits', 'Voordeel 4 tekst'),
('benefit_5_title', 'Betaalbaar', 'text', 'benefits', 'Voordeel 5 titel'),
('benefit_5_text', 'Een fractie van de kosten van een aankoopmakelaar', 'text', 'benefits', 'Voordeel 5 tekst'),
('benefit_6_title', 'Onafhankelijk advies', 'text', 'benefits', 'Voordeel 6 titel'),
('benefit_6_text', 'Geen verkooppraatjes, geen belangen, alleen eerlijke informatie', 'text', 'benefits', 'Voordeel 6 tekst'),
('benefit_7_title', 'Meer kans op succes', 'text', 'benefits', 'Voordeel 7 titel'),
('benefit_7_text', 'Vergroot je kans om niet alleen een bod te doen, maar ook te winnen', 'text', 'benefits', 'Voordeel 7 tekst'),

-- Mission
('mission_text1', 'Wij geloven dat iedereen recht heeft op eerlijk en deskundig advies bij het kopen van een woning zonder dat daar hoge makelaarskosten bij komen kijken.', 'text', 'mission', 'Missie tekst 1'),
('mission_text2', 'Onze missie is om woningzoekers snel, helder en betaalbaar te helpen bij het bepalen van een bod. Zodat je met vertrouwen en kennis van de markt je volgende stap kan zetten!', 'text', 'mission', 'Missie tekst 2'),

-- Why JuisteBod
('why_title', 'Waarom JuisteBod.nl?', 'text', 'why_juistebod', 'Sectie titel'),
('why_text1', 'De woningmarkt is de afgelopen jaren volledig op z''n kop gezet. Waar huizen vroeger maanden te koop stonden, is er nu amper tijd om adem te halen. Je bezichtigt een woning, en voor je het weet moet je een bod doen van tienduizenden euro''s boven de vraagprijs — vaak zonder te weten of dat wel verstandig is.', 'text', 'why_juistebod', 'Paragraaf 1'),
('why_text2', 'Voor veel mensen, zeker starters, voelt het alsof ze constant achter het net vissen. Steeds wéér misgegrepen. Steeds te laat. Of nét niet hoog genoeg. In deze hectische markt kreeg ik steeds vaker dezelfde vraag van vrienden, kennissen en uiteindelijk vrienden van vrienden:', 'text', 'why_juistebod', 'Paragraaf 2'),
('why_quote', 'Wat moet ik bieden op dit huis?', 'text', 'why_juistebod', 'Citaat'),
('why_text3', 'Het viel me op hoeveel mensen, vooral starters, compleet vastlopen in het biedproces. Daarom ben ik JuisteBod.nl gestart. Geen AI-gegenereerde schatting, maar persoonlijk advies van een vastgoeddeskundige met actuele marktkennis en ervaring in het makelaarsvak.', 'text', 'why_juistebod', 'Paragraaf 3'),
('why_highlight_title', 'En het mooiste?', 'text', 'why_juistebod', 'Highlight titel'),
('why_highlight_text1', 'Een gemiddelde aankoopmakelaar kost al snel tussen de €1.500 en €3.000.', 'text', 'why_juistebod', 'Highlight tekst 1'),
('why_highlight_text2', 'Dezelfde kennis maar een fractie van de prijs.', 'text', 'why_juistebod', 'Highlight tekst 2'),

-- Testimonials
('testimonials_title', 'Tevreden klanten', 'text', 'testimonials', 'Sectie titel'),
('testimonial_1_quote', 'Vanwege de prijsontwikkeling van je product en dienst door huurverzwaringen van eigenaars heb ik zorgvuldig voor jullie dienstverlening gekozen. Daarom is feedback van anderen die voorheen ervaring hadden.', 'text', 'testimonials', 'Review 1 tekst'),
('testimonial_1_name', 'Nathalie Louwers', 'text', 'testimonials', 'Review 1 naam'),
('testimonial_2_quote', 'Vanwege de prijsontwikkeling van je product en dienst door huurverzwaringen van eigenaars heb ik zorgvuldig voor jullie dienstverlening gekozen. Daarom is feedback van anderen die voorheen ervaring hadden.', 'text', 'testimonials', 'Review 2 tekst'),
('testimonial_2_name', 'Ellis Steenhuis', 'text', 'testimonials', 'Review 2 naam'),
('testimonial_3_quote', 'Vanwege de prijsontwikkeling van je product en dienst door huurverzwaringen van eigenaars heb ik zorgvuldig voor jullie dienstverlening gekozen. Daarom is feedback van anderen die voorheen ervaring hadden.', 'text', 'testimonials', 'Review 3 tekst'),
('testimonial_3_name', 'Lillian Frayers', 'text', 'testimonials', 'Review 3 naam'),

-- Footer
('footer_tagline', 'Het juiste bod op elke woning', 'text', 'footer', 'Tagline'),
('contact_name', 'Netraam Kremer', 'text', 'footer', 'Contactpersoon naam'),
('contact_email', 'info@juistebod.nl', 'text', 'footer', 'Contact email'),
('kvk_number', '97900443', 'text', 'footer', 'KvK nummer'),
('instagram_url', 'https://www.instagram.com/juistebod?igsh=MXBxZXNpbDRmbXRx', 'text', 'footer', 'Instagram URL')

ON CONFLICT (key) DO NOTHING;
