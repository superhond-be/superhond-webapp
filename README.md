# Superhond Forwarder (filtered + welcome + logs)

Een kleine Node.js/Express service die webhooks ontvangt, filtert (bron/topic/email) en doorstuurt naar je interne Superhond API. 
Bevat:
- Welkomstpagina (`/`)
- Health endpoint (`/health`)
- Logging (morgan)
- Filters en (optioneel) signature-check
- Rate limiting

## Quick start (lokaal)
```bash
cp .env.example .env
npm install
node server/index.js
```

Ga naar: `http://localhost:10000/` en test `POST /hook`.

## Render instellingen
- **Build Command:** `npm install`
- **Start Command:** `node server/index.js`
- **Health Check Path:** `/health`

## Environment variables (voorbeeld)
Zie `.env.example` in dit pakket. Belangrijk: `TARGET_URL` en `SH_SHARED_SECRET` invullen.

## Testen
Gebruik het aparte `superhond-forwarder-testpack.zip` met `test-forwarder.sh`.
