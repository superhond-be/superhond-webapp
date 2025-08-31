import express from "express";

const router = express.Router();

// Voorbeeld: lijst van beschikbare strippenkaarten
let passes = [
  { id: 1, type: "Puppycursus", strips: 9 },
  { id: 2, type: "Gehoorzaamheid", strips: 12 },
];

// 👉 Alle passes ophalen
router.get("/", (req, res) => {
  res.json(passes);
});

// 👉 Nieuwe pass toevoegen
router.post("/", (req, res) => {
  const { type, strips } = req.body;
  if (!type || !strips) {
    return res.status(400).json({ error: "Type en strips zijn verplicht" });
  }

  const newPass = {
    id: passes.length + 1,
    type,
    strips,
  };

  passes.push(newPass);
  res.status(201).json(newPass);
});

// 👉 Strip afboeken bij een klant
router.post("/:id/use", (req, res) => {
  const { id } = req.params;
  const pass = passes.find((p) => p.id === parseInt(id));

  if (!pass) {
    return res.status(404).json({ error: "Strippenkaart niet gevonden" });
  }

  if (pass.strips > 0) {
    pass.strips -= 1;
    return res.json({ message: "1 strip gebruikt", pass });
  } else {
    return res.status(400).json({ error: "Geen strips meer over" });
  }
});

export default router;
