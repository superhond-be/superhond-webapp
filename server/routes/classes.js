import express from "express";
const router = express.Router();

// simpele in-memory data om te testen
let classes = [
  { id: 1, name: "Puppy Pack", trainer: "Paul", active: true },
  { id: 2, name: "Puber Coachgroep", trainer: "Nancy", active: true }
];

router.get("/", (_req, res) => res.json(classes));

router.get("/:id", (req, res) => {
  const cls = classes.find(c => c.id === Number(req.params.id));
  if (!cls) return res.status(404).json({ error: "Les niet gevonden" });
  res.json(cls);
});

router.post("/", (req, res) => {
  const { name, trainer, active = true } = req.body || {};
  if (!name || !trainer) return res.status(400).json({ error: "name en trainer zijn verplicht" });
  const id = classes.length ? Math.max(...classes.map(c => c.id)) + 1 : 1;
  const created = { id, name, trainer, active: !!active };
  classes.push(created);
  res.status(201).json(created);
});

export default router;
