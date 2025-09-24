# Environment Variables Setup

## Stap 1: Kopieer deze inhoud naar je .env.local bestand

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE5NTYzNTUyMDB9.example
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTk1NjM1NTIwMH0.example

# Mollie Configuration (voor later)
MOLLIE_API_KEY=test_your_mollie_test_key_here
MOLLIE_WEBHOOK_URL=https://yourdomain.com/api/mollie/webhook

# Google Maps (als je die gebruikt)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

## Stap 2: Vervang de placeholder waarden

1. **NEXT_PUBLIC_SUPABASE_URL**: Ga naar je Supabase dashboard → Project Settings → API → kopieer de Project URL
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Kopieer de anon public key
3. **SUPABASE_SERVICE_ROLE_KEY**: Kopieer de service_role secret key

## Stap 3: Test de connectie

```bash
npm run dev
```

## Stap 4: Test de database

```bash
node test-db.js
```
