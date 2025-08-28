...import express from "express";
const router = express.Router();

// Demo sessies (zondag 09:00/10:00/11:00)
let sessions = [
  { id: 1, classId: 1, date: "2025-08-31", time: "09:00", capacity: 15 },
  { id: 2, classId: 2, date: "2025-08-31", time: "10:00", capacity: 15 },
  { id: 3, classId: 3, date: "2025-08-31", time: "11:00", capacity: 15 }
];

// Lijst
router.get("/", (_req, res) => {
  res.json(sessions);
});

// Detail
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const sess = sessions.find(s => s.id === id);
  if (!sess) return res.status(404).json({ error: "Sessie niet gevonden" });
  res.json(sess);
});

export default router;
