# Superhond Webapp — v22 (Upgrade Pack)
Release date: 2025-09-11

## Wat is nieuw in v22
- **Credits per hond** toegevoegd
  - Nieuwe tabel `dogs` (naam, ras, geboortedatum, credits, gekoppeld aan eigenaar)
  - Nieuwe route `/api/dogs` (GET lijst eigen honden, POST nieuwe hond)
  - `bookings`-tabel uitgebreid met `dog_id`
  - Boeken en annuleren van lessen gebruiken nu **hond-credits** i.p.v. user-credits
- **UI**
  - Nieuwe pagina `hondenbeheer.html` met formulier + lijst honden + creditsaldo
  - JS: `hondenbeheer.js`
- **API-wijzigingen**
  - `POST /api/lessen/:id/book` → vereist `dog_id`, controleert creditsaldo van die hond
  - `DELETE /api/lessen/:id/book` → idem
  - Admin `GET /api/lessen/:id/bookings` → toont ook hond-informatie

## Installatie
1. Mount nieuwe routes in `server/index.js`:
   ```js
   app.use('/api/dogs', require('./routes/dogs'));
   app.use('/api/lessen', require('./routes/lessen'));
   ```
2. Plaats bestanden uit deze zip in je project.
3. Test de hondenbeheer-pagina op `/hondenbeheer.html`.

## Testflow
1. Log in met een gebruiker.
2. Ga naar `/hondenbeheer.html` en voeg een hond toe (met startcredits).
3. Maak een les in `/admin-lessen.html`.
4. Boek de les voor een hond (`dog_id` wordt meegegeven).
5. Credits van die hond verminderen; bij annuleren keren ze terug.
