# Superhond Endpoint Mapper

Dit pakket bevat `services/mapper.js`, een eenvoudige mapper die inkomende payloads van de forwarder omzet naar een gestandaardiseerd formaat voor je Superhond API.

## Gebruik
1. Plaats `services/mapper.js` in je bestaande Superhond API project (bijv. in de `services/` map).
2. In je endpoint code (`routes/...`), importeer de mapper:

```js
const { mapPayload } = require('../services/mapper');

app.post('/ingest', (req, res) => {
  const mapped = mapPayload(req.body);
  // Doe hier iets met de gemapte data, bijvoorbeeld opslaan in DB
  console.log("Ontvangen en gemapt:", mapped);
  res.json({ ok: true, data: mapped });
});
```

## Output voorbeeld
Inkomende payload:
```json
{
  "email": "jan@example.com",
  "name": "Jan",
  "dog": "Bobby",
  "topic": "Puppy"
}
```

Gemapte output:
```json
{
  "naam": "Jan",
  "email": "jan@example.com",
  "telefoon": "",
  "hond": "Bobby",
  "geboortedatum_hond": "",
  "groep": "Puppy",
  "bron": "onbekend",
  "raw": { ...originele payload... }
}
```

## Opmerking
- Je kan de mapping zelf uitbreiden of aanpassen aan je database-schema.
- `groep` wordt automatisch gekozen op basis van het topic (Puppy, Puber, Basis).
