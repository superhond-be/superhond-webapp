// server/routes/passes.js
import express from "express";
const router = express.Router();

// We krijgen een referentie naar CUSTOMERS uit customers.js
let CUSTOMERS_REF = null;
export function setCustomersRef(ref) { CUSTOMERS_REF = ref; }

// Types (strippenkaarten-definities) en aankopen
const PASS_TYPES = [];      // { id, name, strips }
const PURCHASES = [];       // { id, customerId, typeId, remaining, createdAt }
let NEXT_TYPE_ID = 1;
let NEXT_PURCHASE_ID = 1;

/**
 * GET /api/passes/types
 */
router.get("/types", (_req, res) => res.json(PASS_TYPES));

/**
 * POST /api/passes/types
 * Body: { name, strips }
 */
router.post("/types", (req, res) => {
  const { name, strips } = req.body || {};
  const n = Number(strips);
  if (!name || !Number.isFinite(n) || n <= 0) {
    return res.status(400).json({ error: "Ongeldig type" });
  }
  const t = { id: NEXT_TYPE_ID++, name: String(name), strips: n };
  PASS_TYPES.push(t);
  res.status(201).json(t);
});

/**
 * GET /api/passes/purchases?customerId=1
 */
router.get("/purchases", (req, res) => {
  const cid = req.query.customerId ? Number(req.query.customerId) : null;
  const list = cid ? PURCHASES.filter(p => p.customerId === cid) : PURCHASES;
  res.json(list);
});

/**
 * POST /api/passes/buy
 * Body: { customerId, typeId }
 */
router.post("/buy", (req, res) => {
  if (!CUSTOMERS_REF) return res.status(500).json({ error: "customers not wired" });

  const { customerId, typeId } = req.body || {};
  const customer = CUSTOMERS_REF.find(c => c.id === Number(customerId));
  const type = PASS_TYPES.find(t => t.id === Number(typeId));
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  if (!type) return res.status(404).json({ error: "Type niet gevonden" });

  const purchase = {
    id: NEXT_PURCHASE_ID++,
    customerId: customer.id,
    typeId: type.id,
    remaining: type.strips,
    createdAt: new Date().toISOString(),
  };
  PURCHASES.push(purchase);
  res.status(201).json(purchase);
});

/**
 * POST /api/passes/use
 * Body: { purchaseId }
 */
router.post("/use", (req, res) => {
  const { purchaseId } = req.body || {};
  const p = PURCHASES.find(x => x.id === Number(purchaseId));
  if (!p) return res.status(404).json({ error: "Aankoop niet gevonden" });
  if (p.remaining <= 0) return res.status(400).json({ error: "Geen strips meer" });
  p.remaining -= 1;
  res.json(p);
});

export default router;
