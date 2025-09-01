// server/routes/search.js (ESM)
import express from "express";
import { store } from "../store.js";

const router = express.Router();

/**
 * GET /api/search?q=...
 * Zoekt tegelijk in:
 *  - klanten: name, email, phone
 *  - honden:  name
 * Response: [{ customer, dogsMatched, passesSummary }]
 */
router.get("/", (req, res) => {
  const q = (req.query.q || "").toString().trim().toLowerCase();
  if (!q || q.length < 2) {
    return res.status(400).json({ error: "Geef min. 2 tekens op (q)." });
  }

  const results = [];

  // 1) matches op klant
  for (const c of store.customers) {
    const hay = [c.name, c.email, c.phone].filter(Boolean).join(" ").toLowerCase();
    if (hay.includes(q)) {
      const dogs = store.dogs.filter(d => d.ownerId === c.id);
      const passes = store.passes.filter(p => p.customerId === c.id);
      results.push({
        customer: c,
        dogsMatched: dogs, // alle honden bij deze klant
        passesSummary: summarizePasses(passes)
      });
    }
  }

  // 2) matches op hond (zonder dubbele klanten)
  const already = new Set(results.map(r => r.customer.id));
  for (const d of store.dogs) {
    if (!d.name) continue;
    if (String(d.name).toLowerCase().includes(q)) {
      const c = store.customers.find(x => x.id === d.ownerId);
      if (!c || already.has(c.id)) continue;
      const dogsSameOwner = store.dogs.filter(x => x.ownerId === c.id);
      const passes = store.passes.filter(p => p.customerId === c.id);
      results.push({
        customer: c,
        dogsMatched: dogsSameOwner, // alle honden bij deze klant (of kies [d] als je enkel match wil)
        passesSummary: summarizePasses(passes)
      });
    }
  }

  // Sorteer (optioneel): meest recente customer eerst
  results.sort((a, b) => (b.customer.id || 0) - (a.customer.id || 0));

  res.json(results);
});

/** Hulp: aggregeer passes per lessonType */
function summarizePasses(passes) {
  const byType = {};
  for (const p of passes) {
    const key = p.lessonType || "UNKNOWN";
    if (!byType[key]) byType[key] = { lessonType: key, total: 0, used: 0 };
    byType[key].total += Number(p.total || 0);
    byType[key].used += Number(p.used || 0);
  }
  return Object.values(byType);
}

export default router;
