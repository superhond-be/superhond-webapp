# Superhond Forwarder + Lessen (Render-ready)

Routes:
- `/` → welkom
- `/health` → ok:true
- `/about` → env-waarden
- `/selftest` → test POST naar TARGET_URL
- `/hook` → intake endpoint (met X-SH-Shared-Secret)
- `/lessons` → lesbeheer API (GET/POST/PUT/DELETE)

## Testscript
Zie `test.sh` voor een bash-script om alle routes snel te testen.
