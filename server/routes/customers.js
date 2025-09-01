// routes/customers.js
const express = require("express");
const router = express.Router();

// Voorbeeld data (kan later vervangen worden door DB)
let CUSTOMERS = [];

// Alle klanten ophalen
router.get("/", (req, res) => {
  res.json(CUSTOMERS);
});

// Nieuwe klant toevoegen
router.post("/", (req, res) => {
  const customer = req.body;
  CUSTOMERS.push(customer);
  res.status(201).json({ message: "✅ Klant toegevoegd", customer });
});

// Eén klant zoeken op email
router.get("/:email", (req, res) => {
  const customer = CUSTOMERS.find(c => c.email === req.params.email);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer);
});

module.exports = router;
