// server/routes/search.js  (ESM)
import express from "express";
import { store } from "../store.js";

const router = express.Router();

/**
 * GET /api/search?q=...
 * Zoekt in klanten en honden.
 * Resultaat: { customers:[...], dogs:[...] }
 */
router.get("/", (req, res) => {
  const q = (req.query.q || "").toString().trim().toLowerCase();
  if (!q) return res.json({ customers: [], dogs: [] });

  const customers = store.customers.filter(c =>
    [c.name, c.email, c.phone].filter(Boolean).join(" ").toLowerCase().includes(q)
  );

  const dogs = store.dogs.filter(d => {
    const owner = store.customers.find(c => c.id === d.ownerId);
    const line = [
      d.name, d.breed, d.sex, d.vaccineStatus,
      owner?.name, owner?.email, owner?.phone
    ].filter(Boolean).join(" ").toLowerCase();
    return line.includes(q);
  });

  res.json({ customers, dogs });
});

export default router;
