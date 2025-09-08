# Superhond – MailBlue Webhook (Node.js/Express)

Kleine, veilige webhook-listener om **MailBlue/ActiveCampaign** webhooks te ontvangen en
de payloads lokaal op te slaan voor verdere verwerking in het Superhond-registratiesysteem.

## Wat kan dit?
- POST `/webhook` ontvangt events (b.v. nieuwe inschrijving, formulier, lijst-subscribe).
- Slaat **elke ruwe payload** op als JSON-bestand in `data/webhooks/` met tijdstempel.
- Eenvoudige (optionele) HMAC-handtekeningcontrole via `X-Signature` header.
- Health check op `GET /health`.

## Snel starten
1. Pak het zip-bestand uit.
2. Open een terminal in de map en voer uit:
   ```bash
   npm install
   npm run dev   # of: npm start
   ```
3. Maak desgewenst een `.env` op basis van `.env.example` (poort en WEBHOOK_SECRET).
4. Exposeer of forward de endpoint (vb. via ngrok) en stel bij MailBlue de **Webhook URL** in:
   ```
   https://<jouw-host>/webhook
   ```

## Testen
- Health: open in je browser `http://localhost:3000/health`
- Test POST (voorbeeld met curl):
  ```bash
  curl -X POST http://localhost:3000/webhook       -H "Content-Type: application/json"       -d '{"type":"test","contact":{"email":"test@superhond.be"}}'
  ```
→ Je zou een `data/webhooks/<timestamp>.json` bestand moeten zien met de payload.

## Integreren met Superhond
- Een aparte job kan periodiek `data/webhooks/` uitlezen en
  - nieuwe klanten/honden toevoegen,
  - credits/inschrijvingen toewijzen,
  - of ontbrekende gegevens in je dashboard opvragen.

## Opmerkingen
- De signature-check is **vereenvoudigd**. Als MailBlue/ActiveCampaign een vaste signing-methode gebruikt voor webhooks (raw-body HMAC, specifieke headernaam), pas `verifySignature()` dan aan op basis van hun documentatie.
- Voor iPad/iPhone: een zip van een paar 10‑tallen KB of meer is **normaal**. Als je slechts enkele bytes ziet, dan is het archief leeg.
