// server/routes/passes.js
import express from "express";

const router = express.Router();

// Simpele in-memory data
let PASSES = [];

/**
 * Voeg een strippenkaart toe aan een klant
 */
export function useOnStripForCustomer(customerId, passData) {
  const newPass = {
    id: Date.now().toString(),
    customerId,
    ...passData,
    used: 0,
  };
  PASSES.push(newPass);
  return newPass;
}

/**
 * API endpoint: lijst alle strippenkaarten
 */
router.get("/", (req, res) => {
  res.json(PASSES);
});

/**
 * API endpoint: voeg een nieuwe strippenkaart toe
 */
router.post("/", (req, res) => {
  const { customerId, type, credits } = req.body;
  if (!customerId || !type || !credits) {
    return res.status(400).json({ error: "customerId, type en credits zijn verplicht" });
  }
  const newPass = useOnStripForCustomer(customerId, { type, credits });
  res.status(201).json(newPass);
});

/**
 * API endpoint: gebruik een strip
 */
router.post("/:id/use", (req, res) => {
  const pass = PASSES.find(p => p.id === req.params.id);
  if (!pass) return res.status(404).json({ error: "Strippenkaart niet gevonden" });

  if (pass.used >= pass.credits) {
    return res.status(400).json({ error: "Geen credits meer" });
  }

  pass.used += 1;
  res.json(pass);
});

export default router;
