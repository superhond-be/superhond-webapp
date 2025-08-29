import express from "express";

const router = express.Router();

// ---- In-memory klanten (voorbeelddata) ----
export const CUSTOMERS = [
  { id: 1, name: "Marie", email: "marie@example.com", phone: "0470 00 00 01", dogs: [] },
  { id: 2, name: "Jan",   email: "jan@example.com",   phone: "0470 00 00 02", dogs: [] },
];

// ---- Alle klanten ----
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

// ---- Eén klant op id ----
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer);
});

// ---- Klant aanmaken ----
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const id = (CUSTOMERS.at(-1)?.id ?? 0) + 1;
  const newCustomer = { id, name, email: email || "", phone: phone || "", dogs: [] };
  CUSTOMERS.push(newCustomer);
  res.status(201).json(newCustomer);
});

export default router;
