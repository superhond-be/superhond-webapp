// server/routes/passes.js
import express from "express";
const router = express.Router();

// Tijdelijke opslag voor strippenkaarten (demo/in-memory)
let PASSES = [
  // voorbeeld: { id: 1, customerId: 1, total: 10, used: 2 }
];

// Alle strippenkaarten ophalen
router.get("/", (_req, res) => {
  res.json(PASSES);
});

// Nieuwe strippenkaart toevoegen
router.post("/", (req, res) => {
  const { customerId, total } = req.body;
  if (!customerId || !total) {
    return res.status(400).json({ error: "customerId en total zijn verplicht" });
  }
  const newPass = {
    id: PASSES.length + 1,
    customerId,
    total,
    used: 0
  };
  PASSES.push(newPass);
  res.status(201).json(newPass);
});

// Eén strip gebruiken
router.post("/:id/use", (req, res) => {
  const passId = Number(req.params.id);
  const pass = PASSES.find(p => p.id === passId);
  if (!pass) return res.status(404).json({ error: "Strippenkaart niet gevonden" });
  if (pass.used >= pass.total) {
    return res.status(400).json({ error: "Geen strips meer over" });
  }
  pass.used++;
  res.json(pass);
});

export default router;
