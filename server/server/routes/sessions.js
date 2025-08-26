import express from "express";
import { v4 as uuid } from "uuid";
import db from "../db.js";

const router = express.Router();

// Alle lessen (sessies)
router.get("/", (req, res) => {
  const rows = db.prepare(`
    SELECT s.*, c.name AS class_name
    FROM sessions s
    LEFT JOIN classes c ON c.id = s.class_id
    ORDER BY date, start_time
  `).all();
  res.json(rows);
});

// Nieuwe les
router.post("/", (req, res) => {
  const id = uuid();
  const { class_id = null, date = "", start_time = "", end_time = "", location = "" } = req.body;

  db.prepare(`
    INSERT INTO sessions (id, class_id, date, start_time, end_time, location)
    VALUES (?,?,?,?,?,?)
  `).run(id, class_id, date, start_time, end_time, location);

  res.status(201).json({ id });
});

export default router;
