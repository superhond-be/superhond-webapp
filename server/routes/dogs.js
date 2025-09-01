// server/routes/dogs.js
const express = require("express");
const router = express.Router();

const DOGS = [];
let NEXT_ID = 1;

// Lijst (optioneel filteren op customerId: /api/dogs?customerId=1)
router.get("/", (req, res) => {
  const { customerId } = req.query;
  if (customerId) return res.json(DOGS.filter(d => String(d.customerId) === String(customerId)));
  res.json(DOGS);
});

// Aanmaken
router.post("/", (req, res) => {
  const { name, breed, gender, customerId } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });
  const dog = {
    id: NEXT_ID++,
    name,
    breed: breed || "",
    gender: gender || "",
    customerId: customerId ? Number(customerId) : null
  };
  DOGS.push(dog);
  res.status(201).json(dog);
});

module.exports = router;
