// server/routes/customers.js
import express from "express";
const router = express.Router();

export const CUSTOMERS = []; // in-memory
let NEXT_ID = 1;

// Alle klanten
router.get("/", (_req, res) => res.json(CUSTOMERS));

// Eén klant
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const found = CUSTOMERS.find(c => c.id === id);
  if (!found) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(found);
});

// Nieuwe klant
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const customer = {
    id: NEXT_ID++,
    name,
    email: email || "",
    phone: phone || "",
    dogs: [],            // lijst met dog-ids
    createdAt: new Date().toISOString(),
  };
  CUSTOMERS.push(customer);
  res.status(201).json(customer);
});

export default router;
