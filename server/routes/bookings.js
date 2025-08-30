import express from "express";
import { PASSES, findValidPassForCustomer, getAvailableStrips } from "./passes.js";
import { CLASSES } from "./classes.js";     // bestaat al bij jou
import sessionsRoutes from "./sessions.js"; // alleen om zeker te zijn dat sessions geladen is (niet gebruikt)
export const router = express.Router();

globalThis.BOOKINGS ??= []; // later vullen bij echte inschrijvingen

router.get("/", (_req, res) => {
  res.json(globalThis.BOOKINGS);
});

export default router;



const router = express.Router();

/**
 * bookings in-memory:
 * { id, sessionId, customerId, dogId, status: 'reserved'|'attended'|'cancelled'|'no-show', passId, createdAt }
 */
let BOOKINGS = [];
let NEXT_ID = 1;

// (voor test) lijst
router.get("/", (_req, res) => res.json(BOOKINGS));

/**
 * POST /api/bookings
 * body: { sessionId, customerId, dogId? }
 * - zoekt geldige strippenkaart van klant
 * - verhoogt reservedStrips met 1
 * - maakt booking met status "reserved"
 */
router.post("/", (req, res) => {
  const { sessionId, customerId, dogId } = req.body || {};
  if (!sessionId || !customerId) return res.status(400).json({ error: "sessionId en customerId zijn verplicht" });

  const pass = findValidPassForCustomer(customerId);
  if (!pass) return res.status(409).json({ error: "Geen geldige strippenkaart of geen strips beschikbaar" });

  // reserveer (houd 1 strip vast)
  pass.reservedStrips += 1;

  const b = {
    id: NEXT_ID++,
    sessionId: Number(sessionId),
    customerId: Number(customerId),
    dogId: dogId ? Number(dogId) : null,
    status: "reserved",
    passId: pass.id,
    createdAt: new Date().toISOString()
  };
  BOOKINGS.push(b);
  res.status(201).json(b);
});

/**
 * PATCH /api/bookings/:id/attend
 * - verbruikt 1 strip: reserved--, used++
 */
router.patch("/:id/attend", (req, res) => {
  const id = Number(req.params.id);
  const b = BOOKINGS.find(x => x.id === id);
  if (!b) return res.status(404).json({ error: "Boeking niet gevonden" });
  if (b.status !== "reserved") return res.status(409).json({ error: "Alleen 'reserved' kan op 'attended' gezet worden" });

  const pass = PASSES.find(p => p.id === b.passId);
  if (!pass) return res.status(500).json({ error: "Strippenkaart niet gevonden" });

  // consume 1 strip
  if (pass.reservedStrips > 0) pass.reservedStrips -= 1;
  pass.usedStrips += 1;
  b.status = "attended";

  res.json({ booking: b, pass });
});

/**
 * PATCH /api/bookings/:id/cancel
 * - annuleert reservering: reserved-- (geen verbruik)
 */
router.patch("/:id/cancel", (req, res) => {
  const id = Number(req.params.id);
  const b = BOOKINGS.find(x => x.id === id);
  if (!b) return res.status(404).json({ error: "Boeking niet gevonden" });
  if (b.status !== "reserved") return res.status(409).json({ error: "Alleen 'reserved' kan geannuleerd worden" });

  const pass = PASSES.find(p => p.id === b.passId);
  if (!pass) return res.status(500).json({ error: "Strippenkaart niet gevonden" });

  if (pass.reservedStrips > 0) pass.reservedStrips -= 1;
  b.status = "cancelled";

  res.json({ booking: b, pass });
});

/**
 * PATCH /api/bookings/:id/noshow
 * - beleid: telt als verbruik (zoals afgesproken). reserved--, used++.
 *   (Wil je dit niet? Zet used++ niet.)
 */
router.patch("/:id/noshow", (req, res) => {
  const id = Number(req.params.id);
  const b = BOOKINGS.find(x => x.id === id);
  if (!b) return res.status(404).json({ error: "Boeking niet gevonden" });
  if (b.status !== "reserved") return res.status(409).json({ error: "Alleen 'reserved' kan naar 'no-show'" });

  const pass = PASSES.find(p => p.id === b.passId);
  if (!pass) return res.status(500).json({ error: "Strippenkaart niet gevonden" });

  if (pass.reservedStrips > 0) pass.reservedStrips -= 1;
  pass.usedStrips += 1; // beleid: no-show = strip verbruikt
  b.status = "no-show";

  res.json({ booking: b, pass });
});

export default router;
export { BOOKINGS };
