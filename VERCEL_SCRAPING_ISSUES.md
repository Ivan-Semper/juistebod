# Vercel Scraping Problemen - Diagnose & Oplossingen

## Probleem
De webscraper werkt wel op localhost maar niet op Vercel (https://juistebod-uxjz.vercel.app/).

## Mogelijke Oorzaken

### 1. **Vercel Timeout Limits** ⏱️
- **Hobby Plan**: 10 seconden maximum execution time
- **Pro Plan**: 60 seconden maximum execution time
- **Huidige configuratie**: 45 seconden timeout
- **Oplossing**: Timeout aangepast naar 8 seconden (Hobby) of 55 seconden (Pro)

### 2. **IP Blocking door Funda** 🚫
Funda blokkeert mogelijk Vercel's IP ranges omdat:
- Vercel IPs bekend staan als cloud/serverless providers
- Veel scrapers gebruiken cloud platforms
- Funda heeft anti-bot maatregelen

**Hoe te testen:**
```bash
# Test of Vercel IPs geblokkeerd worden
curl -I https://www.funda.nl/koop/amsterdam/
# Check de response headers en status code
```

### 3. **Bot Detection** 🤖
Funda detecteert mogelijk:
- Serverless/cloud omgevingen
- Gebrek aan browser context
- Verdachte request patterns

### 4. **Network Restrictions** 🌐
Vercel serverless functions hebben mogelijk:
- Andere DNS resolutie
- Beperkte outbound connections
- Firewall regels

## Implementeerde Oplossingen

### ✅ Timeout Aanpassingen
- Automatische detectie van Vercel omgeving
- Aangepaste timeouts voor Vercel (8s voor Hobby, 55s voor Pro)
- Minder retry attempts op Vercel (2 i.p.v. 5)

### ✅ Verbeterde Logging
- Uitgebreide error logging met Vercel-specifieke info
- HTML preview logging voor debugging
- Response header logging

## Aanbevolen Oplossingen

### Optie 1: Upgrade naar Vercel Pro Plan
- 60 seconden timeout i.p.v. 10 seconden
- Meer resources
- Betere performance

### Optie 2: Gebruik een Proxy Service
Gebruik een proxy service zoals:
- **Bright Data** (voorheen Luminati)
- **ScraperAPI**
- **ProxyMesh**

**Voorbeeld implementatie:**
```typescript
const proxyUrl = `http://${username}:${password}@${proxyHost}:${proxyPort}`;
const response = await fetch(url, {
  headers: this.buildHeaders(options.userAgent),
  agent: new HttpsProxyAgent(proxyUrl),
});
```

### Optie 3: Gebruik Vercel Edge Functions
Edge functions draaien dichter bij de gebruiker en kunnen minder snel geblokkeerd worden.

### Optie 4: Client-Side Scraping (niet aanbevolen)
Laat de browser van de gebruiker de scraping doen, maar dit heeft privacy/security issues.

### Optie 5: Gebruik een Dedicated Server
Host de scraping service op een dedicated server met een residential IP.

## Debugging Stappen

1. **Check Vercel Logs**
   - Ga naar Vercel Dashboard → Your Project → Functions
   - Bekijk de logs voor error messages

2. **Test de Debug Endpoint**
   ```bash
   curl https://juistebod-uxjz.vercel.app/api/debug-deployment
   ```

3. **Test Scraping Direct**
   ```bash
   curl -X POST https://juistebod-uxjz.vercel.app/api/scrape-funda \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.funda.nl/koop/amsterdam/huis-12345678-address/"}'
   ```

4. **Vergelijk met Localhost**
   - Test dezelfde URL op localhost
   - Vergelijk de responses

## Huidige Status

- ✅ Timeout configuratie aangepast voor Vercel
- ✅ Verbeterde error logging
- ⚠️ IP blocking mogelijk nog steeds een probleem
- ⚠️ Bot detection mogelijk nog steeds actief

## Volgende Stappen

1. Deploy de nieuwe code naar Vercel
2. Test de scraper opnieuw
3. Check de Vercel logs voor specifieke errors
4. Overweeg een proxy service als het probleem blijft

