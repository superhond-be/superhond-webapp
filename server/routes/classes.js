// server/routes/classes.js
import express from "express";
const router = express.Router();

/**
 * Eenvoudige in-memory store.
 * (Later kun je dit vervangen door sqlite/postgres.)
 */
const classes = []; // { id, name, level, description, defaultCapacity, active, locationId? }
let classSeq = 1;

/** Klas aanmaken */
router.post("/", (req, res) => {
  const {
    name,
    level = "BEGINNER",
    description = "",
    defaultCapacity = 15,
    active = true,
    locationId = null
  } = req.body || {};

  if (!name || String(name).trim() === "") {
    return res.status(400).json({ error: "Naam is verplicht." });
  }

  const newClass = {
    id: String(classSeq++),
    name: String(name).trim(),
    level,
    description,
    defaultCapacity: Number(defaultCapacity) || 0,
    active: Boolean(active),
    locationId
  };
  classes.push(newClass);
  return res.status(201).json(newClass);
});

/** Alle klassen */
router.get("/", (_req, res) => {
  res.json(classes);
});

/** Eén klas ophalen */
router.get("/:id", (req, res) => {
  const c = classes.find(k => k.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Klas niet gevonden." });
  res.json(c);
});

/** Klas bijwerken */
router.patch("/:id", (req, res) => {
  const idx = classes.findIndex(k => k.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Klas niet gevonden." });

  const update = req.body || {};
  classes[idx] = { ...classes[idx], ...update };
  res.json(classes[idx]);
});

/** Klas archiveren (actief=false) */
router.delete("/:id", (req, res) => {
  const idx = classes.findIndex(k => k.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Klas niet gevonden." });

  classes[idx].active = false;
  res.json({ ok: true, id: req.params.id });
});

export default router;
export { classes }; // wordt onderaan in sessions gebruikt voor validatie
