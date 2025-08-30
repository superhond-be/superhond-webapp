import express from "express";
const router = express.Router();

/**
 * Strippenkaarten in-memory
 * pass = { id, customerId, type, totalStrips, usedStrips, reservedStrips, expiresAt, note, active }
 */
let PASSES = [];
let NEXT_ID = 1;

function todayISO() { return new Date().toISOString().slice(0,10); }

router.get("/", (_req, res) => res.json(PASSES));

router.get("/by-customer/:customerId", (req, res) => {
  const cid = Number(req.params.customerId);
  const list = PASSES.filter(p => p.customerId === cid);
  res.json(list);
});

router.post("/", (req, res) => {
  const { customerId, type, totalStrips, expiresAt, note = "", active = true } = req.body || {};
  if (!customerId) return res.status(400).json({ error: "customerId is verplicht" });
  if (!type) return res.status(400).json({ error: "type is verplicht (bv. 'puppy-9')" });
  const item = {
    id: NEXT_ID++,
    customerId: Number(customerId),
    type: String(type),
    totalStrips: Number(totalStrips ?? 0),
    usedStrips: 0,
    reservedStrips: 0,
    expiresAt: expiresAt ? String(expiresAt) : null,
    note: String(note),
    active: !!active
  };
  PASSES.push(item);
  res.status(201).json(item);
});

// Admin: aanpassen totaal/einddatum/active/note
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const p = PASSES.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: "Strippenkaart niet gevonden" });

  const { totalStrips, expiresAt, active, note } = req.body || {};
  if (totalStrips != null) p.totalStrips = Number(totalStrips);
  if (expiresAt !== undefined) p.expiresAt = expiresAt ? String(expiresAt) : null;
  if (active != null) p.active = !!active;
  if (note !== undefined) p.note = String(note ?? "");
  res.json(p);
});

// helper: controleren op beschikbaarheid
export function getAvailableStrips(pass) {
  return pass.totalStrips - pass.usedStrips - pass.reservedStrips;
}
export function findValidPassForCustomer(customerId) {
  const today = todayISO();
  // eenvoudig: neem de eerste actieve, niet-verlopen kaart met beschikbaarheid
  return PASSES.find(p =>
    p.customerId === Number(customerId) &&
    p.active &&
    (p.expiresAt ? p.expiresAt >= today : true) &&
    getAvailableStrips(p) > 0
  ) || null;
}

export default router;
export { PASSES };
