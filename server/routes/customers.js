import express from "express";
const router = express.Router();

// In-memory klantenlijst
let CUSTOMERS = [
  { id: 1, name: "Voorbeeld Klant", email: "test@example.com", phone: "", dogs: [] },
];

let NEXT_ID = CUSTOMERS.length ? Math.max(...CUSTOMERS.map(c => c.id)) + 1 : 1;

// Alle klanten
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

// Eén klant
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer);
});

// Klant aanmaken
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const customer = {
    id: NEXT_ID++,
    name,
    email: email || "",
    phone: phone || "",
    dogs: [],
  };
  CUSTOMERS.push(customer);
  res.status(201).json(customer);
});

export { CUSTOMERS };
export default router;
