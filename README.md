# Superhond Webapp — v27 (Upgrade Pack)
Release date: 2025-09-11

## Wat is nieuw in v27
- **Dashboard**: nieuwe tegel "Mijn boekingen" zichtbaar voor alle gebruikers.
- **Nieuwe pagina**: `mijn-boekingen.html` met tabel van alle boekingen van ingelogde gebruiker.
- **Nieuwe API**: `server/routes/mybookings.js`
  - `GET /api/bookings/mine` → lijst eigen boekingen met les- en hondinfo.
  - `DELETE /api/bookings/:id` → annuleer eigen boeking (credits worden teruggegeven aan hond).

## Installatie
1. Mount de nieuwe route in `server/index.js`:
   ```js
   app.use('/api/bookings', require('./routes/mybookings'));
   ```
2. Vervang `dashboard.html` door de v27-versie.
3. Voeg de nieuwe pagina en JS toe.

## Testflow
1. Log in als gewone gebruiker.
2. Boek een les voor je hond (via v22/v24 flow).
3. Ga naar `/mijn-boekingen.html` → je ziet de lijst.
4. Klik "Annuleren" → status wordt "cancelled" en credits keren terug.
