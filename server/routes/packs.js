import express from "express";
const router = express.Router();

// in-memory
let PACKS = [];        // {id, customerId, size, expiresAt, used:0, reserved:0}
let NEXT_ID = 1;

// alle pakketten (optioneel filter per klant)
router.get("/", (req, res) => {
  const { customerId } = req.query || {};
  const list = customerId ? PACKS.filter(p => p.customerId === Number(customerId)) : PACKS;
  res.json(list);
});

// nieuw pakket
router.post("/", (req, res) => {
  const { customerId, size, expiresAt } = req.body || {};
  if (!customerId || !size) return res.status(400).json({ error: "customerId en size zijn verplicht" });

  const pack = { id: NEXT_ID++, customerId: Number(customerId), size: Number(size), expiresAt: expiresAt || null, used: 0, reserved: 0 };
  PACKS.push(pack);
  res.status(201).json(pack);
});

// helper: export voor bookings
export function findUsablePack(customerId) {
  const now = Date.now();
  // kies een geldig pack met ruimte (gereserveerd+used < size) en niet verlopen
  return PACKS.find(p =>
    p.customerId === Number(customerId) &&
    (p.expiresAt ? new Date(p.expiresAt).getTime() >= now : true) &&
    (p.used + p.reserved) < p.size
  );
}

// helper: markeringen (reserve, attend, cancel)
export function reserveCredit(packId) {
  const p = PACKS.find(x => x.id === packId); if (!p) return false;
  if (p.used + p.reserved >= p.size) return false;
  p.reserved += 1; return true;
}
export function consumeReserved(packId) {
  const p = PACKS.find(x => x.id === packId); if (!p || p.reserved <= 0) return false;
  p.reserved -= 1; p.used += 1; return true;
}
export function unreserve(packId) {
  const p = PACKS.find(x => x.id === packId); if (!p || p.reserved <= 0) return false;
  p.reserved -= 1; return true;
}

export default router;
