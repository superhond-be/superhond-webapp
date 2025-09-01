import express from "express";
const router = express.Router();

// Alle lessen ophalen
router.get("/", (req, res) => {
  res.json([
    { id: 1, date: "2025-09-10", topic: "Puppy training", location: "Retie" },
    { id: 2, date: "2025-09-17", topic: "Gehoorzaamheid", location: "Dessel" }
  ]);
});

// Nieuwe les toevoegen
router.post("/", (req, res) => {
  const { date, topic, location } = req.body;
  if (!date || !topic || !location) {
    return res.status(400).json({ error: "Datum, thema en locatie zijn verplicht" });
  }
  const newLesson = { id: Date.now(), date, topic, location };
  res.status(201).json(newLesson);
});

export default router;
