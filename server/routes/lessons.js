// server/routes/lessons.js
import express from "express";
const router = express.Router();

// Eenvoudige in-memory lessen
let LESSONS = [];
let NEXT_LESSON_ID = 1;

// Lijst lessen (optioneel filter op type, locatie, datum)
router.get("/", (req, res) => {
  res.json(LESSONS);
});

// Nieuwe les
router.post("/", (req, res) => {
  const { title, date, time, location, capacity } = req.body || {};
  if (!title) return res.status(400).json({ error: "Titel is verplicht" });

  const newLesson = {
    id: NEXT_LESSON_ID++,
    title,
    date: date || "",
    time: time || "",
    location: location || "",
    capacity: Number.isFinite(Number(capacity)) ? Number(capacity) : null,
    createdAt: new Date().toISOString()
  };
  LESSONS.push(newLesson);
  res.status(201).json(newLesson);
});

export default router;
