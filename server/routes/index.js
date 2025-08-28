import express from "express";
const router = express.Router();

// Demo-opslag in geheugen (later vervangen door DB)
let classes = [
  { id: 1, name: "Puppy Pack – starters", trainer: "Paul" },
  { id: 2, name: "Puppy Pack – gevorderden", trainer: "Nancy" },
  { id: 3, name: "Puber Coachgroep", trainer: "Team" }
];

// alle klassen
router.get("/", (_req, res) => {
  res.json(classes);
});

// één klas ophalen
router.get("/:id", (req, res) => {
  const cls = classes.find(c => c.id === Number(req.params.id));
  if (!cls) return res.status(404).json({ error: "Klas niet gevonden" });
  res.json(cls);
});

// klas toevoegen
router.post("/", (req, res) => {
  const { name, trainer } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is verplicht" });
  const id = classes.length ? Math.max(...classes.map(c => c.id)) + 1 : 1;
  const cls = { id, name, trainer: trainer || null };
  classes.push(cls);
  res.status(201).json(cls);
});

export default router;
