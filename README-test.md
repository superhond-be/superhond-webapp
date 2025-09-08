# Superhond Forwarder – Testpakket

Dit pakket helpt je snel testen of je forwarder draait en correct filtert.

## Voorwaarden
- Forwarder staat online (Render) of lokaal op `http://localhost:3000`
- In je `.env`:
  - REQUIRE_PAID=true
  - PAID_TAGS=Betaling voldaan
  - SUPERHOND_ALLOWED_TAGS=Pubergroep,Basisgroep,Puppy Pack Conect & Special

## Bestanden
- test/test-payload-allowed.json — bevat tag "Basisgroep" → **zou worden doorgestuurd**
- test/test-payload-skipped.json — bevat tag "Coachweekend Zeeland" → **zou worden overgeslagen**
- curl-allowed.sh — post allowed payload
- curl-skipped.sh — post skipped payload

## Gebruik
1) Health check in je browser:
   - `https://<jouw-render-app>.onrender.com/`
   - `https://<jouw-render-app>.onrender.com/health`

2) Test payload sturen (Render):
   ```sh
   chmod +x curl-allowed.sh curl-skipped.sh
   ./curl-allowed.sh https://<jouw-render-app>.onrender.com
   ./curl-skipped.sh https://<jouw-render-app>.onrender.com
   ```

3) Resultaat
- Je krijgt in de response `200` (doorgestuurd) of `202` (gesaved/queued/skipped).
- Kijk op de server naar mappen:
  - `data/webhooks/` — alle ruwe payloads
  - `data/skipped-non-superhond/` — skipped door geen toegestane tag
  - `data/pending-unpaid/` — geen betaald-tag (als REQUIRE_PAID=true)
  - `data/forwarder.log` — logboek
