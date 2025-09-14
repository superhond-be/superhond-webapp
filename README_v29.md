# Superhond Webapp — v29 (Credits op klantniveau)

Release date: 2025-09-14

## Wat is nieuw
- Credits staan nu op **klantniveau (user)**, niet meer per hond.
- Nieuwe tabel `credit_ledger` registreert transacties: toekenning, boeking, annulatie, migratie.
- Nieuwe tabel `lesson_packages` om pakketten te beheren (bv. Puppypack Only Connect = 9 startcredits).
- API endpoints:
  - `GET /api/credits/balance` → huidig saldo
  - `GET /api/credits/history` → transacties
  - `POST /api/credits/grant` → credits toekennen
  - `/api/packages` → pakkettenbeheer
  - `/api/lessen` → aangepast (boekingen verbruiken klant-saldo)
- Migratie: bestaande hond-credits worden opgeteld per klant en als startsaldo weggeschreven.

## Migratiestappen
1. Maak een backup van je database:
   ```bash
   cp data/superhond.db data/superhond-backup.db
