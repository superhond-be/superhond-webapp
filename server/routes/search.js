// server/routes/search.js
import express from "express";
import { searchAll } from "./store.js";

const router = express.Router();

/**
 * GET /api/search?q=...
 * Zoekt tegelijk in klanten, honden en strippenkaarten
 */
router.get("/", (req, res) => {
  const q = req.query.q || "";
  try {
    const results = searchAll(q);
    res.json({ ok: true, query: q, results });
  } catch (err) {
    console.error("Fout in search:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
