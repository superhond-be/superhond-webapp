// server/routes/lessonTypes.js
import express from "express";
const router = express.Router();

// voorlopig in-memory
let lessonTypes = [
  { id: 1, name: "Puppy – Coachgroep", description: "Beginnende pups, basisvaardigheden." },
  { id: 2, name: "Puber – Coachgroep", description: "Voor pubers, focus op verbinding." },
];

const nextId = () => (lessonTypes.length ? Math.max(...lessonTypes.map(t => t.id)) + 1 : 1);

// lijst
router.get("/", (_req, res) => res.json(lessonTypes));

// detail
router.get("/:id", (req, res) => {
  const item = lessonTypes.find(t => t.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Lestype niet gevonden" });
  res.json(item);
});

// toevoegen
router.post("/", (req, res) => {
  const { name, description } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "name is verplicht" });
  const item = { id: nextId(), name, description: description ?? "" };
  lessonTypes.push(item);
  res.status(201).json(item);
});

// updaten
router.put("/:id", (req, res) => {
  const idx = lessonTypes.findIndex(t => t.id === Number(req.params.id));
  if (idx < 0) return res.status(404).json({ error: "Lestype niet gevonden" });
  const { name, description } = req.body ?? {};
  lessonTypes[idx] = { ...lessonTypes[idx], ...(name && { name }), ...(description !== undefined && { description }) };
  res.json(lessonTypes[idx]);
});

// verwijderen
router.delete("/:id", (req, res) => {
  const before = lessonTypes.length;
  lessonTypes = lessonTypes.filter(t => t.id !== Number(req.params.id));
  if (lessonTypes.length === before) return res.status(404).json({ error: "Lestype niet gevonden" });
  res.status(204).end();
});

export default router;
