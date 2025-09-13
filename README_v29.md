# Superhond Webapp — v29 (Credits op klantniveau)

Release date: 2025-09-13

## Wat is nieuw
- Credits staan nu op klantniveau (user), niet meer per hond.
- Nieuwe tabel credit_ledger registreert transacties: toekenning, boeking, annulatie, migratie.
- Nieuwe tabel lesson_packages om pakketten te beheren (bv. Puppypack Only Connect = 9 startcredits).
- API endpoints:
  - GET /api/credits/balance → huidig saldo
  - GET /api/credits/history → transacties
  - POST /api/credits/grant → credits toekennen
  - /api/packages → pakkettenbeheer
  - /api/lessen → aangepast (boekingen verbruiken klant-saldo)
- Migratie: bestaande hond-credits worden opgeteld per klant en als startsaldo weggeschreven.

## Migratie uitvoeren
1. Maak een backup van data/superhond.db
2. Voer het script uit:
   sqlite3 data/superhond.db < migrate_v29.sql

## Versie
- Version.json: v29
