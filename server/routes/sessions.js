import express from "express";
const router = express.Router();

// In-memory sessies (lessen)
export let SESSIONS = [
  // voorbeeld
  // { id: 1, classId: 1, date: "2025-09-07T09:00", location: "Retie", capacity: 10 }
];
let NEXT_ID = SESSIONS.length ? Math.max(...SESSIONS.map(s => s.id)) + 1 : 1;

// Alle sessies (optioneel filter: classId)
router.get("/", (req, res) => {
  const classId = req.query.classId ? Number(req.query.classId) : null;
  const data = classId ? SESSIONS.filter(s => s.classId === classId) : SESSIONS;
  res.json(data);
});

// Eén sessie
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const s = SESSIONS.find(x => x.id === id);
  if (!s) return res.status(404).json({ error: "Les niet gevonden" });
  res.json(s);
});

// Nieuwe sessie (les) aanmaken
router.post("/", (req, res) => {
  const { classId, date, location, capacity } = req.body || {};
  if (!classId || !date || !location) {
    return res.status(400).json({ error: "classId, date en location zijn verplicht" });
  }

  const sess = {
    id: NEXT_ID++,
    classId: Number(classId),
    date: String(date),        // "YYYY-MM-DDTHH:mm"
    location: String(location),
    capacity: capacity ? Number(capacity) : null
  };
  SESSIONS.push(sess);
  res.status(201).json(sess);
});

// Sessie bijwerken
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const i = SESSIONS.findIndex(x => x.id === id);
  if (i === -1) return res.status(404).json({ error: "Les niet gevonden" });

  const { classId, date, location, capacity } = req.body || {};
  if (classId !== undefined) SESSIONS[i].classId = Number(classId);
  if (date !== undefined)    SESSIONS[i].date = String(date);
  if (location !== undefined) SESSIONS[i].location = String(location);
  if (capacity !== undefined) SESSIONS[i].capacity = (capacity === null ? null : Number(capacity));

  res.json(SESSIONS[i]);
});

// Sessie verwijderen
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = SESSIONS.length;
  SESSIONS = SESSIONS.filter(x => x.id !== id);
  if (SESSIONS.length === before) return res.status(404).json({ error: "Les niet gevonden" });
  res.status(204).end();
});

// (optioneel) Terugkerende sessies genereren (bv. elke zondag)
router.post("/recurring", (req, res) => {
  const { classId, location, capacity, startDate, endDate, weekday, hour, minute } = req.body || {};
  // weekday: 0=zo ... 6=za
  if (classId == null || !startDate || !endDate || weekday == null) {
    return res.status(400).json({ error: "classId, startDate, endDate, weekday verplicht" });
  }
  const start = new Date(startDate + "T00:00:00");
  const end   = new Date(endDate   + "T23:59:59");
  let d = new Date(start);

  // spring naar eerste gewenste weekday
  while (d.getDay() !== Number(weekday)) d.setDate(d.getDate() + 1);

  const created = [];
  while (d <= end) {
    const hh = (hour ?? 9).toString().padStart(2, "0");
    const mm = (minute ?? 0).toString().padStart(2, "0");
    const iso = `${d.getFullYear()}-${(d.getMonth()+1+"").padStart(2,"0")}-${(d.getDate()+"").padStart(2,"0")}T${hh}:${mm}`;

    const sess = {
      id: NEXT_ID++,
      classId: Number(classId),
      date: iso,
      location: String(location ?? ""),
      capacity: capacity ? Number(capacity) : null
    };
    SESSIONS.push(sess);
    created.push(sess);

    d.setDate(d.getDate() + 7); // volgende week
  }
  res.status(201).json({ count: created.length, sessions: created });
});

export default router;
