// server/routes/passes.js
import express from "express";
const router = express.Router();

let CUSTOMERS_REF = null;
export function setCustomersRef(ref) { CUSTOMERS_REF = ref; }

// TYPES
const PASS_TYPES = [];   // {id, name, strips}
let NEXT_TYPE_ID = 1;

// PURCHASES
const PURCHASES = [];    // {id, customerId, typeId, remaining, createdAt}
let NEXT_PURCHASE_ID = 1;

// --- TYPES ---
router.get("/types", (_req, res) => res.json(PASS_TYPES));

router.post("/types", (req, res) => {
  const { name, strips } = req.body || {};
  if (!name || !Number.isFinite(Number(strips)) || Number(strips) <= 0) {
    return res.status(400).json({ error: "invalid type" });
  }
  const t = { id: NEXT_TYPE_ID++, name: String(name), strips: Number(strips) };
  PASS_TYPES.push(t);
  res.status(201).json(t);
});

// --- AANKOPEN ---
router.get("/purchases", (req, res) => {
  const cid = req.query.customerId ? Number(req.query.customerId) : null;
  const list = cid ? PURCHASES.filter(p => p.customerId === cid) : PURCHASES;
  res.json(list);
});

router.post("/buy", (req, res) => {
  if (!CUSTOMERS_REF) return res.status(500).json({ error: "customers not wired" });
  const { customerId, typeId } = req.body || {};
  const customer = CUSTOMERS_REF.find(c => c.id === Number(customerId));
  const type = PASS_TYPES.find(t => t.id === Number(typeId));
  if (!customer) return res.status(404).json({ error: "customer not found" });
  if (!type) return res.status(404).json({ error: "type not found" });

  const p = {
    id: NEXT_PURCHASE_ID++,
    customerId: customer.id,
    typeId: type.id,
    remaining: type.strips,
    createdAt: Date.now()
  };
  PURCHASES.push(p);
  res.status(201).json(p);
});

router.post("/use", (req, res) => {
  const { purchaseId } = req.body || {};
  const p = PURCHASES.find(x => x.id === Number(purchaseId));
  if (!p) return res.status(404).json({ error: "purchase not found" });
  if (p.remaining <= 0) return res.status(400).json({ error: "no strips left" });
  p.remaining -= 1;
  res.json(p);
});

export default router;
