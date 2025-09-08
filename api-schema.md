# Superhond API Schema

## Health
- **GET /api/health**
  - ✅ Controleert of de server draait
  - Response:
    ```json
    { "status": "ok", "app": "superhond-webapp", "time": "2025-09-08T10:00:00.000Z" }
    ```

## Users
- **GET /api/users**
  - Haalt alle gebruikers op
  - Response: lijst van gebruikers
    ```json
    [ { "id": 1, "name": "Jan Jansen", "email": "jan@example.com", "role": "Trainer" } ]
    ```

- **GET /api/users/:id**
  - Haalt gebruiker met id op
  - Response: gebruiker of 404

- **POST /api/users**
  - Voegt gebruiker toe
  - Body:
    ```json
    { "name": "Nieuwe Naam", "email": "nieuw@example.com", "role": "Admin" }
    ```
  - Response: nieuw object

- **PUT /api/users/:id**
  - Wijzigt een bestaande gebruiker

- **DELETE /api/users/:id**
  - Verwijdert een gebruiker
  - Response: 204 No Content

---

⚠️ Let op: dit is **in-memory data**. Bij server restart zijn de wijzigingen weg.
