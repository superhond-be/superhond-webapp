// server/routes/sessions.js
import express from "express";

const router = express.Router();

// voorbeeld: haal alle sessies op
router.get("/", (req, res) => {
  res.json([
    { id: 1, classId: 1, date: "2025-09-01", time: "09:00", capacity: 15 },
    { id: 2, classId: 2, date: "2025-09-01", time: "10:00", capacity: 15 }
  ]);
});

// voorbeeld: nieuwe sessie aanmaken
router.post("/", (req, res) => {
  const { classId, date, time, capacity } = req.body;
  res.status(201).json({
    message: "Sessie aangemaakt",
    session: { classId, date, time, capacity }
  });
});

export default router;
