import express from "express";
const router = express.Router();

// (demo) alle sessies
router.get("/", (_req, res) => {
  const sessions = [
    { id: 101, classId: 1, date: "2025-09-07", time: "09:00", capacity: 8 },
    { id: 102, classId: 2, date: "2025-09-07", time: "10:00", capacity: 8 },
  ];
  res.json(sessions);
});

// (demo) nieuwe sessie aanmaken
router.post("/", (req, res) => {
  const { classId, date, time, capacity = 8 } = req.body || {};
  if (!classId || !date || !time) {
    return res.status(400).json({ error: "classId, date en time zijn verplicht" });
  }
  const created = {
    id: Math.floor(Math.random() * 100000),
    classId,
    date,
    time,
    capacity,
  };
  res.status(201).json(created);
});

export default router;
