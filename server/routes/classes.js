import express from "express";
const router = express.Router();

// (demo) alle klassen
router.get("/", (_req, res) => {
  const classes = [
    { id: 1, name: "Puppy Pack (starters)", trainer: "Paul" },
    { id: 2, name: "Puppy Pack (gevorderd)", trainer: "Nancy" },
    { id: 3, name: "Puber Coachgroep", trainer: "Team" },
  ];
  res.json(classes);
});

// (demo) één klas op id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const cls = [
    { id: 1, name: "Puppy Pack (starters)" },
    { id: 2, name: "Puppy Pack (gevorderd)" },
    { id: 3, name: "Puber Coachgroep" },
  ].find(c => c.id === id);

  if (!cls) return res.status(404).json({ error: "Klas niet gevonden" });
  res.json(cls);
});

export default router;
