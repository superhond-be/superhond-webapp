// server/routes/customers.js
import express from "express";
const router = express.Router();

/**
 * Eenvoudige in-memory opslag.
 * Later kun je dit vervangen door een DB.
 */
let NEXT_CUSTOMER_ID = 2;
let CUSTOMERS = [
  {
    id: 1,
    name: "Demo Klant",
    email: "demo@example.com",
    phone: "000/00.00.00",
    dogs: [], // gekoppelde honden-ids of objecten
  },
];

/** ===== Named helpers (worden elders geïmporteerd) ===== */
export function getAllCustomers() {
  return CUSTOMERS;
}

export function findCustomer(id) {
  const numId = Number(id);
  return CUSTOMERS.find((c) => c.id === numId) || null;
}

export function addCustomer(data) {
  const { name, email, phone } = data || {};
  if (!name) throw new Error("Naam is verplicht");

  const newCustomer = {
    id: NEXT_CUSTOMER_ID++,
    name,
    email: email || "",
    phone: phone || "",
    dogs: [],
  };
  CUSTOMERS.push(newCustomer);
  return newCustomer;
}

/** ===== REST endpoints ===== */
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

router.get("/:id", (req, res) => {
  const c = findCustomer(req.params.id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(c);
});

router.post("/", (req, res) => {
  try {
    const created = addCustomer(req.body || {});
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: String(e.message || e) });
  }
});

// (optioneel) eenvoudige update
router.patch("/:id", (req, res) => {
  const c = findCustomer(req.params.id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const { name, email, phone, dogs } = req.body || {};
  if (name !== undefined) c.name = name;
  if (email !== undefined) c.email = email;
  if (phone !== undefined) c.phone = phone;
  if (Array.isArray(dogs)) c.dogs = dogs;

  res.json(c);
});

export default router;
