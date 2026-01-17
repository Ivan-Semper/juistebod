# Google Maps API Setup Instructies

## Probleem
Je Google Maps API werkt niet omdat de API key niet is geconfigureerd.

## Oplossing

### Stap 1: Maak een .env.local file
Maak een nieuwe file aan genaamd `.env.local` in de root van je project (juistebod folder).

### Stap 2: Voeg je Google Maps API key toe
Voeg de volgende regel toe aan je `.env.local` file:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=jouw_google_maps_api_key_hier
```

### Stap 3: Haal een Google Maps API key op

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een nieuw project aan of selecteer een bestaand project
3. Ga naar "APIs & Services" > "Credentials"
4. Klik op "Create Credentials" > "API Key"
5. Kopieer je API key
6. Plak de API key in je `.env.local` file

### Stap 4: Activeer de benodigde APIs
In de Google Cloud Console, ga naar "APIs & Services" > "Library" en activeer:
- **Maps JavaScript API**
- **Geocoding API**
- **Places API** (optioneel, voor geavanceerde functionaliteit)

### Stap 5: Beperk je API key (aanbevolen)
Voor veiligheid, beperk je API key:
1. Ga naar "APIs & Services" > "Credentials"
2. Klik op je API key
3. Onder "Application restrictions", selecteer "HTTP referrers (web sites)"
4. Voeg toe: `localhost:3000/*`, `localhost:3001/*`, en je productie domain
5. Onder "API restrictions", selecteer "Restrict key" en kies alleen de APIs die je gebruikt

### Stap 6: Herstart je development server
Stop je development server (Ctrl+C) en start hem opnieuw:

```bash
npm run dev
```

## Voorbeeld .env.local file
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optioneel: Supabase configuratie
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Kosten
Google Maps API heeft een gratis tier:
- Maps JavaScript API: $0.007 per load (eerste 28,000 loads per maand gratis)
- Geocoding API: $0.005 per request (eerste 40,000 requests per maand gratis)

Dit is meer dan genoeg voor development en kleine projecten.

## Troubleshooting

### Veelvoorkomende problemen waarom Google Maps API stopt met werken:

#### 1. API Key Restricties te streng
**Symptoom:** "RefererNotAllowedMapError" of "InvalidKeyMapError" in console

**Oplossing:**
- Ga naar Google Cloud Console > APIs & Services > Credentials
- Klik op je API key
- Onder "Application restrictions", zorg dat je hebt:
  - `localhost:3000/*`
  - `localhost:3001/*`
  - Je productie domain (bijv. `https://jouwsite.nl/*`)
- **Let op:** Als je restricties hebt ingesteld, moet je exacte URL matchen!

#### 2. Billing niet ingeschakeld
**Symptoom:** "BillingNotEnabledMapError" of kaart laadt niet

**Oplossing:**
- Google vereist sinds 2018 een billing account (zelfs voor gratis tier)
- Ga naar Google Cloud Console > Billing
- Voeg een billing account toe (je wordt alleen gefactureerd boven de gratis quota)
- Gratis tier: 28,000 map loads + 40,000 geocoding requests per maand

#### 3. API niet geactiveerd
**Symptoom:** "ApiNotActivatedMapError"

**Oplossing:**
- Ga naar APIs & Services > Library
- Zoek en activeer:
  - **Maps JavaScript API** (verplicht)
  - **Geocoding API** (verplicht)
  - **Places API** (optioneel, alleen als je Places gebruikt)

#### 4. Quota overschreden
**Symptoom:** "OverQueryLimitMapError" of kaart werkt soms wel, soms niet

**Oplossing:**
- Check je gebruik in Google Cloud Console > APIs & Services > Dashboard
- Wacht tot quota reset (meestal maandelijks)
- Overweeg billing account voor hogere quota

#### 5. Environment variable niet geladen
**Symptoom:** "API key niet gevonden" error

**Oplossing:**
- Zorg dat `.env.local` in de **root** van je project staat (niet in app/ of andere folders)
- Zorg dat de variabele begint met `NEXT_PUBLIC_` (vereist voor client-side)
- **Herstart je development server** na het toevoegen/wijzigen van .env.local
- Check of er geen typos zijn in de variabele naam

#### 6. API key ongeldig of verwijderd
**Symptoom:** Kaart laadt niet, geen specifieke error

**Oplossing:**
- Check of je API key nog bestaat in Google Cloud Console
- Genereer een nieuwe key als de oude is verwijderd
- Update `.env.local` met de nieuwe key
- Herstart development server

### Test je API key

Je kunt je API key testen via:
```
http://localhost:3000/api/test-google-maps
```

Deze route geeft gedetailleerde informatie over wat er mis is met je API key.

### Algemene tips
- Zorg dat je `.env.local` file in de root van je project staat (niet in een subfolder)
- Herstart altijd je development server na het toevoegen van environment variabelen
- Check de browser console (F12) voor specifieke error messages
- Zorg dat je API key de juiste APIs heeft geactiveerd
- Check of billing is ingeschakeld (vereist sinds 2018)

