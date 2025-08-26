// server/routes/classes.js
import express from "express";
import { v4 as uuid } from "uuid";
import db from "../db.js";

const router = express.Router();

/**
 * GET /api/classes
 * Haal alle klassen op, alfabetisch op naam.
 */
router.get("/", (_req, res) => {
  const rows = db.prepare(`
    SELECT id, name, description, location, start_date, end_date
    FROM classes
    ORDER BY name
  `).all();
  res.json(rows);
});

/**
 * POST /api/classes
 * Maak een nieuwe klas aan.
 * Body JSON: { name, description?, location?, start_date?, end_date? }
 */
router.post("/", (req, res) => {
  const id = uuid();
  const {
    name = "",
    description = "",
    location = "",
    start_date = "",
    end_date = ""
  } = req.body;

  if (!name.trim()) {
    return res.status(400).json({ error: "Naam is verplicht." });
  }

  db.prepare(`
    INSERT INTO classes (id, name, description, location, start_date, end_date)
    VALUES (?,?,?,?,?,?)
  `).run(id, name, description, location, start_date, end_date);

  res.status(201).json({ id });
});

/**
 * (Optioneel) PUT /api/classes/:id
 * Werk een klas bij.
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, location, start_date, end_date } = req.body;

  const stmt = db.prepare(`
    UPDATE classes
    SET
      name        = COALESCE(?, name),
      description = COALESCE(?, description),
      location    = COALESCE(?, location),
      start_date  = COALESCE(?, start_date),
      end_date    = COALESCE(?, end_date)
    WHERE id = ?
  `);
  const info = stmt.run(name, description, location, start_date, end_date, id);

  if (info.changes === 0) return res.status(404).json({ error: "Klas niet gevonden." });
  res.json({ ok: true });
});

/**
 * (Optioneel) DELETE /api/classes/:id
 * Verwijder een klas (en laat sessies ongemoeid voor nu).
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const info = db.prepare(`DELETE FROM classes WHERE id = ?`).run(id);
  if (info.changes === 0) return res.status(404).json({ error: "Klas niet gevonden." });
  res.json({ ok: true });
});

export default router;
