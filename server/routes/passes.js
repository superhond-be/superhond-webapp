// server/routes/passes.js
import express from "express";
const router = express.Router();

/**
 * Pass types (strippenkaarten) en aankopen.
 * Voorbeeld type: { id: 1, name: "Puppy 8-strip", strips: 8 }
 * Voorbeeld aankoop: { id: 1, customerId: 3, typeId: 1, remaining: 8, createdAt: ... }
 */

// In-memory data
let PASS_TYPES = [];
let PURCHASES = [];
let NEXT_TYPE_ID = 1;
let NEXT_PURCHASE_ID = 1;

// --- Types ---
// Lijst types
router.get("/types", (req, res) => {
  res.json(PASS_TYPES);
});

// Nieuw type
router.post("/types", (req, res) => {
  const { name, strips } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });
  const n = Number(strips);
  if (!Number.isFinite(n) || n <= 0) return res.status(400).json({ error: "Strips moet > 0 zijn" });

  const newType = { id: NEXT_TYPE_ID++, name, strips: n, createdAt: new Date().toISOString() };
  PASS_TYPES.push(newType);
  res.status(201).json(newType);
});

// --- Aankopen (klant koopt strippenkaart) ---
// Lijst aankopen (optioneel filter op customerId)
router.get("/purchases", (req, res) => {
  const { customerId } = req.query || {};
  let list = PURCHASES;
  if (customerId) list = list.filter(p => String(p.customerId) === String(customerId));
  res.json(list);
});

// Kopen
router.post("/buy", (req, res) => {
  const { customerId, typeId } = req.body || {};
  if (!customerId) return res.status(400).json({ error: "customerId is verplicht" });
  const type = PASS_TYPES.find(t => t.id === Number(typeId));
  if (!type) return res.status(400).json({ error: "Ongeldig typeId" });

  const newPurchase = {
    id: NEXT_PURCHASE_ID++,
    customerId: Number(customerId),
    typeId: type.id,
    remaining: type.strips,
    createdAt: new Date().toISOString()
  };
  PURCHASES.push(newPurchase);
  res.status(201).json(newPurchase);
});

// Strip gebruiken (1 aftrekken)
router.post("/use", (req, res) => {
  const { purchaseId } = req.body || {};
  const p = PURCHASES.find(x => x.id === Number(purchaseId));
  if (!p) return res.status(404).json({ error: "Aankoop niet gevonden" });
  if (p.remaining <= 0) return res.status(409).json({ error: "Geen strips meer over" });

  p.remaining -= 1;
  res.json(p);
});

export default router;
