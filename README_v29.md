# Superhond Webapp — v29 (Credits op klantniveau)

Release date: 2025-09-11

## Wat is nieuw
- **Credits staan nu op klantniveau (user)**, niet meer per hond.
- Nieuwe tabel `credit_ledger` registreert transacties: toekenning, boeking, annulatie, migratie.
- Nieuwe tabel `lesson_packages` om pakketten te beheren (bv. Puppypack Only Connect = 9 startcredits).
- API endpoints:
  - `GET /api/credits/balance` → huidig saldo van ingelogde klant.
  - `GET /api/credits/history` → transacties.
  - `POST /api/credits/grant` → (admin) credits toekennen, rechtstreeks of via package.
  - `GET/POST/DELETE /api/packages` → pakketten beheren.
  - `/api/lessen` routes aangepast: boeken/annuleren werken via klant-saldo.
- Migratie: bestaande hond-credits worden opgeteld per klant en als startsaldo weggeschreven.

## Migratiestappen
1. Zorg dat je database (`data/superhond.db`) een backup heeft.
2. Plaats de bestanden uit deze zip in je project:
   - `server/routes/credits.js`
   - `server/routes/packages.js`
   - `server/routes/lessen.js` (overschrijven)
   - `public/version.json`
3. Voeg in `server/index.js` toe:
   ```js
   app.use('/api/credits', require('./routes/credits'));
   app.use('/api/packages', require('./routes/packages'));
   ```
4. Start je server opnieuw. De tabellen `credit_ledger` en `lesson_packages` worden automatisch aangemaakt.
5. **Migratie uitvoeren**: voer 1x een script uit of handmatig in sqlite:
   ```sql
   INSERT INTO credit_ledger (user_id, delta, reason)
   SELECT user_id, SUM(credits), 'migration_v29' FROM dogs GROUP BY user_id;
   UPDATE dogs SET credits=0;
   ```
   Zo worden oude hond-credits naar klantniveau overgezet.
6. Test:
   - Log in als klant → je ziet saldo in de header.
   - Boek een les → saldo daalt.
   - Annuleer een les → saldo stijgt terug.
   - Admin → kan pakket toekennen via `POST /api/credits/grant`.

## Let op
- Hond blijft nog steeds nodig bij een boeking (per dog_id), maar credits gaan van het klant-saldo.
- Topbar moet aangepast worden om saldo te tonen (kan in `header.js`).

## Versie
- Version.json: v29
