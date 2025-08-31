// server/routes/customers.js
import express from "express";
const router = express.Router();

// In-memory opslag
let NEXT_CUSTOMER_ID = 2;

// Deze array exporteren we expliciet, zodat index.js hem kan importeren
export const CUSTOMERS_REF = [
  {
    id: 1,
    name: "Demo Klant",
    email: "demo@example.com",
    phone: "000/00.00.00",
    dogs: [],
    passBalance: 0
  }
];

// Helpers
export function getAllCustomers() {
  return CUSTOMERS_REF;
}

export function findCustomer(id) {
  const n = Number(id);
  return CUSTOMERS_REF.find(c => c.id === n) || null;
}

export function addCustomer(data) {
  const { name, email = "", phone = "" } = data || {};
  if (!name) throw new Error("Naam is verplicht");

  const newCustomer = {
    id: NEXT_CUSTOMER_ID++,
    name,
    email,
    phone,
    dogs: [],
    passBalance: 0
  };

  CUSTOMERS_REF.push(newCustomer);
  return newCustomer;
}

// REST endpoints
router.get("/", (_req, res) => res.json(CUSTOMERS_REF));

router.get("/:id", (req, res) => {
  const c = findCustomer(req.params.id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(c);
});

router.post("/", (req, res) => {
  try {
    const nieuw = addCustomer(req.body || {});
    res.status(201).json(nieuw);
  } catch (e) {
    res.status(400).json({ error: String(e.message || e) });
  }
});

router.patch("/:id", (req, res) => {
  const c = findCustomer(req.params.id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const { name, email, phone, passBalance, dogs } = req.body || {};
  if (name !== undefined) c.name = name;
  if (email !== undefined) c.email = email;
  if (phone !== undefined) c.phone = phone;
  if (typeof passBalance === "number") c.passBalance = passBalance;
  if (Array.isArray(dogs)) c.dogs = dogs;

  res.json(c);
});

export default router;
