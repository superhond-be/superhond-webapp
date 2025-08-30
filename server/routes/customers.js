// server/routes/customers.js
import express from "express";
const router = express.Router();

// In-memory
let NEXT_CUSTOMER_ID = 1;
export const CUSTOMERS = [];

// helper om klant toe te voegen (ook door register-route gebruikt)
export function addCustomer({ name, email = "", phone = "" }) {
  const c = { id: NEXT_CUSTOMER_ID++, name, email, phone, dogs: [] };
  CUSTOMERS.push(c);
  return c;
}

// Voorbeeld startdata (optioneel)
if (CUSTOMERS.length === 0) {
  addCustomer({ name: "Demo Klant", email: "demo@example.com", phone: "000/00.00.00" });
}

// Alle klanten
router.get("/", (_req, res) => res.json(CUSTOMERS));

// Eén klant
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = CUSTOMERS.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(c);
});

// Nieuwe klant (enkel klant, zonder hond)
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });
  const c = addCustomer({ name, email, phone });
  res.status(201).json(c);
});

export default router;
