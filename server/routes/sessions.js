// server/routes/sessions.js
import express from "express";
import { classes } from "./classes.js"; // om te checken of classId bestaat

const router = express.Router();

/**
 * In-memory sessies.
 * sessie = { id, classId, date (YYYY-MM-DD), time (HH:mm), capacity, locationId? }
 */
const sessions = [];
let sessionSeq = 1;

/** Hulpfuncties */
const toISODate = (d) => new Date(d).toISOString().split("T")[0];
const isValidTime = (t) => /^\d{2}:\d{2}$/.test(t);

/** Alle sessies (optionele filters: classId, from, to) */
router.get("/", (req, res) => {
  const { classId, from, to } = req.query;
  let out = [...sessions];
  if (classId) out = out.filter(s => s.classId === classId);
  if (from) out = out.filter(s => s.date >= from);
  if (to) out = out.filter(s => s.date <= to);
  res.json(out);
});

/** Eén losse sessie toevoegen */
router.post("/", (req, res) => {
  const { classId, date, time, capacity = 0, locationId = null } = req.body || {};

  if (!classId) return res.status(400).json({ error: "classId is verplicht." });
  if (!classes.find(c => c.id === String(classId)))
    return res.status(400).json({ error: "Onbekende classId." });

  if (!date) return res.status(400).json({ error: "date is verplicht (YYYY-MM-DD)." });
  if (!time || !isValidTime(time)) return res.status(400).json({ error: "time is verplicht (HH:mm)." });

  const newS = {
    id: String(sessionSeq++),
    classId: String(classId),
    date: toISODate(date),
    time,
    capacity: Number(capacity) || 0,
    locationId
  };
  sessions.push(newS);
  res.status(201).json(newS);
});

/**
 * Terugkerende sessies plannen
 * Body varianten:
 *  A) { classId, startDate, endDate, weekday, time, capacity, locationId }
 *  B) { patterns: [{ classId, startDate, endDate, weekday, time, capacity, locationId }, ...] }
 * weekday: 0=zo ... 6=za
 */
router.post("/recurring", (req, res) => {
  const body = req.body || {};
  const patterns = Array.isArray(body.patterns) ? body.patterns : [body];

  const created = [];

  for (const p of patterns) {
    const { classId, startDate, endDate, weekday, time, capacity = 0, locationId = null } = p;

    if (!classId || !classes.find(c => c.id === String(classId))) {
      return res.status(400).json({ error: "Onbekende of ontbrekende classId in pattern." });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate en endDate zijn verplicht." });
    }
    if (typeof weekday !== "number" || weekday < 0 || weekday > 6) {
      return res.status(400).json({ error: "weekday moet 0..6 zijn (0=Zondag)." });
    }
    if (!time || !isValidTime(time)) {
      return res.status(400).json({ error: "time is verplicht (HH:mm)." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Begin op de eerste dag van de periode
    let cursor = new Date(start);

    // Loop tot en met end
    while (cursor <= end) {
      if (cursor.getDay() === weekday) {
        const s = {
          id: String(sessionSeq++),
          classId: String(classId),
          date: toISODate(cursor),
          time,
          capacity: Number(capacity) || 0,
          locationId
        };
        sessions.push(s);
        created.push(s);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  res.status(201).json({ count: created.length, sessions: created });
});

export default router;
