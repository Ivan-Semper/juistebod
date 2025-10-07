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
- Zorg dat je `.env.local` file in de root van je project staat (niet in een subfolder)
- Herstart altijd je development server na het toevoegen van environment variabelen
- Check de browser console voor error messages
- Zorg dat je API key de juiste APIs heeft geactiveerd

