# Superhond Webapp (Basis)

**Afspraak gerespecteerd:** alle CSS/JS staan onder `public/` en worden gelinkt als `/css/...` en `/js/...`.

## Starten
```bash
npm install
npm start
# opent op http://localhost:3000
```

## API
- `GET /api/health` — status
- `GET /api/users` — lijst gebruikers
- `POST /api/users` — gebruiker toevoegen `{ name, email, role }`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

> Data staat voorlopig in-memory (demo). Later vervangen we dit door echte opslag.
