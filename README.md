# Superhond Forwarder — Option B (Debug build)
- Geen rate limiter
- `/debug` endpoint met laatste 50 logregels
- `/about` toont ingelezen ENV
- `/health` voor healthchecks
- `POST /hook` voor intake en forwarding

## Render
Build: `npm install`
Start: `node server/index.js`
Health: `/health`

## Environment (minimaal)
PORT=10000
TARGET_URL=https://httpbin.org/post
SH_SHARED_SECRET=TestSecret123!
LOG_LEVEL=debug
CORS_ORIGIN=*
ALLOWED_SOURCES=mailblue,anyday,manual
FILTER_TOPICS=Puppy,Puber,Basis
