// server/routes/passes.js
import express from "express";
const router = express.Router();

import { findCustomer } from "./customers.js";

// Named helpers (zodat import { useOneStripForCustomer } geldig is)
export function getPassBalance(customerId) {
  const c = findCustomer(customerId);
  if (!c) throw new Error("Klant niet gevonden");
  return c.passBalance || 0;
}

export function addPasses(customerId, amount) {
  const c = findCustomer(customerId);
  if (!c) throw new Error("Klant niet gevonden");
  const qty = Number(amount) || 0;
  c.passBalance = (c.passBalance || 0) + qty;
  return c.passBalance;
}

export function useOneStripForCustomer(customerId) {
  const c = findCustomer(customerId);
  if (!c) throw new Error("Klant niet gevonden");
  const bal = c.passBalance || 0;
  if (bal <= 0) throw new Error("Geen strippen meer beschikbaar");
  c.passBalance = bal - 1;
  return c.passBalance;
}

// REST
router.get("/:customerId/balance", (req, res) => {
  try { res.json({ balance: getPassBalance(req.params.customerId) }); }
  catch (e) { res.status(400).json({ error: String(e.message || e) }); }
});

router.post("/:customerId/add", (req, res) => {
  try {
    const { amount } = req.body || {};
    res.json({ balance: addPasses(req.params.customerId, amount) });
  } catch (e) { res.status(400).json({ error: String(e.message || e) }); }
});

router.post("/:customerId/use", (req, res) => {
  try { res.json({ balance: useOneStripForCustomer(req.params.customerId) }); }
  catch (e) { res.status(400).json({ error: String(e.message || e) }); }
});

export default router;
