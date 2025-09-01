// server/routes/passes.js (ESM)
import express from "express";
import { store, nextId } from "../store.js";

const router = express.Router();

/**
 * Elke pass:
 * {
 *   id,                 // nummer
 *   customerId,         // verplicht
 *   dogId,              // optioneel (kan null zijn)
 *   lessonType,         // bv. "PUPPY", "PUBER"
 *   total,              // totaal aantal strips
 *   used,               // verbruikte strips
 *   createdAt
 * }
 */

/** GET /api/passes?customerId=&dogId=  → filter optioneel op klant/hond */
router.get("/", (req, res) => {
  const customerId = req.query.customerId ? Number(req.query.customerId) : null;
  const dogId = req.query.dogId ? Number(req.query.dogId) : null;

  let list = store.passes;
  if (customerId) list = list.filter(p => p.customerId === customerId);
  if (dogId) list = list.filter(p => p.dogId === dogId);

  res.json(list);
});

/** POST /api/passes  → nieuwe strippenkaart aanmaken */
router.post("/", (req, res) => {
  const { customerId, dogId, lessonType, total } = req.body || {};
  if (!Number.isFinite(Number(customerId))) {
    return res.status(400).json({ error: "customerId is required" });
  }
  if (!lessonType || !Number.isFinite(Number(total)) || Number(total) <= 0) {
    return res.status(400).json({ error: "lessonType and positive total are required" });
  }

  // optioneel: verifieer dat klant bestaat
  const cust = store.customers.find(c => c.id === Number(customerId));
  if (!cust) return res.status(404).json({ error: "Customer not found" });

  // optioneel: als dogId is meegegeven, check of hond bestaat
  let dog = null;
  const dogIdNum = Number(dogId);
  if (Number.isFinite(dogIdNum)) {
    dog = store.dogs.find(d => d.id === dogIdNum);
    if (!dog) return res.status(404).json({ error: "Dog not found" });
  }

  const pass = {
    id: nextId(store.passes),
    customerId: Number(customerId),
    dogId: Number.isFinite(dogIdNum) ? dogIdNum : null,
    lessonType: String(lessonType).trim().toUpperCase(),
    total: Number(total),
    used: 0,
    createdAt: new Date().toISOString()
  };

  store.passes.push(pass);
  res.status(201).json(pass);
});

/** POST /api/passes/:id/use  → verbruik strips (default 1) */
router.post("/:id/use", (req, res) => {
  const id = Number(req.params.id);
  const count = Number(req.body?.count ?? 1);
  if (!Number.isFinite(count) || count <= 0) {
    return res.status(400).json({ error: "count must be a positive number" });
  }

  const p = store.passes.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: "Pass not found" });

  if (p.used + count > p.total) {
    return res.status(400).json({ error: "Not enough strips remaining" });
  }
  p.used += count;
  res.json(p);
});

/** PUT /api/passes/:id  → (optioneel) pas total/lessonType/dogId aan */
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const p = store.passes.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: "Pass not found" });

  const { lessonType, total, dogId } = req.body || {};

  if (lessonType !== undefined) p.lessonType = String(lessonType).trim().toUpperCase();
  if (total !== undefined) {
    const t = Number(total);
    if (!Number.isFinite(t) || t <= 0) return res.status(400).json({ error: "total must be a positive number" });
    if (p.used > t) return res.status(400).json({ error: "total cannot be less than used" });
    p.total = t;
  }
  if (dogId !== undefined) {
    const dId = Number(dogId);
    if (Number.isFinite(dId)) {
      const d = store.dogs.find(d => d.id === dId);
      if (!d) return res.status(404).json({ error: "Dog not found" });
      p.dogId = dId;
    } else {
      p.dogId = null; // ontkoppelen
    }
  }

  res.json(p);
});

/** DELETE /api/passes/:id */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = store.passes.length;
  store.passes = store.passes.filter(x => x.id !== id);
  if (store.passes.length === before) {
    return res.status(404).json({ error: "Pass not found" });
  }
  res.json({ message: "Pass removed" });
});

export default router;
