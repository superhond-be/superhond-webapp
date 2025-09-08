# Superhond Mapper (simple)

Dit script normaliseert varianten van Puppy Pack naar één canoniek type.

- "Puppy Pack Online"  → canonical = `puppy_pack`, variant = `online`
- "Puppy Pack Connect" → canonical = `puppy_pack`, variant = `connect`
- Fallback: als het woord "puppy" voorkomt, canonical = `puppy_pack`, variant = `unspecified`

Gebruik: plaats `services/mapper.js` in je project en importeer `mapPayload(payload)`.

