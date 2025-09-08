# Superhond – MailBlue Webhook → Directe koppeling

Deze versie stuurt elke ontvangen webhook **onmiddellijk** door naar jouw
**Superhond API** en bevat:

- Exponentiële **retry** (tot 5x direct), logging in `data/forwarder.log`
- **Persistente queue** in `data/queue/` als doorsturen tijdelijk faalt
- Automatische **background worker** die queued items herprobeert
- Health endpoint (`/health`) en eenvoudige HMAC‑check (optioneel)

## Configuratie
Vul `.env` in op basis van `.env.example`:
- `SUPERHOND_API_URL` → jouw endpoint dat de payload verwacht (POST JSON)
- `SUPERHOND_API_KEY` → optioneel, wordt als `Authorization: Bearer <key>` meegestuurd
- `WEBHOOK_SECRET` → optioneel, HMAC‑check voor inkomende webhooks

## Start
```bash
npm install
npm run dev   # of: npm start
```

## Testen
1) Health check: `http://localhost:3000/health`  
2) Simuleer een event:
```bash
curl -X POST http://localhost:3000/webhook     -H "Content-Type: application/json"     -d '{"type":"subscribe","contact":{"email":"demo@superhond.be","first_name":"Demo"}}'
```
- Je ziet logs in `data/forwarder.log` en, bij falen, JSON-bestanden in `data/queue/`.

## Superhond API contract (voorbeeld)
Het forward‑body formaat is:
```json
{
  "source": "mailblue",
  "receivedAt": "2025-09-08T12:00:00.000Z",
  "storedFile": "data/webhooks/2025-09-08T12-00-00-000Z.json",
  "payload": { ...originele MailBlue data... }
}
```
Pas je backend aan om dit te verwerken (b.v. contact aanmaken, credits toewijzen).
