# Superhond Test Demo v0.18.6

Gemaakt: 2025-09-22 06:26

Deze bundel bevat:
- Een simpele Express backend (`server/`) met routes voor **klanten**, **honden**, **lessen**.
- Statische frontend in `public/` met **Dashboard**, **Klantenportaal**, **Lessenbeheer**, **Admin** pagina’s.
- Dummy data (incl. NL klanten) om vlot te kunnen testen.
- Versie-indicator rechtsboven op elke pagina.

## Installeren
```bash
npm install
npm run start
# App draait op http://localhost:3000
```

## Endpoints
- `GET /api/klanten`
- `GET /api/honden`
- `GET /api/lessen`

## Notities
- Dit is een demo zonder database: data komt uit JSON-bestanden in `server/data/`.
- Frontend gebruikt `fetch()` om lijsten te laden.
- Stijl is een lichte **Superhond style** (kan je verder tweaken in `public/css/app.css`).

