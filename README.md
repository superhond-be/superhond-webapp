# Superhond Forwarder Testpack

Dit pakket bevat een eenvoudig script om je forwarder op Render te testen.

## Inhoud
- `test-forwarder.sh` — Bash script met 3 tests + health check

## Gebruik
1. Pas bovenaan in `test-forwarder.sh` de variabelen aan:
   - `BASE_URL` = jouw forwarder URL op Render (bijv. https://superhond-forwarder.onrender.com)
   - `SECRET` = dezelfde waarde als `SH_SHARED_SECRET` die je in Render hebt ingesteld

2. Maak het script uitvoerbaar (eenmalig):
   ```bash
   chmod +x test-forwarder.sh
   ```

3. Voer het script uit:
   ```bash
   ./test-forwarder.sh
   ```

## Output
- Test 1: Toegelaten payload → forwarded (ok:true, forwarded:true)
- Test 2: Topic niet toegestaan → gefilterd (ok:true, forwarded:false)
- Test 3: Fout shared secret → geweigerd (ok:false, error:"Bad shared secret")
- Health check → ok:true

## Vereisten
- `curl`
- `jq` (voor nette JSON output)
