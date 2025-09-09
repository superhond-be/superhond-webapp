# Superhond Forwarder + Lessen (Render-ready)

Routes:
- `/` → welkom
- `/health` → ok:true
- `/about` → env-waarden
- `/selftest` → test POST naar TARGET_URL
- `/hook` → intake endpoint (met X-SH-Shared-Secret)
- `/lessons` → **lesbeheer API** (GET/POST/PUT/DELETE)

## Voorbeelden (curl)
# Lijst lessen
curl -s https://<your-onrender-url>/lessons | jq

# Filter op type
curl -s "https://<your-onrender-url>/lessons?type=Puppy" | jq

# Nieuwe les
curl -s -X POST https://<your-onrender-url>/lessons   -H "Content-Type: application/json"   -d '{"type":"Puppy","theme":"Spel","location":"Retie","date":"2025-10-01","time":"10:30","trainer":"Sofie"}' | jq

# Wijzig les
curl -s -X PUT https://<your-onrender-url>/lessons/1   -H "Content-Type: application/json"   -d '{"type":"Puppy","theme":"Wandelen+","location":"Retie","date":"2025-09-20","time":"10:30","trainer":"Sofie"}' | jq

# Verwijder les
curl -s -X DELETE https://<your-onrender-url>/lessons/2 | jq

## Env (Render)
- TARGET_URL = https://httpbin.org/post
- CORS_ORIGIN = *
- LOG_LEVEL = debug
- SH_SHARED_SECRET = TestSecret123!
