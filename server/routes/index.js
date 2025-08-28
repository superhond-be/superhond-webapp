import express from "express";
const router = express.Router();

// Demo data (mag later uit DB komen)
let classes = [
  { id: 1, name: "Puppy Pack (beginners)", trainer: "Paul" },
  { id: 2, name: "Puppy Pack (gevorderden)", trainer: "Nancy" },
  { id: 3, name: "Puber Coachgroep", trainer: "Team" }
];

// Alle klassen
router.get("/", (_req, res) => {
  res.json(classes);
});

// Eén klas op id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const cls = classes.find(c => c.id === id);
  if (!cls) return res.status(404).json({ error: "Klas niet gevonden" });
  res.json(cls);
});

export default router;
