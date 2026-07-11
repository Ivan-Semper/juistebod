-- ============================================
-- Update stappenplan-teksten ("Zo werkt het")
-- ============================================
-- De seed in database-admin-setup.sql gebruikt ON CONFLICT DO NOTHING,
-- dus bestaande rijen worden daar NIET door bijgewerkt.
-- Voer dit script uit in de Supabase SQL Editor om de teksten van het
-- stappenplan in een bestaande database gelijk te trekken met de nieuwe
-- landingspagina (zigzag-layout met illustraties).

UPDATE site_content SET value = 'Plak je Funda-link'
  WHERE key = 'step1_title';

UPDATE site_content SET value = 'Heb je een huis op het oog? Vul je postcode en huisnummer in, plak de Funda-link van de woning erbij en dien je aanvraag in.'
  WHERE key = 'step1_text';

UPDATE site_content SET value = 'Aanvragen duurt nog geen minuut'
  WHERE key = 'step1_tip';

UPDATE site_content SET value = 'Onze makelaars gaan voor je aan de slag'
  WHERE key = 'step2_title';

UPDATE site_content SET value = 'Je aanvraag komt direct terecht bij onze ervaren makelaars. Geen standaardmodel of automatische schatting, maar een handmatige analyse van de woning, de buurt en recente transacties.'
  WHERE key = 'step2_text';

UPDATE site_content SET value = 'Al je gegevens worden veilig opgeslagen'
  WHERE key = 'step2_tip';

UPDATE site_content SET value = 'Je ontvangt een onderbouwd biedadvies'
  WHERE key = 'step3_title';

UPDATE site_content SET value = 'Binnen 48 uur ontvang je een volledig en downloadbaar adviesrapport in je mailbox, inclusief 7 slimme biedtips voor een sterkere onderhandelingspositie.'
  WHERE key = 'step3_text';

UPDATE site_content SET value = 'Handmatig opgesteld door ervaren makelaars'
  WHERE key = 'step3_tip';

-- Controle: toon de bijgewerkte waarden
SELECT key, value FROM site_content WHERE section = 'how_it_works' ORDER BY key;
