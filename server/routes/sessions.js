import express from "express";
const router = express.Router();

/**
 * SESSIES = concrete momenten, gelinkt aan een klas
 * - classId: verwijzing naar klas (bv. 1 = Puppy)
 * - date: "YYYY-MM-DD"
 * - start: "HH:MM"
 * - end: "HH:MM" (optioneel)
 * - location: bv. "Retie"
 */
let sessions = [
  { id: 1, classId: 1, date: "2025-08-31", start: "10:00", end: "11:00", location: "Retie" },
  { id: 2, classId: 1, date: "2025-09-07", start: "10:00", end: "11:00", location: "Retie" },
  { id: 3, classId: 2, date: "2025-09-03", start: "18:30", end: "19:30", location: "Turnhout" }
];

const nextId = () => (sessions.length ? Math.max(...sessions.map(s => s.id)) + 1 : 1);

// Alle sessies (optioneel filter op classId met ?classId=2)
router.get("/", (req, res) => {
  const { classId } = req.query;
  const data = classId ? sessions.filter(s => s.classId === Number(classId)) : sessions;
  res.json(data.sort((a,b) => (a.date + a.start).localeCompare(b.date + b.start)));
});

// Nieuwe sessie
router.post("/", (req, res) => {
  const { classId, date, start, end = "", location = "" } = req.body || {};
  if (!classId || !date || !start) {
    return res.status(400).json({ error: "Vereist: classId, date, start" });
    }
  const created = { id: nextId(), classId: Number(classId), date, start, end, location };
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
