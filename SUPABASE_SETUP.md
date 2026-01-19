# Supabase Database Setup Instructies

## Stap 1: Maak een nieuw Supabase project aan

1. Ga naar [https://supabase.com](https://supabase.com)
2. Log in met je account (of maak een nieuw account aan)
3. Klik op **"New Project"**
4. Vul in:
   - **Name**: `juistebod` (of een andere naam)
   - **Database Password**: Kies een sterk wachtwoord (sla dit op!)
   - **Region**: Kies de dichtstbijzijnde regio (bijv. `West Europe`)
5. Klik op **"Create new project"**
6. Wacht 2-3 minuten tot het project klaar is

## Stap 2: Haal je API keys op

1. In je Supabase dashboard, ga naar **Settings** (tandwiel icoon) > **API**
2. Je ziet nu:
   - **Project URL** - Dit is je `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key - Dit is je `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key - Dit is je `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Geheim!)

## Stap 3: Voer de SQL queries uit

1. In je Supabase dashboard, klik op **SQL Editor** in het linker menu
2. Klik op **"New query"**
3. Open het bestand `database-setup.sql` in je project
4. Kopieer **alle** SQL code uit dat bestand
5. Plak het in de SQL Editor
6. Klik op **"Run"** (of druk op Ctrl+Enter)
7. Je zou moeten zien: "Success. No rows returned"

## Stap 4: Update je .env.local file

Open je `.env.local` file en vervang de Supabase waarden:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Waar vind je deze waarden?**
- Ga naar Supabase Dashboard > Settings > API
- Kopieer de waarden van daar

## Stap 5: Test de database connectie (lokaal én productie)

1. **Herstart je development server** (belangrijk!)
   ```bash
   # Stop de server (Ctrl+C) en start opnieuw
   npm run dev
   ```

2. Test lokaal:
   - Open: `http://localhost:3000/api/test-connections`
   - Of run: `node test-db.js`

3. Test in productie:
   - In productie zijn test-routes uitgeschakeld.
   - Gebruik de SQL check in Stap 6 om te verifiëren dat de tabellen bestaan.

## Stap 6: Zet je Supabase keys in Vercel (productie)

1. Ga naar Vercel → Project → **Settings** → **Environment Variables**
2. Voeg toe (Production):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Klik op **Save**
4. **Redeploy** je project zodat de env vars actief worden

## Stap 7: Verifieer dat de tabellen bestaan

In Supabase SQL Editor, run deze query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('orders', 'property_reports');
```

Je zou beide tabellen moeten zien:
- `orders`
- `property_reports`

## Database Structuur

### Orders Table
Slaat alle bestellingen op met:
- Klant informatie (email, naam, etc.)
- Property data (JSON)
- Payment status
- Order status

### Property Reports Table
Slaat de gegenereerde rapporten op met:
- Link naar order
- File URL en filename
- Verzend datum

## Troubleshooting

### "relation does not exist"
- Zorg dat je alle SQL queries hebt uitgevoerd
- Check of je in de juiste database bent (public schema)

### "permission denied"
- Check of je de service_role key gebruikt (niet de anon key)
- Zorg dat RLS policies correct zijn ingesteld

### "connection failed"
- Check of je `.env.local` de juiste waarden heeft
- Herstart je development server
- Check of je Supabase project actief is (niet paused)

### Database is "paused"
- Supabase pauzeert gratis projecten na inactiviteit
- Ga naar je dashboard en klik op "Restore" of "Resume"

## Veiligheid

⚠️ **BELANGRIJK:**
- De `SUPABASE_SERVICE_ROLE_KEY` heeft volledige toegang tot je database
- **DEEL DIT NOOIT** publiekelijk
- Gebruik alleen in server-side code (API routes)
- Gebruik `NEXT_PUBLIC_SUPABASE_ANON_KEY` voor client-side code

## Kosten

Supabase heeft een gratis tier:
- 500 MB database storage
- 2 GB bandwidth
- Meer dan genoeg voor development en kleine projecten

Voor productie kan je upgraden naar een betaald plan als je meer nodig hebt.
