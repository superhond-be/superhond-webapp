import express from "express";
const router = express.Router();

// In-memory strippenkaarten (later kan dit naar database)
let PASSES = [];
let NEXT_PASS_ID = 1;

// Nieuwe strippenkaart aanmaken
router.post("/", (req, res) => {
  const { customerId, totalStrips } = req.body;
  if (!customerId || !totalStrips) {
    return res.status(400).json({ error: "customerId en totalStrips zijn verplicht" });
  }

  const pass = {
    id: NEXT_PASS_ID++,
    customerId,
    totalStrips,
    usedStrips: 0,
    createdAt: new Date()
  };

  PASSES.push(pass);
  res.status(201).json(pass);
});

// Strip gebruiken
router.post("/:id/use", (req, res) => {
  const pass = PASSES.find(p => p.id === parseInt(req.params.id));
  if (!pass) return res.status(404).json({ error: "Strippenkaart niet gevonden" });

  if (pass.usedStrips >= pass.totalStrips) {
    return res.status(400).json({ error: "Geen strips meer over" });
  }

  pass.usedStrips++;
  res.json(pass);
});

// Alle strippenkaarten ophalen
router.get("/", (_req, res) => {
  res.json(PASSES);
});

export default router;
