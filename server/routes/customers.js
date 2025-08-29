import express from "express";
const router = express.Router();

let CUSTOMERS = [];
let NEXT_CUSTOMER_ID = 1;

// Alle klanten
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

// Eén klant
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const includeDogs = req.query.withDogs === "1";
  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  if (!includeDogs) return res.json(customer);
  res.json({ ...customer, dogs: customer.dogs || [] });
});

// Nieuwe klant
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: "Naam is verplicht" });

  const newCustomer = {
    id: NEXT_CUSTOMER_ID++,
    name: name.trim(),
    email: email || "",
    phone: phone || "",
    dogs: []
  };
  CUSTOMERS.push(newCustomer);
  res.status(201).json(newCustomer);
});
// voorbeeld sessie-object
{
  id: 1,
  classId: 1,
  date: "2025-09-10T09:00:00",
  location: "Retie",
  capacity: 10   // max aantal deelnemers
}

export { CUSTOMERS };
export default router;
