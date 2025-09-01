// server/routes/lessons.js
const express = require("express");
const router = express.Router();

/*
  Lesson = lesmoment:
  { id, date, start, end, lessonType, location, trainers: [string] }
*/
const LESSONS = [];
let NEXT_ID = 1;

// Lijst (optionele filters: lessonType, from, to)
router.get("/", (req, res) => {
  const { lessonType, from, to } = req.query;
  let data = LESSONS;
  if (lessonType) data = data.filter(l => l.lessonType === lessonType);
  if (from) data = data.filter(l => l.date >= from);
  if (to) data = data.filter(l => l.date <= to);
  res.json(data);
});

// Aanmaken
router.post("/", (req, res) => {
  const { date, start, end, lessonType, location, trainers } = req.body || {};
  if (!date || !lessonType) return res.status(400).json({ error: "date and lessonType are required" });
  const lesson = {
    id: NEXT_ID++,
    date, start: start || "", end: end || "",
    lessonType, location: location || "", trainers: Array.isArray(trainers) ? trainers : []
  };
  LESSONS.push(lesson);
  res.status(201).json(lesson);
});

module.exports = router;
