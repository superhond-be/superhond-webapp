import express from "express";
const router = express.Router();

/** Simpele lesdata */
let LESSONS = [
  // { id: 1, name: "Puppy Pack", date: "2025-09-01", trainers:["Sofie"], location:"Dessel" }
];
let NEXT_LESSON_ID = 1;

/** GET /api/lessons */
router.get("/", (_req, res) => {
  const output = LESSONS.slice();
  res.json(output);
});

/** POST /api/lessons */
router.post("/", (req, res) => {
  const { name, date, location, trainers } = req.body || {};
  if (!name || !date) {
    return res.status(400).json({ error: "name and date are required" });
  }
  const lesson = {
    id: NEXT_LESSON_ID++,
    name,
    date,
    location: location || "",
    trainers: Array.isArray(trainers) ? trainers : [],
    createdAt: new Date().toISOString(),
  };
  LESSONS.push(lesson);
  res.status(201).json(lesson);
});

export default router;
