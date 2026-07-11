# JuisteBod.nl — Opbouw van de site

Dit document beschrijft hoe de website is opgebouwd: welke pagina's er zijn, hoe de landingspagina in elkaar zit, hoe de aanvraag- en betaalflow werkt en waar alles in de code staat.

---

## 1. Tech stack

| Onderdeel | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| Animaties | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Betalingen | Mollie |
| E-mail | Resend |
| Kaarten | Google Maps API |
| Hosting | Vercel (hobby-plan → alleen dagelijkse crons) |

---

## 2. Pagina's

| Route | Bestand | Doel |
|---|---|---|
| `/` | `app/page.tsx` | Landingspagina met aanvraagformulier |
| `/checkout` | `app/checkout/page.tsx` | Gegevens invullen + betalen |
| `/checkout/success` | `app/checkout/success/page.tsx` | Bevestiging na betaling |
| `/privacy` | `app/privacy/page.tsx` | Privacybeleid |
| `/admin` | `app/admin/page.tsx` | Admin-login |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | Overzicht voor beheer |
| `/admin/orders` | `app/admin/orders/page.tsx` | Bestellingen bekijken/bijwerken |
| `/admin/content` | `app/admin/content/page.tsx` | Teksten op de site aanpassen (CMS) |
| `/admin/images` | `app/admin/images/page.tsx` | Afbeeldingenbeheer |

Alles onder `/admin/*` (behalve de loginpagina) wordt beschermd door `middleware.ts`: een JWT-cookie (`admin_token`, ondertekend met `ADMIN_JWT_SECRET`) is verplicht, anders volgt een redirect naar `/admin`.

---

## 3. Landingspagina (`app/page.tsx`) — sectie voor sectie

De landingspagina is één lange pagina met vaste secties, van boven naar beneden:

1. **Header / navigatie** — vast bovenin, verbergt zichzelf bij naar beneden scrollen en verschijnt weer bij omhoog scrollen. Links: logo. Rechts: ankerlinks (Hoe werkt het, Missie & visie, Contact) + CTA-knop "Start aanvraag". Op mobiel een hamburgermenu.

2. **Hero (`#home`)** — fullscreen fotocarousel (7 woningfoto's uit `public/landing_page_photos/`, wisselt elke 15 s met Ken Burns-effect) met daaroverheen de titel en het **aanvraagformulier** (`PropertyForm`): postcode, huisnummer en Funda-link (alle drie verplicht).

3. **Expertise (donkerblauw vlak)** — "Geen AI, maar ervaring": uitleg over de handmatige aanpak van de makelaars, met daaronder een statistiekenstrook (100.000+ transacties, 48 uur levertijd, 100% door makelaars).

4. **USP-kaarten** — drie witte kaarten: rapport binnen 48 uur, 7 slimme biedtips, opgesteld door makelaars (geen AI).

5. **Woning-overzicht (`#property-results`)** — verschijnt pas nadat het formulier is ingevuld: toont het gevonden adres + Google Maps-kaart en de vraag "Kloppen deze gegevens?". Bij bevestiging gaat de bezoeker door naar `/checkout` (de woninggegevens gaan mee via `sessionStorage`).

6. **Zo werkt het (`#hoe-werkt-het`) — het stappenplan** ⭐ *vernieuwd*
   Zigzag-layout gebaseerd op het ontwerp uit de map `fotos/`: per stap een tekstkolom en een illustratie, om en om links/rechts (op mobiel staat de illustratie boven de tekst):
   - **Stap 1 — Plak je Funda-link** · illustratie rechts (`stap-1-aanvraag.png`) · badge "⏱️ Snel"
   - **Stap 2 — Onze makelaars gaan voor je aan de slag** · illustratie links (`stap-2-makelaars.png`) · badge "🔒 Veilig"
   - **Stap 3 — Je ontvangt een onderbouwd biedadvies** · illustratie rechts (`stap-3-rapport.png`) · badge "✓ Betrouwbaar"

   De illustraties staan geoptimaliseerd (1200 px breed, 30–61 KB) in `public/hoe-werkt-het/`. De originelen staan in `fotos/`.
   Onderaan de sectie staat de **prijskaart**: €199,95 excl. btw (€241,94 incl.), met CTA terug naar het formulier.

7. **Missie & visie (`#missie-visie`)** — geanimeerde weegschaal (`AnimatedWeegschaal`) links, missietekst rechts.

8. **Footer (`#contact`)** — merknaam + tagline, KvK-nummer, contact-e-mail, Instagram-link, navigatielinks en de melding "Veilig betalen via Mollie".

**Belangrijk:** vrijwel alle teksten op de landingspagina lopen via `useContent()` (`lib/hooks/useContent.ts`). Die haalt teksten op uit de Supabase-tabel `site_content` via `/api/content`. Wat in de database staat **overschrijft** de fallback-tekst in de code. Teksten wijzig je dus via **/admin/content**, niet in de code.

---

## 4. Aanvraag- en betaalflow

```
Landingspagina (PropertyForm)
  → postcode + huisnummer + Funda-link invullen
  → /api/geocode (adres opzoeken) en Funda-link validatie
  → Woning-overzicht + Google Maps ter bevestiging
  → /checkout (gegevens via sessionStorage)
       → contactgegevens + e-mailverificatie (/api/verify-email/*)
       → /api/mollie/create-payment  → redirect naar Mollie
  → Mollie betaalpagina
       → /api/mollie/webhook werkt de order bij in Supabase
  → /checkout/success (bevestigingspagina)
  → Makelaar stelt rapport op → binnen 48 uur per e-mail (Resend)
```

Dagelijks om 09:00 draait `/api/cron/reminder` (zie `vercel.json`) voor herinneringen — dagelijks omdat het Vercel hobby-plan geen frequentere crons toestaat.

---

## 5. API-routes (`app/api/`)

| Route | Doel |
|---|---|
| `content` | Publieke site-teksten ophalen (CMS) |
| `geocode` | Adres opzoeken op basis van postcode + huisnummer |
| `scrape-funda` | Woninggegevens van Funda-link halen (`FundaScraperService`, cheerio) |
| `orders` | Order aanmaken/opslaan in Supabase |
| `mollie/create-payment` | Mollie-betaling starten |
| `mollie/webhook` | Betaalstatus verwerken vanuit Mollie |
| `verify-email/send` + `verify-email/check` | E-mailverificatie tijdens checkout |
| `pending-email` | Openstaande e-mailstatus checken |
| `cron/reminder` | Dagelijkse herinnering (Vercel cron) |
| `admin/login` + `admin/logout` | Admin-authenticatie (JWT-cookie) |
| `admin/content` | Teksten beheren (CMS) |
| `admin/orders` → `admin/update-payment` | Orders bijwerken |
| `admin/images` | Afbeeldingenbeheer |
| `health`, `status`, `test-*`, `debug-scrape` | Diagnose/test-endpoints |

---

## 6. Herbruikbare onderdelen (`app/components/` en `lib/`)

**Componenten**
- `PropertyForm` — aanvraagformulier in de hero
- `GoogleMap` — kaart bij het woning-overzicht
- `CheckoutForm`, `PaymentButton`, `EmailVerification` — checkoutflow
- `AnimatedWeegschaal` — geanimeerd weegschaal-logo (missiesectie)
- `StructuredData` — SEO structured data (JSON-LD)

**Lib**
- `lib/services/` — `DatabaseService` (Supabase), `EmailService` (Resend), `FundaScraperService` / `ScrapingService`, `ContentService`
- `lib/hooks/` — `useContent` (CMS-teksten), `useFundaScraper`, `useScrollAnimation`
- `lib/utils/` — `linkValidator` (Funda-URL-validatie), `logger`, `rateLimit`
- `lib/middleware/validation.middleware.ts` — inputvalidatie voor API-routes
- `lib/admin/auth.ts` — JWT-hulpmiddelen voor admin-auth
- `lib/config/` — app- en Supabase-configuratie

---

## 7. Database (Supabase)

SQL-bestanden in de projectroot, uit te voeren in de Supabase SQL Editor:

| Bestand | Doel |
|---|---|
| `database-setup.sql` | Basistabellen (o.a. orders) |
| `database-admin-setup.sql` | `site_content`-tabel (CMS) + seed met standaardteksten |
| `database-security-fix.sql` | RLS-policies (Row Level Security) |
| `database-content-update-stappenplan.sql` | Eenmalige update: nieuwe stappenplan-teksten in een bestaande database |

> **Let op:** de seed gebruikt `ON CONFLICT DO NOTHING`. Bestaande rijen worden dus nooit overschreven door de seed opnieuw te draaien. Voor de nieuwe stappenplan-teksten in een al gevulde database draai je `database-content-update-stappenplan.sql` (of pas je de teksten aan via /admin/content).

---

## 8. Assets

| Map | Inhoud |
|---|---|
| `public/hoe-werkt-het/` | Geoptimaliseerde stappenplan-illustraties (web-versies) |
| `public/landing_page_photos/` | Hero-carouselfoto's (Unsplash) |
| `public/animaties/` | Weegschaal-video |
| `public/*.png` | Logo's en weegschaal-afbeelding |
| `fotos/` | **Bronbestanden** van je partner (originele illustraties + mockup). Niet direct gebruikt op de site; de web-versies staan in `public/hoe-werkt-het/` |

---

## 9. Huisstijl

- **Kleuren:** donkerblauw `#1F3C88` (primair/CTA's), gebroken wit `#FAF9F6` (achtergrond), groen-grijs `#7C8471` (accent, o.a. Instagram-knop)
- **Typografie:** serif voor koppen (`font-serif`), sans-serif voor bodytekst
- **Animaties:** Framer Motion — secties faden/schuiven in bij het scrollen (`whileInView`, eenmalig), met respect voor `prefers-reduced-motion` (`MotionConfig reducedMotion="user"`)
- **Vormentaal:** afgeronde kaarten (`rounded-2xl`), subtiele schaduwen, pill-vormige knoppen en badges

---

## 10. Deployment

- Hosting op **Vercel**; domein `www.juistebod.nl` (canonical URL's verwijzen daarnaar)
- `vercel.json` bevat de dagelijkse cron (09:00) voor `/api/cron/reminder`
- Benodigde omgevingsvariabelen (Vercel → Settings → Environment Variables): Supabase-keys, Mollie API-key, Resend API-key, Google Maps API-key, `ADMIN_JWT_SECRET`
