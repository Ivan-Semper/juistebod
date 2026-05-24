# JuisteBod.nl — Persoonlijk Woningbodadvies Platform

> Full-stack webapplicatie waarmee woningzoekers in Nederland binnen 24 uur persoonlijk bodadvies ontvangen van een vastgoedprofessional. Van property lookup tot betaling en e-mailnotificatie — volledig geautomatiseerd.

**Live:** [juistebod.nl](https://juistebod.nl)

---

## Het probleem

De Nederlandse woningmarkt is oververhit. Huizen worden binnen dagen verkocht, vaak ver boven de vraagprijs. Starters en doorstromers weten niet hoeveel ze moeten bieden. Een aankoopmakelaar kost al snel €1.500–€3.000 — onbetaalbaar voor veel kopers.

JuisteBod biedt persoonlijk bodadvies van een vastgoedprofessional voor een fractie van die prijs: €49,95 excl. BTW.

---

## Mijn rol

Volledige technische realisatie: architectuur, frontend, backend, database-ontwerp, API-integraties, betalingsflow, e-mailsysteem, admin panel, security, SEO en deployment.

---

## Technische stack

| Categorie | Technologie |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Taal** | TypeScript |
| **Styling** | Tailwind CSS v4 + Framer Motion |
| **Database** | Supabase (PostgreSQL) |
| **Betalingen** | Mollie API |
| **E-mail** | Resend |
| **Maps** | Google Maps Geocoding API |
| **Authenticatie** | JWT (jose) met httpOnly cookies |
| **Grafieken** | Recharts |
| **Hosting** | Vercel |
| **Analytics** | Vercel Speed Insights |

---

## Features

### 1. Property Lookup & Web Scraping

Gebruikers voeren een postcode en huisnummer in. Het systeem:

- **Geocodeert** het adres via de Google Maps Geocoding API naar een volledig straatadres
- **Scrapet** woningdata van Funda.nl en Jaap.nl met Cheerio (server-side HTML parsing)
- Toont de woning op een **interactieve Google Map**
- Heeft **retry-logica** met exponential backoff en bot-detectie handling

```
Gebruiker → Postcode + Huisnummer + Funda-link
                ↓
        Google Maps Geocoding API → Volledig adres
                ↓
        Funda/Jaap scraper → Woningdata (prijs, kenmerken)
                ↓
        Resultaat met Google Maps kaart
```

### 2. Checkout & Betalingsflow

Een volledige e-commerce flow met Mollie als payment provider:

- Gebruiker vult contactgegevens in (naam, e-mail, telefoon)
- **Server-side validatie**: e-mail regex, lengte-checks, rate limiting
- Order wordt opgeslagen in Supabase met status `pending`
- Mollie payment wordt aangemaakt met het orderbedrag uit de database (niet van de client)
- Gebruiker betaalt via Mollie (iDEAL, creditcard, etc.)
- **Webhook** ontvangt betaalstatus van Mollie en update de order
- Bij succesvolle betaling worden automatisch e-mails verstuurd

```
Checkout form → POST /api/orders (order aanmaken)
      ↓
POST /api/mollie/create-payment (betaling starten)
      ↓
Mollie checkout → Gebruiker betaalt
      ↓
POST /api/mollie/webhook (status update)
      ↓
EmailService → Bevestiging klant + Notificatie admin
      ↓
Redirect → /checkout/success
```

### 3. E-mailnotificaties (Resend)

Na succesvolle betaling worden automatisch twee e-mails verstuurd:

- **Klant**: Bevestigingsmail met orderdetails en wat te verwachten
- **Admin**: Notificatiemail met alle orderinformatie en woninggegevens

Beide e-mails zijn volledig in HTML opgemaakt met inline styling voor maximale compatibiliteit.

### 4. Admin Panel

Een compleet beheerssysteem achter JWT-authenticatie:

#### Dashboard
- **Statistieken**: Totaal orders, betaalde orders, openstaand, totale omzet
- **Grafieken**: Orders per dag (staafdiagram), betalingsstatus (taartdiagram), omzet over tijd (lijndiagram)
- Overzicht van recente bestellingen

#### Orderbeheer
- Tabelweergave met alle orders
- Detail-modal met volledige orderinformatie
- Status-badges voor betaal- en orderstatus
- Mogelijkheid om betalingsstatus handmatig bij te werken

#### Content Management (CMS)
- Alle teksten op de homepage zijn bewerkbaar
- Georganiseerd per sectie (hero, prijzen, stappen, missie, etc.)
- Bulk-updates: meerdere velden tegelijk opslaan
- Prijswijzigingen worden automatisch overal doorgevoerd

#### Afbeeldingenbeheer
- Upload en vervang hero-afbeeldingen (7 stuks in carousel)
- Logo's en contactfoto wijzigen
- Success-pagina achtergrond aanpassen

### 5. Security

Meerdere beveiligingslagen:

- **JWT-authenticatie** met httpOnly cookies voor het admin panel
- **Next.js Middleware** beschermt alle `/admin` routes en admin API-endpoints
- **Rate limiting** op alle publieke API's:
  - Scraping: 100 requests / 15 min per IP
  - Betalingen: 5 requests / min per IP
  - Orders: 10 requests / min per IP
- **Server-side validatie** van alle input (geen client-supplied bedragen bij betalingen)
- **Security headers**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Row Level Security (RLS)** op alle Supabase tabellen
- **Gesanitizeerde foutmeldingen**: geen gevoelige data in API responses

### 6. SEO

- **JSON-LD Structured Data**: LocalBusiness, Product, FAQPage en WebSite schema's
- **Open Graph & Twitter Cards**: Geoptimaliseerd voor social media sharing
- **Meta tags**: Dynamische titels, beschrijvingen, keywords
- **Canonical URLs**: Voorkomt duplicate content
- **Sitemap.xml**: Automatisch gegenereerd
- **robots.txt**: Admin en API routes uitgesloten van indexering
- **Beschrijvende alt-teksten** op alle afbeeldingen
- **Google Search Console**: Verificatie voorbereid via environment variable

### 7. UX & Design

- **Responsive design**: Werkt op desktop, tablet en mobiel
- **Smooth animaties**: Scroll-gebaseerde animaties met Framer Motion
- **Hero image carousel**: 7 afbeeldingen met random startpunt en automatische wisseling
- **Smart navigation**: Header verdwijnt bij scrollen naar beneden, verschijnt bij omhoog scrollen
- **Custom error pages**: 404 en error boundary met consistente styling
- **Hamburger menu**: Mobiel navigatiemenu

---

## Database-ontwerp

Drie tabellen in Supabase (PostgreSQL):

### `orders`
Bevat alle bestellingen met klantgegevens, woningdata (JSONB), betalingsstatus en Mollie payment ID. Geïndexeerd op e-mail, status en datum voor snelle queries in het admin dashboard.

### `property_reports`
Koppeltabel voor het opgeslagen rapport per order, inclusief bestandslocatie en verzenddatum.

### `site_content`
CMS-tabel met key-value pairs per sectie. Maakt het mogelijk om alle teksten en prijzen via het admin panel aan te passen zonder code te wijzigen.

---

## Architectuur

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Next.js 15 (App Router) + Tailwind + Framer    │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Landing  │  │ Checkout │  │  Admin Panel  │  │
│  │  Page    │  │  Flow    │  │  (Protected)  │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
└──────────────────┬──────────────────────────────┘
                   │ API Routes
┌──────────────────▼──────────────────────────────┐
│                   Backend                        │
│  Next.js API Routes + Middleware                 │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Scraping │  │ Payment  │  │   Content     │  │
│  │ Service  │  │ Service  │  │   Service     │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Rate    │  │  Auth    │  │   Email       │  │
│  │ Limiter  │  │ (JWT)    │  │   Service     │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
└──────────┬───────────┬──────────────┬───────────┘
           │           │              │
    ┌──────▼──┐  ┌─────▼────┐  ┌─────▼────┐
    │Supabase │  │  Mollie  │  │  Resend  │
    │  (DB)   │  │(Payments)│  │ (Email)  │
    └─────────┘  └──────────┘  └──────────┘
           │
    ┌──────▼──────┐
    │ Google Maps │
    │    API      │
    └─────────────┘
```

---

## Projectstructuur

```
juistebod/
├── app/
│   ├── api/
│   │   ├── mollie/          # Betalingen (create-payment, webhook)
│   │   ├── admin/           # Admin API's (login, content, images)
│   │   ├── orders/          # Orderbeheer
│   │   ├── geocode/         # Adres lookup
│   │   ├── scrape-funda/    # Property scraping
│   │   └── content/         # CMS content
│   ├── admin/               # Admin panel pagina's
│   │   ├── dashboard/       # Statistieken & grafieken
│   │   ├── orders/          # Orderbeheer
│   │   ├── content/         # Tekst editor
│   │   └── images/          # Afbeeldingenbeheer
│   ├── checkout/            # Checkout flow + success
│   ├── components/          # Herbruikbare componenten
│   └── page.tsx             # Landing page
├── lib/
│   ├── services/            # Business logic (DB, Email, Scraping)
│   ├── utils/               # Rate limiting, logging
│   ├── config/              # Supabase & app configuratie
│   ├── middleware/           # Validatie middleware
│   ├── admin/               # Auth utilities
│   ├── hooks/               # React hooks (useContent, useFundaScraper)
│   └── types/               # TypeScript interfaces
├── public/                  # Statische assets & afbeeldingen
├── middleware.ts             # Route protection
└── database-setup.sql        # Database schema
```

---

## Geleerde lessen

- **Server-side payment validation is essentieel**: Bedragen worden nooit van de client geaccepteerd maar altijd uit de database gehaald
- **Serverless functies en async operaties**: Op Vercel moet je async werk (zoals e-mail versturen) awaiten voordat je een response stuurt, anders wordt de functie vroegtijdig beëindigd
- **Rate limiting in serverless**: In-memory rate limiting werkt beperkt op serverless (elke invocation kan een nieuwe instance zijn), maar biedt alsnog bescherming tegen snelle bursts
- **Web scraping is fragiel**: Funda en Jaap veranderen regelmatig hun HTML-structuur; retry-logica en fallback-strategieën zijn noodzakelijk
- **CMS via database**: Door teksten en prijzen in een database op te slaan in plaats van hardcoded, kan de klant zelf aanpassingen doen zonder developer-interventie

---

## Resultaat

Een volledig functioneel platform dat live staat op [juistebod.nl](https://juistebod.nl). De eigenaar kan zelfstandig:
- Teksten en prijzen aanpassen
- Afbeeldingen vervangen
- Orders monitoren en beheren
- Omzetstatistieken inzien

Klanten doorlopen een soepele flow van woning opzoeken → gegevens invullen → betalen → bevestiging ontvangen, zonder handmatige tussenkomst.
