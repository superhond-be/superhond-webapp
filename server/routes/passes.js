// server/routes/passes.js
import express from "express";

const router = express.Router();

/**
 * Lestypes met vast aantal strippen per pakket.
 * Voeg hier eenvoudig nieuwe pakketten aan toe.
 */
const LESPAKKETTEN = {
  puppy: { name: "Puppycursus", totalStrips: 9 },
  puber: { name: "Puber Cursus", totalStrips: 8 },
  gehoorzaamheid: { name: "Gehoorzaamheid", totalStrips: 10 },
};

/**
 * In-memory opslag voor strippenkaarten
 * pass = {
 *   id, customerId, dogId, packageKey, packageName,
 *   totalStrips, usedStrips, active, createdAt, updatedAt
 * }
 */
let PASSES = [];
let NEXT_PASS_ID = 1;

/** Helpers */
function nowISO() {
  return new Date().toISOString();
}

function findPass(id) {
  return PASSES.find(p => p.id === Number(id));
}

/**
 * POST /api/purchases
 * Maak een strippenkaart aan voor een klant/hond op basis van een lestype.
 * Body: { customerId, dogId, packageKey }  (packageKey = 'puppy', 'puber', ...)
 */
router.post("/api/purchases", (req, res) => {
  try {
    const { customerId, dogId, packageKey } = req.body || {};
    if (!customerId) return res.status(400).json({ error: "customerId is verplicht" });
    if (!dogId) return res.status(400).json({ error: "dogId is verplicht" });
    if (!packageKey) return res.status(400).json({ error: "packageKey is verplicht" });

    const pakket = LESPAKKETTEN[packageKey];
    if (!pakket) {
      return res.status(400).json({
        error: `Onbekend pakket '${packageKey}'. Kies één van: ${Object.keys(LESPAKKETTEN).join(", ")}.`,
      });
    }

    const pass = {
      id: NEXT_PASS_ID++,
      customerId: Number(customerId),
      dogId: Number(dogId),
      packageKey,
      packageName: pakket.name,
      totalStrips: pakket.totalStrips,
      usedStrips: 0,
      active: true,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    PASSES.push(pass);
    return res.status(201).json(pass);
  } catch (err) {
    return res.status(500).json({ error: "Kon strippenkaart niet aanmaken", details: String(err) });
  }
});

/**
 * POST /api/passes/:id/use
 * Verbruik 1 strip van een actieve kaart.
 */
router.post("/api/passes/:id/use", (req, res) => {
  try {
    const pass = findPass(req.params.id);
    if (!pass) return res.status(404).json({ error: "Strippenkaart niet gevonden" });
    if (!pass.active) return res.status(400).json({ error: "Kaart is niet actief" });

    if (pass.usedStrips >= pass.totalStrips) {
      pass.active = false;
      pass.updatedAt = nowISO();
      return res.status(400).json({ error: "Kaart is volledig opgebruikt", pass });
    }

    pass.usedStrips += 1;
    if (pass.usedStrips >= pass.totalStrips) {
      pass.active = false;
    }
    pass.updatedAt = nowISO();

    return res.json({
      ...pass,
      remainingStrips: Math.max(0, pass.totalStrips - pass.usedStrips),
    });
  } catch (err) {
    return res.status(500).json({ error: "Kon strip niet verbruiken", details: String(err) });
  }
});

/**
 * GET /api/passes
 * Optionele filters: ?customerId=..&dogId=..&active=true|false
 */
router.get("/api/passes", (req, res) => {
  try {
    const { customerId, dogId, active } = req.query;
    let list = [...PASSES];

    if (customerId) list = list.filter(p => p.customerId === Number(customerId));
    if (dogId) list = list.filter(p => p.dogId === Number(dogId));
    if (active === "true") list = list.filter(p => p.active);
    if (active === "false") list = list.filter(p => !p.active);

    // voeg remainingStrips toe
    const withRemaining = list.map(p => ({
      ...p,
      remainingStrips: Math.max(0, p.totalStrips - p.usedStrips),
    }));

    return res.json(withRemaining);
  } catch (err) {
    return res.status(500).json({ error: "Kon strippenkaarten niet ophalen", details: String(err) });
  }
});

/**
 * GET /api/passes/:id
 * Eén strippenkaart ophalen
 */
router.get("/api/passes/:id", (req, res) => {
  const pass = findPass(req.params.id);
  if (!pass) return res.status(404).json({ error: "Strippenkaart niet gevonden" });
  return res.json({
    ...pass,
    remainingStrips: Math.max(0, pass.totalStrips - pass.usedStrips),
  });
});

/**
 * (Optioneel) POST /api/passes/:id/deactivate
 * Maak kaart inactief (bv. bij terugbetaling of foutieve aankoop)
 */
router.post("/api/passes/:id/deactivate", (req, res) => {
  const pass = findPass(req.params.id);
  if (!pass) return res.status(404).json({ error: "Strippenkaart niet gevonden" });
  pass.active = false;
  pass.updatedAt = nowISO();
  return res.json(pass);
});

export default router;
