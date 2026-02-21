## Overzicht (nog niet geimplementeerd)

### Tekst en prijs
- "Persoonlijk woningbodadvies" (geen hoofdletter W, aan elkaar)
- Prijsweergave aanpassen:
  - Van: €75
  - Nu: €49.95 excl. btw
  - Totaal bij afrekenen: €60,44

### Adresweergave
- In het vervolgescherm na woning-invoer staat nu alleen postcode + plaats.
- Wens: ook straatnaam + huisnummer tonen.

### Beheer / admin
- Teksten achter de schermen kunnen aanpassen (zelf kleine aanpassingen doen).
- Admin-kant om bepaalde zaken in te zien.
- Overzicht van traffic via een API.
  - Alleen voor jou (single-admin).

## Stappenplan (alleen admin voor jou)

### 1) Datamodel in Supabase
- Maak tabel `site_texts` met velden:
  - `id` (uuid, primary key)
  - `key` (text, uniek)
  - `value` (text)
  - `updated_at` (timestamp, default now())
- Voeg voorbeeld-keys toe (bijv. `hero_title`, `hero_subtitle`, `cta_label`, `footer_note`).

### 2) RLS + policies
- RLS aan op `site_texts`.
- Maak policy die alleen jouw user-id toegang geeft (select/update/insert).
- Je logt als admin in via Supabase Auth (email + password).

### 3) Admin login
- Maak een `/admin/login` pagina met email + password.
- Gebruik Supabase Auth om in te loggen.
- Sla de sessie op via Supabase client (browser).

### 4) Admin dashboard
- Maak `/admin` pagina (beschermd, alleen ingelogd).
- Haal alle `site_texts` op en toon een formulier per item.
- Voeg "Opslaan" per item of een "Save all" knop toe.
- Voeg eenvoudige feedback toe (saved/saving/failed).

### 5) Teksten gebruiken in de site
- Maak helper `getSiteTexts()` die alle teksten ophaalt.
- Gebruik in `app/page.tsx` en andere pagina's.
- Fallbacks: als tekst ontbreekt, gebruik huidige hardcoded tekst.

### 6) Caching
- Cache teksten in server component met `revalidate` (bijv. 60s).
- In admin update na save lokaal refetchen.

### 7) Traffic overzicht (optioneel)
- Kies tool/API (bijv. Vercel Analytics of Plausible).
- Maak `/admin/analytics` met embed/summary.

### 8) Beveiliging
- Verberg admin routes met middleware:
  - Als geen session -> redirect naar `/admin/login`.
- Verberg admin route in productie sitemap/robots.

### 9) Content checklist
- Lijst maken van alle teksten die je zelf wil kunnen wijzigen.
- Keys toevoegen aan `site_texts`.

### 10) Testen
- Login/logout flow.
- Tekst aanpassen en checken op landing/checkout.
- RLS: test dat niet‑ingelogd geen toegang heeft.

## Vragen om details
- Waar moet "Persoonlijk woningbodadvies" precies staan (hero, checkout, sectietitel, meerdere plekken)?
- Op welke plek(ken) moet de prijsweergave exact aangepast worden (landing, checkout, betaalbutton, e-mail)?
- Voor "totaal bij afrekenen": moet dit overal inclusief btw worden getoond, of alleen in checkout/betaalstap?
- Welke specifieke "teksten" wil je zelf kunnen aanpassen (hero, secties, FAQ, footer, knoppen)?
- Wil je een eenvoudige admin-pagina in de app (alleen voor jou), of liever via Supabase/een CMS?
- Welke traffic-informatie wil je zien (bezoekers per dag, conversies, referrers)? Heb je al een voorkeur voor tooling/API (bijv. Vercel Analytics, Plausible, Google Analytics)?
  - Admin alleen voor jou bevestigd.

