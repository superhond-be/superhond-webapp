// server/routes/lestypes.js
import express from "express";
const router = express.Router();

// Voorbeelddata
let lestypes = [
  { id: 1, name: "Puppy coach groep", description: "Beginnende puppy's." },
  { id: 2, name: "Puber – Coachgroep", description: "Vervolgtraject voor pubers." },
  { id: 3, name: "Privé lessen", description: "Individuele begeleiding." }
];

// Alles ophalen
router.get("/", (_req, res) => res.json(lestypes));

// Eén ophalen
router.get("/:id", (req, res) => {
  const item = lestypes.find(x => x.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Lestype niet gevonden" });
  res.json(item);
});

// Nieuw aanmaken
router.post("/", (req, res) => {
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const newItem = { id: (lestypes.at(-1)?.id ?? 0) + 1, name, description: description ?? "" };
  lestypes.push(newItem);
  res.status(201).json(newItem);
});

// Updaten
router.put("/:id", (req, res) => {
  const idx = lestypes.findIndex(x => x.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Lestype niet gevonden" });

  const { name, description } = req.body || {};
  if (name !== undefined) lestypes[idx].name = name;
  if (description !== undefined) lestypes[idx].description = description;
  res.json(lestypes[idx]);
});

// Verwijderen
router.delete("/:id", (req, res) => {
  const before = lestypes.length;
  lestypes = lestypes.filter(x => x.id !== Number(req.params.id));
  if (lestypes.length === before) return res.status(404).json({ error: "Lestype niet gevonden" });
  res.status(204).end();
});

export default router;
