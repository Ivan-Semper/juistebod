# Testing Guide

## Automatisch Testen

### Test Script Uitvoeren

```bash
# Test tegen localhost
npm run test:scraping

# Test tegen Vercel deployment
TEST_URL=https://juistebod-uxjz.vercel.app npm run test:scraping

# Test met een echte Funda URL
TEST_FUNDA_URL=https://www.funda.nl/koop/amsterdam/koningin-julianalaan-20-3951aa-leersum/ npm run test:scraping
```

### Wat het Test Script Doet

Het test script test alle beschikbare scraping endpoints:
1. **Basic Scraping API** (`/api/scrape-funda-basic`)
2. **Simple Scraping API** (`/api/scrape-funda-simple`)
3. **Advanced Scraping API** (`/api/scrape-funda`)
4. **Client-Side Scraping API** (`/api/scrape-funda-client`)

### Test Resultaten Interpreteren

- ✅ **SUCCESS**: Endpoint werkt en heeft data opgehaald
- ❌ **FAILED**: Endpoint faalt (meestal door IP blocking of bot detection)
- ⚠️ **WARNING**: Endpoint bestaat maar geeft onverwachte response

## Handmatig Testen

### 1. Lokaal Testen

```bash
# Start development server
npm run dev

# Open browser
# Ga naar http://localhost:3000
# Voer een Funda URL in en test
```

### 2. Live Testen (Vercel)

1. Wacht tot deployment klaar is (~2-3 minuten na git push)
2. Ga naar https://juistebod-uxjz.vercel.app/
3. Test met een echte Funda woninglink

### 3. API Direct Testen

```bash
# Test Basic API
curl -X POST http://localhost:3000/api/scrape-funda-basic \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.funda.nl/koop/amsterdam/huis-12345678-address/"}'

# Test Advanced API
curl -X POST http://localhost:3000/api/scrape-funda \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.funda.nl/koop/amsterdam/huis-12345678-address/"}'
```

## Verwacht Gedrag

### Op Localhost
- ✅ Scraping werkt meestal (gebruikt jouw IP)
- ⚠️ Kan soms falen door rate limiting

### Op Vercel
- ❌ Scraping faalt meestal (Vercel IP wordt geblokkeerd)
- ✅ Betere error messages met suggestie voor handmatige invoer
- ✅ Fallback naar manual form werkt altijd

## Troubleshooting

### Alle Endpoints Falen
**Oorzaak**: IP blocking of bot detection door Funda

**Oplossingen**:
1. Gebruik handmatige invoer (altijd beschikbaar)
2. Overweeg proxy service (ScraperAPI)
3. Test vanaf ander netwerk/IP

### Timeout Errors
**Oorzaak**: Request duurt te lang

**Oplossingen**:
1. Check Vercel logs voor exacte timeout
2. Upgrade naar Vercel Pro (60s timeout)
3. Verlaag retry attempts

### CORS Errors
**Oorzaak**: Browser blokkeert cross-origin requests

**Oplossingen**:
1. Dit is normaal - Funda blokkeert CORS
2. Client-side scraping werkt niet zonder browser extension
3. Gebruik server-side scraping of manual form

## Test Data

Voor het beste testen, gebruik een **echte Funda woninglink**:
- Ga naar www.funda.nl
- Zoek een woning
- Kopieer de volledige URL
- Gebruik die in de test

**Voorbeeld echte URL format**:
```
https://www.funda.nl/koop/amsterdam/koningin-julianalaan-20-3951aa-leersum/
```

