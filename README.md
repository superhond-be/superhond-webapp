# Superhond – Voorbeeld API endpoint

Dit is een **voorbeeld** van het endpoint dat de forwarder aanroept:
- Route: `POST /external/mailblue`
- Ontvangt body van de forwarder: `{ source, receivedAt, storedFile, payload }`
- Slaat de ruwe payload op in `data/raw/`
- Map naar domein: **klant**, optioneel **hond**, optioneel **credits**
- Upsert klant/hond en voegt credits toe in `data/db/*.json`

## Snel starten
```bash
npm install
cp .env.example .env
npm run dev   # of: npm start
```

Health: `http://localhost:4000/health`

## Handmatige test (zonder forwarder)
```bash
curl -X POST http://localhost:4000/external/mailblue     -H "Content-Type: application/json"     -d '{
    "source":"mailblue",
    "receivedAt":"2025-09-08T12:00:00.000Z",
    "payload": {
      "contact": { "email": "demo@superhond.be", "first_name": "Demo", "last_name": "Klant", "phone": "0485 12 34 56" },
      "fields": { "hond": "Bobby", "ras": "Border Collie", "aantal_credits": 9, "lestype": "Puppy" }
    }
  }'
```
→ Resultaat bevat aangemaakte of geüpdatete klant/hond en eventuele credits.

## Data-bestanden
- `data/db/customers.json`
- `data/db/dogs.json`
- `data/db/credits.json`
- `data/raw/*.json` (ruwe inkomende payloads)

## Aanpassen van mapping
In `services/mapper.js` kan je de sleutel-namen van je MailBlue custom fields aanpassen
(bv. `hond`, `ras`, `aantal_credits`, `lestype`, ...).
