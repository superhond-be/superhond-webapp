const express = require("express");
const router = express.Router();

let passes = [];

// GET alle passes (filter mogelijk)
router.get("/", (req, res) => {
  const { customerId, dogId, type } = req.query;
  let list = passes;
  if (customerId) list = list.filter(p => p.customerId === Number(customerId));
  if (dogId) list = list.filter(p => p.dogId === Number(dogId));
  if (type) list = list.filter(p => p.type === String(type));
  res.json(list);
});

// GET pass op ID
router.get("/:id", (req, res) => {
  const pass = passes.find(p => p.id === Number(req.params.id));
  if (!pass) return res.status(404).json({ message: "Strippenkaart niet gevonden" });
  res.json(pass);
});

// POST nieuwe strippenkaart
router.post("/", (req, res) => {
  const { customerId, dogId, type, totalStrips } = req.body;

  if (!customerId || !type || !totalStrips) {
    return res.status(400).json({ message: "customerId, type en totalStrips zijn verplicht" });
  }

  const newPass = {
    id: passes.length + 1,
    customerId: Number(customerId),
    dogId: dogId ? Number(dogId) : null,
    type: String(type),
    totalStrips: Number(totalStrips),
    usedStrips: 0,
    createdAt: new Date().toISOString()
  };

  passes.push(newPass);
  res.status(201).json(newPass);
});

// POST strips verbruiken
router.post("/:id/consume", (req, res) => {
  const pass = passes.find(p => p.id === Number(req.params.id));
  if (!pass) return res.status(404).json({ message: "Strippenkaart niet gevonden" });

  const count = req.body.count ? Number(req.body.count) : 1;
  const remaining = pass.totalStrips - pass.usedStrips;

  if (count <= 0) return res.status(400).json({ message: "count moet > 0 zijn" });
  if (count > remaining) {
    return res.status(400).json({ message: `Onvoldoende strips (nog ${remaining} over)` });
  }

  pass.usedStrips += count;
  res.json({ ...pass, remainingStrips: pass.totalStrips - pass.usedStrips });
});

// PUT pass bijwerken
router.put("/:id", (req, res) => {
  const pass = passes.find(p => p.id === Number(req.params.id));
  if (!pass) return res.status(404).json({ message: "Strippenkaart niet gevonden" });

  if (req.body.dogId !== undefined) pass.dogId = req.body.dogId === null ? null : Number(req.body.dogId);
  if (req.body.type !== undefined) pass.type = String(req.body.type);
  if (req.body.totalStrips !== undefined) {
    const nextTotal = Number(req.body.totalStrips);
    if (nextTotal < pass.usedStrips) {
      return res.status(400).json({ message: "totalStrips kan niet kleiner zijn dan usedStrips" });
    }
    pass.totalStrips = nextTotal;
  }

  res.json(pass);
});

// DELETE pass
router.delete("/:id", (req, res) => {
  const before = passes.length;
  passes = passes.filter(p => p.id !== Number(req.params.id));
  if (passes.length === before) {
    return res.status(404).json({ message: "Strippenkaart niet gevonden" });
  }
  res.json({ message: "Strippenkaart verwijderd" });
});

module.exports = router;
