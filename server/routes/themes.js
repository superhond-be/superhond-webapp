// server/routes/themes.js
import express from "express";
const router = express.Router();

let themes = [
  { id: 1, name: "Gehoorzaamheid", description: "Oefeningen rond gehoorzaamheid." },
  { id: 2, name: "Wandelen", description: "Los volgen, ontspannen wandelen." },
];

const nextId = () => (themes.length ? Math.max(...themes.map(t => t.id)) + 1 : 1);

router.get("/", (_req, res) => res.json(themes));
router.get("/:id", (req, res) => {
  const item = themes.find(t => t.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Thema niet gevonden" });
  res.json(item);
});
router.post("/", (req, res) => {
  const { name, description } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "name is verplicht" });
  const item = { id: nextId(), name, description: description ?? "" };
  themes.push(item);
  res.status(201).json(item);
});
router.put("/:id", (req, res) => {
  const idx = themes.findIndex(t => t.id === Number(req.params.id));
  if (idx < 0) return res.status(404).json({ error: "Thema niet gevonden" });
  const { name, description } = req.body ?? {};
  themes[idx] = { ...themes[idx], ...(name && { name }), ...(description !== undefined && { description }) };
  res.json(themes[idx]);
});
router.delete("/:id", (req, res) => {
  const before = themes.length;
  themes = themes.filter(t => t.id !== Number(req.params.id));
  if (themes.length === before) return res.status(404).json({ error: "Thema niet gevonden" });
  res.status(204).end();
});

export default router;
