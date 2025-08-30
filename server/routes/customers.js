// server/routes/customers.js
import express from "express";
const router = express.Router();

// In-memory klanten
let CUSTOMERS = [];
let NEXT_ID = 1;

// Alle klanten
router.get("/", (req, res) => {
  res.json(CUSTOMERS);
});

// Één klant
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = CUSTOMERS.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(c);
});

// Nieuwe klant
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const newCustomer = {
    id: NEXT_ID++,
    name,
    email: email || "",
    phone: phone || "",
    createdAt: new Date().toISOString()
  };
  CUSTOMERS.push(newCustomer);
  res.status(201).json(newCustomer);
});

export default router;
