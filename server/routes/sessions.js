import express from "express";
import { sessions } from "../data/store.js";
const router = express.Router();

const nextId = () => (sessions.length ? Math.max(...sessions.map(s => s.id)) + 1 : 1);

// Overzicht (optioneel filter ?classId=)
router.get("/", (req, res) => {
  const { classId } = req.query;
  const data = classId ? sessions.filter(s => s.classId === Number(classId)) : sessions;
  res.json(data.sort((a,b) => (a.date + a.start).localeCompare(b.date + b.start)));
});

// Aanmaken
router.post("/", (req, res) => {
  const { classId, date, start, end = "", location = "", capacity } = req.body || {};
  if (!classId || !date || !start) {
    return res.status(400).json({ error: "Vereist: classId, date, start" });
  }
  const created = { id: nextId(), classId: Number(classId), date, start, end, location, capacity: capacity ? Number(capacity) : undefined };
  sessions.push(created);
  res.status(201).json(created);
});

// Verwijderen
router.delete("/:id", (req, res) => {
  const i = sessions.findIndex(s => s.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: "Sessie niet gevonden" });
  const removed = sessions.splice(i, 1)[0];
  res.json({ ok: true, removedId: removed.id });
});

export default router;
