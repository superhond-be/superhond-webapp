// server/routes/customers.js
import express from "express";
const router = express.Router();

/**
 * Eenvoudige in-memory opslag
 * (later kun je dit vervangen door een DB)
 */
let CUSTOMERS = [
  {
    id: 1,
    name: "Voorbeeld klant",
    email: "klant@example.com",
    phone: "+32 000 00 00 00",
    // honden die aan de klant gekoppeld zijn (optioneel)
    dogs: [],
  },
];

let NEXT_ID = 2;

/**
 * Alle klanten
 * GET /api/customers
 */
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

/**
 * Eén klant opvragen
 * GET /api/customers/:id
 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find((c) => c.id === id);
  if (!customer) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }
  res.json(customer);
});

/**
 * Klant aanmaken
 * POST /api/customers
 * body: { name, email?, phone? }
 */
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: "Naam is verplicht" });
  }

  const newCustomer = {
    id: NEXT_ID++,
    name,
    email: email || "",
    phone: phone || "",
    dogs: [],
  };

  CUSTOMERS.push(newCustomer);
  res.status(201).json(newCustomer);
});

/**
 * Klant bijwerken (deels)
 * PATCH /api/customers/:id
 * body: { name?, email?, phone? }
 */
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find((c) => c.id === id);
  if (!customer) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }

  const { name, email, phone } = req.body || {};
  if (typeof name === "string") customer.name = name;
  if (typeof email === "string") customer.email = email;
  if (typeof phone === "string") customer.phone = phone;

  res.json(customer);
});

/**
 * Klant verwijderen
 * DELETE /api/customers/:id
 */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = CUSTOMERS.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }
  const [removed] = CUSTOMERS.splice(idx, 1);
  res.json(removed);
});

export { CUSTOMERS };
export default router;
