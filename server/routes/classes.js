import express from "express";
const router = express.Router();

// Voorbeeld-data (kan je later uitbreiden of koppelen aan een echte database)
let classes = [
  { id: 1, name: "Puppy Pack", trainer: "Paul", active: true },
  { id: 2, name: "Puber Coachgroep", trainer: "Nancy", active: true },
  { id: 3, name: "Volwassen Hondentraining", trainer: "Paul", active: true },
  { id: 4, name: "Privé Coaching", trainer: "Nancy", active: false },
  { id: 5, name: "Gedragsanalyse", trainer: "Paul", active: true }
];

// ➝ Alle lessen ophalen
router.get("/", (req, res) => {
  res.json(classes);
});

// ➝ Eén les ophalen op ID
router.get("/:id", (req, res) => {
  const cls = classes.find(c => c.id === parseInt(req.params.id));
  if (!cls) return res.status(404).json({ error: "Les niet gevonden" });
  res.json(cls);
});

// ➝ Nieuwe les toevoegen
router.post("/", (req, res) => {
  const newClass = {
    id: classes.length + 1,
    name: req.body.name,
    trainer: req.body.trainer,
    active: req.body.active
  };
  classes.push(newClass);
  res.status(201).json(newClass);
});

export default router;
