import express from "express";
const router = express.Router();

// In-memory opslag
let CUSTOMERS = [
  { id: 1, name: "Marie", email: "marie@example.com", phone: "012/34.56.78", dogs: [] },
];

// 👉 Hier exporteren we een object met get/set
export const CUSTOMERS_REF = {
  get: () => CUSTOMERS,
  set: (v) => (CUSTOMERS = v)
};

/** Alle klanten ophalen */
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

/** Eén klant ophalen */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer);
});

/** Nieuwe klant toevoegen */
router.post("/", (req, res) => {
  const { name, email, phone } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const id = (CUSTOMERS.at(-1)?.id ?? 0) + 1;
  const newCustomer = { id, name, email, phone, dogs: [] };
  CUSTOMERS.push(newCustomer);

  res.status(201).json(newCustomer);
});

export default router;
