// routes/passes.js
const express = require("express");
const router = express.Router();

let PASSES = [];

// Alle strippenkaarten ophalen
router.get("/", (req, res) => {
  res.json(PASSES);
});

// Nieuwe strippenkaart toevoegen
router.post("/", (req, res) => {
  const pass = req.body;
  PASSES.push(pass);
  res.status(201).json({ message: "✅ Strippenkaart toegevoegd", pass });
});

module.exports = router;
