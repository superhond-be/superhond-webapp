// server/routes/lessons.js
import express from "express";
const router = express.Router();

// Tijdelijke in-memory data (kan later naar DB)
let LESSONS = [
  { id: 1, name: "Puppycursus", description: "Basis training voor pups" },
  { id: 2, name: "Gehoorzaamheid 1", description: "Beginnende gehoorzaamheid" },
  { id: 3, name: "Gehoorzaamheid 2", description: "Vervolg op niveau 1" }
];

// Alle lessen ophalen
router.get("/", (_req, res) => {
  res.json(LESSONS);
});

// Nieuwe les toevoegen
router.post("/", (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Naam van les is verplicht" });
  }
  const newLesson = {
    id: LESSONS.length + 1,
    name,
    description: description || ""
  };
  LESSONS.push(newLesson);
  res.status(201).json(newLesson);
});

// Les verwijderen
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  LESSONS = LESSONS.filter(l => l.id !== id);
  res.json({ message: `Les ${id} verwijderd` });
});

export default router;
