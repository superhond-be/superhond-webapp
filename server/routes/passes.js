const express = require("express");
const { store, nextId } = require("../store"); // gebruik gedeelde store

const router = express.Router();

// ========================================================================
// GET /api/passes → alle strippenkaarten
// ========================================================================
router.get("/", (_req, res) => {
  res.json(store.passes);
});

// ========================================================================
// POST /api/passes → nieuwe strippenkaart toevoegen
// Body: { customerId, dogId, type, totalStrips }
// ========================================================================
router.post("/", (req, res) => {
  const b = req.body || {};
  if (!b.customerId || !b.type || !b.totalStrips) {
    return res.status(400).json({ message: "customerId, type en totalStrips zijn verplicht." });
  }

  const pass = {
    id: nextId(store.passes),
    customerId: Number(b.customerId),
    dogId: b.dogId ? Number(b.dogId) : null,
    type: String(b.type).trim(),
    totalStrips: Number(b.totalStrips),
    usedStrips: 0,
    createdAt: new Date().toISOString()
  };
  store.passes.push(pass);
  res.status(201).json(pass);
});

// ========================================================================
// PUT /api/passes/:id/use → een strip afboeken
// Body: { count } (standaard = 1)
// ========================================================================
router.put("/:id/use", (req, res) => {
  const id = Number(req.params.id);
  const p = store.passes.find((x) => x.id === id);
  if (!p) return res.status(404).json({ message: "Strippenkaart niet gevonden" });

  const count = Number(req.body.count || 1);
  if (p.usedStrips + count > p.totalStrips) {
    return res.status(400).json({ message: "Niet genoeg strippen over" });
  }

  p.usedStrips += count;
  res.json(p);
});

// ========================================================================
// DELETE /api/passes/:id → strippenkaart verwijderen
// ========================================================================
router.delete("/:id", (req, res) => {
  const before = store.passes.length;
  store.passes = store.passes.filter((x) => x.id !== Number(req.params.id));
  if (store.passes.length === before) {
    return res.status(404).json({ message: "Strippenkaart niet gevonden" });
  }
  res.json({ message: "Strippenkaart verwijderd" });
});

module.exports = router;
