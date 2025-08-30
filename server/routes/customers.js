import express from "express";
const router = express.Router();

// in-memory store
let CUSTOMERS = [
  { id: 1, name: "Demo Klant", email: "demo@example.com", phone: "000/00.00.00" }
];
let NEXT_CUSTOMER_ID = 2;

export const getCustomersRef = () => CUSTOMERS;

// lijst klanten
router.get("/", (_req, res) => res.json(CUSTOMERS));

// detail klant (+honden optioneel via query ?withDogs=1)
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = CUSTOMERS.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(c);
});

// nieuwe klant
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });
  const created = { id: NEXT_CUSTOMER_ID++, name, email: email || "", phone: phone || "" };
  CUSTOMERS.push(created);
  res.status(201).json(created);
});

export default router;
