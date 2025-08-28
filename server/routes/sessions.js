import express from "express";
const router = express.Router();

let sessions = [];

// Eén sessie toevoegen
router.post("/", (req, res) => {
  const s = {
    id: sessions.length + 1,
    classId: req.body.classId,
    date: req.body.date,
    time: req.body.time,
    capacity: req.body.capacity
  };
  sessions.push(s);
  res.status(201).json(s);
});

// Terugkerende sessies (bv. elke zondag)
router.post("/recurring", (req, res) => {
  const { classId, startDate, endDate, weekday, time, capacity } = req.body;
  const start = new Date(startDate);
  const end = new Date(endDate);

  let current = new Date(start);
  let created = [];
  while (current <= end) {
    if (current.getDay() === weekday) {
      const s = {
        id: sessions.length + 1,
        classId,
        date: current.toISOString().split("T")[0],
        time,
        capacity
      };
      sessions.push(s);
      created.push(s);
    }
    current.setDate(current.getDate() + 1);
  }
  res.status(201).json(created);
});

export default router;
// POST /api/sessions/recurring
// body: { classId, startDate, endDate, weekday, time, capacity, locationId }
// of:   { patterns: [ { classId, startDate, endDate, weekday, time, capacity, locationId }, ... ] }
router.post("/recurring", (req, res) => {
  const patterns = Array.isArray(req.body?.patterns) ? req.body.patterns : [req.body];
  if (!patterns.length) return res.status(400).json({ error: "Geen patronen ontvangen" });

  const created = [];

  for (const p of patterns) {
    const { classId, startDate, endDate, weekday, time, capacity, locationId } = p || {};
    if (!classId || !startDate || !endDate || typeof weekday !== "number" || !time)
      return res.status(400).json({ error: "classId, startDate, endDate, weekday en time zijn verplicht" });

    // `time` verwacht "HH:MM" (24u)
    const [hh, mm] = time.split(":").map(n => parseInt(n, 10));
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T23:59:59");

    // naar eerstvolgende gewenste weekday
    while (start.getDay() !== weekday) start.setDate(start.getDate() + 1);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
      const s = new Date(d);
      s.setHours(hh, mm, 0, 0);
      const e = new Date(s);
      e.setHours(hh + 1, mm, 0, 0); // standaard 1u les, pas aan indien nodig

      const sess = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        classId,
        start: s.toISOString(),
        end: e.toISOString(),
        locationId: locationId ?? null,
        capacity: capacity ?? 15,
        status: "OPEN",
        notes: ""
      };

      // TODO: DB insert; voorlopig in-memory
      sessions.push(sess);
      created.push(sess);
    }
  }

  res.status(201).json({ createdCount: created.length, sessions: created });
});
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
