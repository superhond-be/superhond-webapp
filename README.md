# Superhond – MailBlue Forwarder (welkomstpagina + uitgebreide logging)

- `/` toont een korte status-tekst
- `/health` geeft JSON status
- `POST /webhook` ontvangt MailBlue webhooks
- Filtert op `SUPERHOND_ALLOWED_TAGS` en controleert betaling via `PAID_TAGS` als `REQUIRE_PAID=true`
- **Uitgebreide logging**: logt de ontvangen tags en of het event is forwarded, skipped of unpaid

## Quick start
```bash
npm install
cp .env.example .env   # pas URL en tags aan
npm run dev
```

## Logs
- Console logs (Render runtime) laten zien: ontvangen tags, reden van skip/unpaid en of forwarding gelukt is
- Bestanden:
  - `data/webhooks/` — alle ruwe payloads
  - `data/skipped-non-superhond/` — geen toegestane tag
  - `data/pending-unpaid/` — geen betaald-indicator
  - `data/queue/` — retry queue
  - `data/forwarder.log` — best-effort logboek
