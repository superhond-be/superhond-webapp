# Superhond – MailBlue Forwarder (met welkomstpagina)

- `/` toont een korte status-tekst (geen 'Not found' meer)
- `/health` geeft JSON status
- `POST /webhook` ontvangt MailBlue webhooks
- Filtert op `SUPERHOND_ALLOWED_TAGS` en controleert betaling via `PAID_TAGS` als `REQUIRE_PAID=true`

## Quick start
```bash
npm install
cp .env.example .env   # pas URL en tags aan
npm run dev
```
