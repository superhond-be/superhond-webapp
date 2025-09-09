# Superhond Forwarder SelfTest (Render-ready)

Minimal Node/Express service with routes:
- `/`        → welcome
- `/health`  → ok:true
- `/about`   → shows env values (targetUrl, corsOrigin, logLevel, sharedSecretSet)
- `/selftest`→ POSTs to TARGET_URL (default httpbin) and returns upstream status
- `/hook`    → demo webhook intake with optional X-SH-Shared-Secret

## Required env (Render → Environment)
- TARGET_URL = https://httpbin.org/post
- CORS_ORIGIN = *
- LOG_LEVEL = debug
- SH_SHARED_SECRET = TestSecret123!   (optional but recommended)

## Start
npm install
npm start
