import express from "express";
import { CLASSES } from "./classes.js";
const router = express.Router();
// server/routes/sessions.js
import express from "express";
const router = express.Router();

router.get("/", (_req, res) => res.json([]));

export default router;
/** In-memory sessions (lessen-momenten) */
let SESSIONS = [
  // voorbeeld:
  // { id: 1, classId: 1, date: "2025-09-07", time: "09:00", capacity: 12, note: "" }
];
let NEXT_ID = 1;

// lijst (filters: ?classId= & ?date=YYYY-MM-DD)
router.get("/", (req, res) => {
  let list = SESSIONS.slice();
  const { classId, date } = req.query || {};
  if (classId) list = list.filter(s => s.classId === Number(classId));
  if (date)    list = list.filter(s => s.date === String(date));
  res.json(list);
});

// toevoegen
router.post("/", (req, res) => {
  const { classId, date, time, capacity = null, note = "" } = req.body || {};
  if (!classId) return res.status(400).json({ error: "classId is verplicht" });
  if (!date) return res.status(400).json({ error: "Datum is verplicht (YYYY-MM-DD)" });
  if (!time) return res.status(400).json({ error: "Tijd is verplicht (HH:MM)" });

  const klas = CLASSES.find(c => c.id === Number(classId));
  if (!klas) return res.status(404).json({ error: "Klas niet gevonden" });

  const item = {
    id: NEXT_ID++,
    classId: Number(classId),
    date: String(date),
    time: String(time),
    capacity: capacity != null ? Number(capacity) : null,
    note: String(note || "")
  };
  SESSIONS.push(item);
  res.status(201).json(item);
});

export default router;
