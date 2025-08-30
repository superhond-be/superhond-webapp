import express from "express";
const router = express.Router();

// In-memory data (tijdelijk)
let NEXT_CUSTOMER_ID = 1;
export const CUSTOMERS = [
  { id: NEXT_CUSTOMER_ID++, name: "Demo Klant", email: "demo@example.com", phone: "000/00.00.00", dogs: [] }
];

// Alle klanten
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

// Eén klant
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer);
});

// Nieuwe klant
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });
  const newCustomer = { id: NEXT_CUSTOMER_ID++, name, email: email || "", phone: phone || "", dogs: [] };
  CUSTOMERS.push(newCustomer);
  res.status(201).json(newCustomer);
});

export default router;
