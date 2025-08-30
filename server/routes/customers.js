import express from "express";
const router = express.Router();

/** In-memory klanten */
export const CUSTOMERS = [];
let NEXT_CUSTOMER_ID = 1;

/** Alle klanten */
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

/** Eén klant */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer);
});

/** Klant aanmaken */
router.post("/", (req, res) => {
  const { name, email = "", phone = "", address = "" } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const customer = {
    id: NEXT_CUSTOMER_ID++,
    name,
    email,
    phone,
    address,
    dogs: [],           // bevat dog-id’s
  };
  CUSTOMERS.push(customer);
  res.status(201).json(customer);
});

/** Klant bijwerken */
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = CUSTOMERS.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const { name, email, phone, address } = req.body ?? {};
  if (name !== undefined) c.name = name;
  if (email !== undefined) c.email = email;
  if (phone !== undefined) c.phone = phone;
  if (address !== undefined) c.address = address;

  res.json(c);
});

export default router;
