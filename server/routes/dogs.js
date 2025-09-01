// routes/dogs.js
const express = require("express");
const router = express.Router();

let DOGS = [];

// Alle honden ophalen
router.get("/", (req, res) => {
  res.json(DOGS);
});

// Nieuwe hond toevoegen
router.post("/", (req, res) => {
  const dog = req.body;
  DOGS.push(dog);
  res.status(201).json({ message: "✅ Hond toegevoegd", dog });
});

module.exports = router;
