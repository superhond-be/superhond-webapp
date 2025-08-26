import express from "express";
import { v4 as uuid } from "uuid";
import db from "../db.js";

const router = express.Router();

// Alle klassen ophalen
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM classes ORDER BY name").all();
  res.json(rows);
});

// Nieuwe klas toevoegen
router.post("/", (req, res) => {
  const id = uuid();
  const { name = "", description = "", location = "", start_date = "", end_date = "" } = req.body;

  db.prepare(`
    INSERT INTO classes (id, name, description, location, start_date, end_date)
    VALUES (?,?,?,?,?,?)
  `).run(id, name, description, location, start_date, end_date);

  res.status(201).json({ id });
});

export default router;
