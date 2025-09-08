# Superhond – MailBlue Forwarder (Clean)

Deze server ontvangt **MailBlue webhooks** en stuurt ze door naar de Superhond API.

## Features
- Endpoint: `POST /webhook`
- Slaat elke payload op in `data/webhooks/`
- Checkt op betaal-tags (standaard: "Betaling voldaan")
- Alleen betaalde events worden doorgestuurd naar de Superhond API (als `REQUIRE_PAID=true`)
- Forward met retries en queue als Superhond API tijdelijk niet bereikbaar is
- Logging naar `data/forwarder.log`

## Quick start
```bash
npm install
cp .env.example .env
npm run dev
```

Health check: [http://localhost:3000/health](http://localhost:3000/health)

## Config
- `SUPERHOND_API_URL`: waar de payload heen moet
- `SUPERHOND_API_KEY`: optioneel, Bearer token
- `REQUIRE_PAID`: true/false
- `PAID_TAGS`: komma-gescheiden lijst tags die betaling aanduiden
- `QUEUE_INTERVAL_MS`: wachttijd voor de queue worker
