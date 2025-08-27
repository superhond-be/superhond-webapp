import express from "express";
const router = express.Router();

// Voorbeeld-data
let sessions = [
  { id: 1, classId: 1, date: "2025-09-01", attendees: 5 },
  { id: 2, classId: 2, date: "2025-09-03", attendees: 8 }
];

// Alle sessies ophalen
router.get("/", (req, res) => {
  res.json(sessions);
});

// Eén sessie ophalen op ID
router.get("/:id", (req, res) => {
  const session = sessions.find(s => s.id === parseInt(req.params.id));
  if (!session) return res.status(404).json({ error: "Sessie niet gevonden" });
  res.json(session);
});

// Nieuwe sessie toevoegen
router.post("/", (req, res) => {
  const newSession = {
    id: sessions.length + 1,
    classId: req.body.classId,
    date: req.body.date,
    attendees: req.body.attendees ?? 0
  };
  sessions.push(newSession);
  res.status(201).json(newSession);
});

export default router;
