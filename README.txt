
Superhond Test Demo v0.18.4
===========================

Snel starten (lokaal)
---------------------
1) Zorg dat Node.js 18+ is geïnstalleerd.
2) In de map van het project:
   npm install
   npm start
3) Open http://localhost:3000

Structuur
---------
public/           -> statische files (HTML/CSS/JS)
  index.html     -> dashboard met tegels
  pages/         -> subpagina's (Klanten, Honden, Lessen, ...)
server/
  index.js       -> Express server (servet public/ en simpele API)
package.json     -> scripts en dependencies

Opmerkingen
-----------
- Deze demo bevat placeholder data en UI in Superhond-stijl.
- De 'kleurbollen' (totaal/gebruikte/in verwerking) komen in een volgende versie.
- Agenda/ICS export volgt in een latere iteratie.

Build-info: 2025-09-21T12:16:30
