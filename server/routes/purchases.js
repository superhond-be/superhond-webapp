// server/routes/purchases.js
import express from "express";
import { findCustomer } from "./customers.js";

const router = express.Router();

/**
 * Pending aankopen die via Google binnenkomen.
 * Voorbeeldrecord:
 * { id, email, packageKey, lessons, classKey, expiresAt, claimed }
 */
let NEXT_PURCHASE_ID = 1;
const PENDING_PURCHASES = [];

/**
 * POST /api/integrations/google/purchase  (webhook)
 * Body: { email, packageKey, lessons, classKey?, expiresAt? }
 * - email: verplicht
 * - lessons: aantal lessen/strips (bv. 9)
 * - packageKey: bv. "puppy-9"
 * - classKey (optioneel): bv. "puppy"
 * - expiresAt (ISO, optioneel)
 */
router.post("/integrations/google/purchase", (req, res) => {
  const { email, packageKey, lessons, classKey = null, expiresAt = null } = req.body || {};
  if (!email || !lessons) {
    return res.status(400).json({ error: "email en lessons zijn verplicht" });
  }
  const purchase = {
    id: NEXT_PURCHASE_ID++,
    email: String(email).trim().toLowerCase(),
    packageKey: packageKey || `pakket-${lessons}`,
    lessons: Number(lessons),
    classKey,        // bv. 'puppy'
    expiresAt,       // ISO of null
    claimed: false,
    createdAt: new Date().toISOString(),
  };
  PENDING_PURCHASES.push(purchase);
  return res.status(201).json(purchase);
});

/**
 * GET /api/purchases/pending?email=...
 * Haal alle on-geclaimde aankopen voor een email.
 */
router.get("/purchases/pending", (req, res) => {
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "email query param ontbreekt" });
  const items = PENDING_PURCHASES.filter(p => !p.claimed && p.email === email);
  res.json(items);
});

/**
 * POST /api/purchases/claim
 * Body: { email, purchaseId, customerId, dogId }
 * - Zoekt pending aankoop op email + id
 * - Zet om naar strippenkaart bij klant
 * - Markeer purchase als claimed
 */
router.post("/purchases/claim", (req, res) => {
  const { email, purchaseId, customerId, dogId } = req.body || {};
  const normEmail = String(email || "").trim().toLowerCase();
  const pid = Number(purchaseId);
  const cid = Number(customerId);

  if (!normEmail || !pid || !cid) {
    return res.status(400).json({ error: "email, purchaseId en customerId zijn verplicht" });
  }
  const purchase = PENDING_PURCHASES.find(p => p.id === pid && p.email === normEmail && !p.claimed);
  if (!purchase) return res.status(404).json({ error: "Pending aankoop niet gevonden" });

  const customer = findCustomer(cid);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  // Maak/append strippenkaart (we gebruiken je passes-model bij de klant)
  customer.passes = customer.passes || [];
  const newPass = {
    id: (customer.passes.at(-1)?.id || 0) + 1,
    type: purchase.packageKey || `${purchase.lessons}-beurten`,
    totalStrips: purchase.lessons,
    remaining: purchase.lessons,
    validMonths: 0,
    createdAt: new Date().toISOString(),
    notes: purchase.classKey ? `Lestype: ${purchase.classKey}` : "",
    classKey: purchase.classKey || null,
    dogId: dogId ? Number(dogId) : null, // optioneel al aan hond hangen
    expiresAt: purchase.expiresAt || null
  };
  customer.passes.push(newPass);

  // Markeer geclaimd
  purchase.claimed = true;
  purchase.claimedAt = new Date().toISOString();
  purchase.claimedByCustomerId = customer.id;
  if (dogId) purchase.claimedDogId = Number(dogId);

  return res.status(201).json({ ok: true, pass: newPass, purchase });
});

export default router;
