import express from "express";
const router = express.Router();

let CUSTOMERS = [
  { id: 1, name: "Marie", email: "marie@example.com", phone: "012/34.56.78", dogs: [] },
];

export const CUSTOMERS_REF = {
  get: () => CUSTOMERS,
  set: (v) => (CUSTOMERS = v),
};

// alle klanten
router.get("/", (_req, res) => res.json(CUSTOMERS));

// één klant
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = CUSTOMERS.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(c);
});

// klant aanmaken
router.post("/", (req, res) => {
  const { name, email, phone } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });
  const id = (CUSTOMERS.at(-1)?.id ?? 0) + 1;
  const customer = { id, name, email, phone, dogs: [] };
  CUSTOMERS.push(customer);
  res.status(201).json(customer);
});

export default router;
