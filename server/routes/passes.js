// server/routes/passes.js
import express from "express";
import { findCustomer } from "./customers.js";

const router = express.Router();

let NEXT_PASS_ID = 1;

/**
 * Model:
 * {
 *   id,
 *   type,            // bv. "10-beurten"
 *   totalStrips,     // totaal aantal strippen
 *   remaining,       // resterend
 *   validMonths,     // geldigheid in maanden (optioneel)
 *   createdAt,
 *   notes
 * }
 */

// Lijst passes (optioneel per klant)
router.get("/", (req, res) => {
  const { customerId } = req.query || {};
  if (!customerId) {
    return res.status(400).json({ error: "customerId is verplicht" });
  }
  const c = findCustomer(customerId);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(c.passes || []);
});

// Nieuwe strippenkaart voor klant
router.post("/:customerId", (req, res) => {
  const c = findCustomer(req.params.customerId);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const { type, totalStrips, validMonths, notes } = req.body || {};
  const total = Number(totalStrips) || 10;

  const pass = {
    id: NEXT_PASS_ID++,
    type: type || `${total}-beurten`,
    totalStrips: total,
    remaining: total,
    validMonths: Number(validMonths) || 0,
    createdAt: new Date().toISOString(),
    notes: notes || "",
  };

  c.passes = c.passes || [];
  c.passes.push(pass);

  res.status(201).json(pass);
});

// Een strip gebruiken
router.post("/:customerId/:passId/use", (req, res) => {
  const c = findCustomer(req.params.customerId);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const pass = (c.passes || []).find(
    (p) => p.id === Number(req.params.passId)
  );
  if (!pass) return res.status(404).json({ error: "Strippenkaart niet gevonden" });

  if (pass.remaining <= 0) {
    return res.status(400).json({ error: "Geen strippen meer over" });
  }

  pass.remaining -= 1;
  res.json({ ok: true, remaining: pass.remaining, pass });
});

export default router;
