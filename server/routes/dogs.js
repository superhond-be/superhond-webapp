import express from "express";
const router = express.Router();

// Alle honden ophalen
router.get("/", (req, res) => {
  res.json([
    { id: 1, name: "Bello", breed: "Labrador" },
    { id: 2, name: "Rex", breed: "Herder" }
  ]);
});

// Nieuwe hond toevoegen
router.post("/", (req, res) => {
  const { name, breed } = req.body;
  if (!name || !breed) {
    return res.status(400).json({ error: "Naam en ras zijn verplicht" });
  }
  const newDog = { id: Date.now(), name, breed };
  res.status(201).json(newDog);
});

export default router;
