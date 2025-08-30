// server/routes/lessons.js
import express from "express";
import { findCustomer } from "./customers.js";

const router = express.Router();

let NEXT_LESSON_ID = 1;
const LESSONS = [];

/**
 * Model:
 * {
 *   id,
 *   title, date, time, location,
 *   capacity,
 *   participants: [ { customerId, dogId, stripUsed, joinedAt } ]
 * }
 */

// Alle lessen
router.get("/", (_req, res) => {
  res.json(LESSONS);
});

// Nieuwe les (coach)
router.post("/", (req, res) => {
  const { title, date, time, location, capacity } = req.body || {};
  if (!title || !date || !time) {
    return res.status(400).json({ error: "Titel, datum en tijd verplicht" });
  }
  const lesson = {
    id: NEXT_LESSON_ID++,
    title,
    date,
    time,
    location: location || "",
    capacity: Number(capacity) || 0,
    participants: [],
  };
  LESSONS.push(lesson);
  res.status(201).json(lesson);
});

// Klant inschrijven
router.post("/:lessonId/join", (req, res) => {
  const lesson = LESSONS.find((l) => l.id === Number(req.params.lessonId));
  if (!lesson) return res.status(404).json({ error: "Les niet gevonden" });

  const { customerId, dogId } = req.body || {};
  const c = findCustomer(customerId);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  if (lesson.capacity && lesson.participants.length >= lesson.capacity) {
    return res.status(400).json({ error: "Les is vol" });
  }

  // zoek actieve strippenkaart
  const pass = (c.passes || []).find((p) => p.remaining > 0);
  if (!pass) return res.status(400).json({ error: "Geen strippen meer beschikbaar" });

  // verbruik 1 strip
  pass.remaining -= 1;

  lesson.participants.push({
    customerId: c.id,
    dogId: Number(dogId) || null,
    stripUsed: pass.id,
    joinedAt: new Date().toISOString(),
  });

  res.json({ ok: true, lesson });
});

export default router;
