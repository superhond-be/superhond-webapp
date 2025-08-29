import express from "express";
const router = express.Router();

// heel simpele in-memory opslag
let CUSTOMERS = [];
let CUSTOMER_SEQ = 1;

// Alle klanten (optioneel inclusief honden)
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

// Eén klant met honden
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer);
});

// Klant aanmaken
router.post("/", (req, res) => {
  const { name, phone, email } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const newCustomer = {
    id: CUSTOMER_SEQ++,
    name,
    phone: phone ?? "",
    email: email ?? "",
    dogs: []            // hier koppelen we honden
  };
  CUSTOMERS.push(newCustomer);
  res.status(201).json(newCustomer);
});

// Klant bewerken
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = CUSTOMERS.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const { name, phone, email } = req.body ?? {};
  if (name !== undefined) c.name = name;
  if (phone !== undefined) c.phone = phone;
  if (email !== undefined) c.email = email;

  res.json(c);
});

// Klant verwijderen (incl. honden)
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = CUSTOMERS.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "Klant niet gevonden" });
  CUSTOMERS.splice(idx, 1);
  res.status(204).end();
});

export default router;
