// server/routes/customers.js
const express = require("express");
const router = express.Router();

// simpele in-memory opslag
const CUSTOMERS = [];
let NEXT_ID = 1;

// Lijst
router.get("/", (req, res) => {
  res.json(CUSTOMERS);
});

// Detail
router.get("/:id", (req, res) => {
  const c = CUSTOMERS.find(x => x.id === Number(req.params.id));
  if (!c) return res.status(404).json({ error: "Customer not found" });
  res.json(c);
});

// Aanmaken
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });
  const customer = { id: NEXT_ID++, name, email: email || "", phone: phone || "" };
  CUSTOMERS.push(customer);
  res.status(201).json(customer);
});

module.exports = router;
