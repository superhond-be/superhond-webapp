import express from "express";
const router = express.Router();

// Voorbeeld-data
let classes = [
  { id: 1, name: "Puppy Pack", trainer: "Paul", active: true },
  { id: 2, name: "Puber Coachgroep", trainer: "Nancy", active: true }
];

// Alle lessen ophalen
router.get("/", (req, res) => {
  res.json(classes);
});

// Eén les ophalen op ID
router.get("/:id", (req, res) => {
  const cls = classes.find(c => c.id === parseInt(req.params.id));
  if (!cls) return res.status(404).json({ error: "Les niet gevonden" });
  res.json(cls);
});

// Nieuwe les toevoegen
router.post("/", (req, res) => {
  const newClass = {
    id: classes.length + 1,
    name: req.body.name,
    trainer: req.body.trainer,
    active: req.body.active ?? true
  };
  classes.push(newClass);
  res.status(201).json(newClass);
});

export default router;
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Superhond Coach Portaal</title>
  <script src="app.js" defer></script>
</head>
<body>
  <h1>🐾 Superhond Coach Portaal</h1>

  <button onclick="loadClasses()">Bekijk Klassen</button>
  <button onclick="loadSessions()">Bekijk Sessies</button>

  <div id="output"></div>
</body>
</html>
