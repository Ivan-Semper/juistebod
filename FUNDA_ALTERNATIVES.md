# Alternatieven voor Funda Scraping op Vercel

## Probleem
Server-side scraping werkt niet op Vercel door IP blocking en bot detection van Funda.

## Beschikbare Alternatieven

### ✅ 1. Client-Side Scraping (Aanbevolen)
**Hoe het werkt:** Laat de browser van de gebruiker de scraping doen via een client-side fetch.

**Voordelen:**
- Gebruikt het IP van de gebruiker (niet Vercel)
- Geen bot detection (echte browser)
- Geen extra kosten
- Werkt direct

**Nadelen:**
- CORS kan een probleem zijn (maar Funda heeft geen strikte CORS)
- Gebruiker moet JavaScript aan hebben staan

**Implementatie:** ✅ Wordt geïmplementeerd

---

### 2. Proxy Service (ScraperAPI / Bright Data)
**Hoe het werkt:** Gebruik een betaalde proxy service die residential IPs gebruikt.

**Voordelen:**
- Betrouwbaar
- Werkt op server-side
- Geen CORS problemen

**Nadelen:**
- Kosten: ~$50-200/maand
- Extra dependency
- API key nodig

**Services:**
- **ScraperAPI**: $49/maand voor 10k requests
- **Bright Data**: $500+/maand
- **ScraperBox**: $29/maand

---

### 3. Browser Automation Service (ScraperAPI Browser Mode)
**Hoe het werkt:** Service gebruikt headless browsers met residential IPs.

**Voordelen:**
- Zeer betrouwbaar
- Werkt als echte browser
- Geen bot detection

**Nadelen:**
- Duurder dan proxy
- Langzamer (browser moet laden)
- ~$100-300/maand

---

### 4. Dedicated Scraping Server
**Hoe het werkt:** Host scraping op een aparte server (bijv. DigitalOcean, Hetzner).

**Voordelen:**
- Volledige controle
- Geen timeout limits
- Residential IP mogelijk

**Nadelen:**
- Extra server kosten (~$5-20/maand)
- Extra onderhoud
- Complexere architectuur

**Implementatie:**
- Next.js API route op Vercel → Proxy naar je server
- Server doet scraping → Retourneert data

---

### 5. Third-Party Funda APIs
**Hoe het werkt:** Gebruik services die al Funda data scrapen.

**Services:**
- **Apify Funda Scraper**: Pay-per-use
- **ScrapeIt**: Custom data feeds
- **Funda API** (officieel): Bestaat niet publiekelijk

**Nadelen:**
- Vaak duur
- Minder controle
- Dependency op externe service

---

### 6. Browser Extension
**Hoe het werkt:** Laat gebruikers een browser extension installeren die data ophaalt.

**Voordelen:**
- Volledige browser context
- Geen server-side problemen
- Gebruiker heeft controle

**Nadelen:**
- Gebruikers moeten extension installeren
- Extra development
- Maintenance overhead

---

## Aanbevolen Oplossing: Client-Side Scraping

**Waarom:**
1. ✅ Gratis
2. ✅ Werkt direct
3. ✅ Geen bot detection (echte browser)
4. ✅ Geen extra services nodig
5. ✅ Eenvoudig te implementeren

**Implementatie:**
- Maak een API route die alleen de URL valideert
- Client-side fetch naar Funda (vanuit browser)
- Parse HTML in browser of stuur naar API voor parsing
- Fallback naar manual form als het niet werkt

---

## Implementatie Plan

1. ✅ Client-side scraping endpoint maken
2. ✅ Frontend aanpassen om client-side te proberen
3. ✅ Fallback naar manual form
4. ⚠️ Optioneel: Proxy service als backup

