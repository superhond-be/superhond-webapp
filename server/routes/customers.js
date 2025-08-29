import express from "express";
const router = express.Router();

// ---- eenvoudige in-memory opslag (vervang later door DB) ----
let CUSTOMERS_SEQ = 1;
let CUSTOMERS = [
  // voorbeeld:
  // { id: 1, name: "Anna", phone: "0470/12.34.56", email: "anna@mail.be", dogs: [ { id: 1, name: "Rex", breed: "Labrador" } ] }
];

// == Alle klanten ==
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

// == Eén klant op ID ==
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer);
});

// == Nieuwe klant ==
router.post("/", (req, res) => {
  const { name, phone, email } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const newCustomer = {
    id: CUSTOMERS_SEQ++,
    name,
    phone: phone || "",
    email: email || "",
    dogs: [] // honden worden hieraan gekoppeld
  };
  CUSTOMERS.push(newCustomer);
  res.status(201).json(newCustomer);
});

// == Klant aanpassen ==
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  const { name, phone, email } = req.body || {};
  if (name !== undefined) customer.name = name;
  if (phone !== undefined) customer.phone = phone;
  if (email !== undefined) customer.email = email;

  res.json(customer);
});

// == Klant verwijderen ==
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = CUSTOMERS.length;
  CUSTOMERS = CUSTOMERS.filter(c => c.id !== id);
  if (CUSTOMERS.length === before) return res.status(404).json({ error: "Klant niet gevonden" });
  res.status(204).end();
});

export default router;
export { CUSTOMERS }; // optioneel: gedeeld met dogs.js
