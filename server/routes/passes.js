// server/routes/passes.js
import express from "express";
const router = express.Router();

/**
 * We houden strippenkaarten in memory.
 * Een pass is: { id, customerId, type, total, remaining, notes, createdAt, expiresAt? }
 * In productie verplaats je dit naar een database.
 */
let PASSES = [];
let NEXT_ID = 1;

// We willen klanten-id’s kunnen valideren.
// index.js roept setCustomersRef(CUSTOMERS) aan na het koppelen van de routes.
let CUSTOMERS_REF = null;
export function setCustomersRef(ref) {
  CUSTOMERS_REF = ref;
}

/* Helpers */
function findCustomer(id) {
  if (!CUSTOMERS_REF) return null;
  const num = Number(id);
  return CUSTOMERS_REF.find(c => c.id === num) || null;
}

function nowISO() {
  return new Date().toISOString();
}

/* -------------------- ROUTES -------------------- */

/**
 * GET /api/passes
 * Optioneel query’s:
 *  - customerId=number  -> filter op klant
 */
router.get("/", (req, res) => {
  const { customerId } = req.query;
  let list = PASSES;

  if (customerId) {
    const cid = Number(customerId);
    list = list.filter(p => p.customerId === cid);
  }

  res.json(list);
});

/**
 * GET /api/passes/:customerId
 * Alle strippenkaarten voor 1 klant.
 */
router.get("/:customerId", (req, res) => {
  const { customerId } = req.params;
  const cid = Number(customerId);

  const customer = findCustomer(cid);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  const list = PASSES.filter(p => p.customerId === cid);
  res.json(list);
});

/**
 * POST /api/passes
 * Body: { customerId, type?, total, expiresAt?, notes? }
 * Maakt een nieuwe strippenkaart voor een klant.
 */
router.post("/", (req, res) => {
  const { customerId, total, type = "strippenkaart", expiresAt = null, notes = "" } = req.body || {};

  const cid = Number(customerId);
  if (!cid) return res.status(400).json({ error: "customerId is verplicht" });
  if (!Number.isFinite(Number(total)) || Number(total) <= 0) {
    return res.status(400).json({ error: "total moet een positief getal zijn" });
  }

  const customer = findCustomer(cid);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  const pass = {
    id: NEXT_ID++,
    customerId: cid,
    type,
    total: Number(total),
    remaining: Number(total),
    notes,
    createdAt: nowISO(),
    expiresAt, // ISO string of null
  };

  PASSES.push(pass);
  res.status(201).json(pass);
});

/**
 * POST /api/passes/:customerId/use
 * Body: { passId? } of { amount? = 1 }
 * Verbruikt 1 (of amount) strip van de meest recente geldige kaart,
 * tenzij passId wordt meegegeven (dan die specifieke kaart).
 */
router.post("/:customerId/use", (req, res) => {
  const cid = Number(req.params.customerId);
  const { passId = null, amount = 1 } = req.body || {};

  if (!cid) return res.status(400).json({ error: "Ongeldige customerId" });
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: "amount moet een positief getal zijn" });
  }

  const customer = findCustomer(cid);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  let pass;
  if (passId) {
    pass = PASSES.find(p => p.id === Number(passId) && p.customerId === cid);
  } else {
    // kies meest recente kaart met remaining > 0 (en evt. niet verlopen)
    const candidates = PASSES
      .filter(p => p.customerId === cid && p.remaining > 0)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    pass = candidates[0];
  }

  if (!pass) return res.status(404).json({ error: "Geen geschikte strippenkaart gevonden" });

  // check vervaldatum
  if (pass.expiresAt && new Date(pass.expiresAt) < new Date()) {
    return res.status(400).json({ error: "Strippenkaart is verlopen" });
  }

  if (pass.remaining < amount) {
    return res.status(400).json({ error: "Onvoldoende strips over" });
  }

  pass.remaining -= Number(amount);
  res.json({ ok: true, pass });
});

/**
 * POST /api/passes/:customerId/refill
 * Body: { passId, add }
 * Voegt strips toe aan een bestaande kaart.
 */
router.post("/:customerId/refill", (req, res) => {
  const cid = Number(req.params.customerId);
  const { passId, add } = req.body || {};

  if (!cid) return res.status(400).json({ error: "Ongeldige customerId" });
  if (!passId) return res.status(400).json({ error: "passId is verplicht" });
  if (!Number.isFinite(Number(add)) || Number(add) <= 0) {
    return res.status(400).json({ error: "add moet een positief getal zijn" });
  }

  const pass = PASSES.find(p => p.id === Number(passId) && p.customerId === cid);
  if (!pass) return res.status(404).json({ error: "Strippenkaart niet gevonden" });

  pass.total += Number(add);
  pass.remaining += Number(add);
  res.json({ ok: true, pass });
});

/**
 * DELETE /api/passes/:id
 * Verwijder een strippenkaart (admin/debug).
 */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = PASSES.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Strippenkaart niet gevonden" });

  const removed = PASSES.splice(idx, 1)[0];
  res.json({ ok: true, removed });
});

export default router;
