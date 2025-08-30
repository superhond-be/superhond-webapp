// server/routes/customers.js
import express from "express";
const router = express.Router();

// In-memory klanten
let CUSTOMERS = [];
let NEXT_CUSTOMER_ID = 1;

// Alle klanten
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

// Nieuwe klant (zonder hond) – frontend kan ook klant + hond in 2 stappen doen
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const customer = {
    id: NEXT_CUSTOMER_ID++,
    name,
    email: email || "",
    phone: phone || "",
  };
  CUSTOMERS.push(customer);
  res.status(201).json(customer);
});

export default router;
