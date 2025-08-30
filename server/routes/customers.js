// server/routes/customers.js
import express from "express";
const router = express.Router();

// ---- In-memory opslag (simpel & consistent) ----
let NEXT_CUSTOMER_ID = 2;

/** Demo-klant zodat de UI iets heeft om te tonen */
const CUSTOMERS = [
  {
    id: 1,
    name: "Demo Klant",
    email: "demo@example.com",
    phone: "",
    dogs: [],
    passes: [], // strippenkaarten
  },
];

// ---- Helpers (ook exporteren voor andere routers) ----
export const getCustomers = () => CUSTOMERS;

export const findCustomer = (id) =>
  CUSTOMERS.find((c) => c.id === Number(id));

export function addCustomer({ name, email, phone }) {
  if (!name) throw new Error("Naam is verplicht");
  const customer = {
    id: NEXT_CUSTOMER_ID++,
    name,
    email: email || "",
    phone: phone || "",
    dogs: [],
    passes: [],
  };
  CUSTOMERS.push(customer);
  return customer;
}

// ---- Routes ----

// Lijst klanten
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

// Eén klant
router.get("/:id", (req, res) => {
  const c = findCustomer(req.params.id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(c);
});

// Nieuwe klant
router.post("/", (req, res) => {
  try {
    const { name, email, phone } = req.body || {};
    const created = addCustomer({ name, email, phone });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: String(e.message || e) });
  }
});

export default router;
