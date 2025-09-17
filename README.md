# Superhond — Lessenbeheer Standalone v0.12.0

Doel: **de Lessen-module volledig los testen** van de rest van het Superhond systeem.

## Start lokaal
1) `npm install`
2) `npm start`
3) Open: http://localhost:3000/lessenbeheer  (of gewoon `/`)

## API (in-memory met file-persist)
- GET  /api/namen | /api/types | /api/locaties | /api/themas | /api/trainers
- POST /api/<key>        body: { ... }
- PUT  /api/<key>/:id    body: { ... }
- DELETE /api/<key>/:id

Data staat in `db/data.json` en wordt bij first-run gekopieerd van `db/seed.json`.

## Deploy op Render als **apart service**
- Build command: `npm install`
- Start command: `npm start`
- Root directory: deze map
- Public urls:
    - `/lessenbeheer` → UI
    - `/api/...`      → JSON endpoints

Zo kan je dit **parallel** laten draaien naast je hoofd-omgeving. 
Wanneer klaar: vervang enkel de `public/` + API routes in het hoofdproject.