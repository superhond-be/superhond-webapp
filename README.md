# Superhond Webapp — v24 (Upgrade Pack)
Release date: 2025-09-11

## Wat is nieuw in v24
- **admin-lessen.html** aangepast:
  - Velden Naam, Lestype, Locatie, Lesgever zijn nu **selectboxen**
  - Deze worden gevuld vanuit de lijsten die je in v23 beheert (via /api/lookup)
- **Nieuw script** `public/js/lessen-v24.js` voor deze functionaliteit
- Overige velden (strippen, max deelnemers, startdatum, etc.) werken zoals voorheen

## Installatie
1. Plaats bestanden uit deze zip in je project.
2. Zorg dat `server/index.js` de route heeft:
   ```js
   app.use('/api/lookup', require('./routes/lookup'));
   ```
3. Herstart de server.

## Testen
1. Ga als admin naar `/admin-lessen-config.html` en leg waarden vast.
2. Open `/admin-lessen.html` en maak een nieuwe les — selectboxen zijn gevuld met deze waarden.
3. Check dat de nieuwe les correct in de lijst verschijnt.
