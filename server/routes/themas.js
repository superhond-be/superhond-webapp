// server/routes/themas.js
import express from "express";
const router = express.Router();

let themas = [
  { id: 1, name: "Gehoorzaamheid", description: "Basis gehoorzaamheid." },
  { id: 2, name: "Wandelen", description: "Los volgen, oproepen, blijven." },
  { id: 3, name: "Sport & spel", description: "Leuke activiteiten en spel." }
];

router.get("/", (_req, res) => res.json(themas));

router.get("/:id", (req, res) => {
  const item = themas.find(x => x.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Thema niet gevonden" });
  res.json(item);
});

router.post("/", (req, res) => {
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });
  const newItem = { id: (themas.at(-1)?.id ?? 0) + 1, name, description: description ?? "" };
  themas.push(newItem);
  res.status(201).json(newItem);
});

router.put("/:id", (req, res) => {
  const idx = themas.findIndex(x => x.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Thema niet gevonden" });
  const { name, description } = req.body || {};
  if (name !== undefined) themas[idx].name = name;
  if (description !== undefined) themas[idx].description = description;
  res.json(themas[idx]);
});

router.delete("/:id", (req, res) => {
  const before = themas.length;
  themas = themas.filter(x => x.id !== Number(req.params.id));
  if (themas.length === before) return res.status(404).json({ error: "Thema niet gevonden" });
  res.status(204).end();
});

export default router;
