// src/server/routes/customers.js
import express from "express";

export const CUSTOMERS_REF = [];  // in-memory opslag
let NEXT_CUSTOMER_ID = 1;

const router = express.Router();

// Alle klanten
router.get("/", (_req, res) => {
  res.json(CUSTOMERS_REF);
});

// Nieuwe klant
router.post("/", (req, res) => {
  const { name, email, phone } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const customer = {
    id: NEXT_CUSTOMER_ID++,
    name,
    email: email || "",
    phone: phone || "",
  };
  CUSTOMERS_REF.push(customer);
  res.status(201).json(customer);
});

// Klant op id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS_REF.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer);
});

export default router;
