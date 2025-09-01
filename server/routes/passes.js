// server/routes/passes.js
const express = require("express");
const router = express.Router();

/*
  Pass = strippenkaart:
  { id, customerId, dogId, lessonType, totalStrips, usedStrips }
*/
const PASSES = [];
let NEXT_ID = 1;

// Lijst (optioneel filter: customerId/dogId)
router.get("/", (req, res) => {
  const { customerId, dogId } = req.query;
  let data = PASSES;
  if (customerId) data = data.filter(p => String(p.customerId) === String(customerId));
  if (dogId) data = data.filter(p => String(p.dogId) === String(dogId));
  res.json(data);
});

// Aanmaken
router.post("/", (req, res) => {
  const { customerId, dogId, lessonType, totalStrips } = req.body || {};
  if (!customerId || !dogId || !lessonType || !totalStrips)
    return res.status(400).json({ error: "customerId, dogId, lessonType, totalStrips are required" });

  const pass = {
    id: NEXT_ID++,
    customerId: Number(customerId),
    dogId: Number(dogId),
    lessonType,
    totalStrips: Number(totalStrips),
    usedStrips: 0
  };
  PASSES.push(pass);
  res.status(201).json(pass);
});

// 1 strip verbruiken
router.post("/:id/use", (req, res) => {
  const pass = PASSES.find(p => p.id === Number(req.params.id));
  if (!pass) return res.status(404).json({ error: "Pass not found" });
  if (pass.usedStrips >= pass.totalStrips)
    return res.status(400).json({ error: "Geen strips meer beschikbaar" });
  pass.usedStrips += 1;
  res.json(pass);
});

module.exports = router;
