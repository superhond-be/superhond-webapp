import express from "express";
const router = express.Router();

// We houden een verwijzing naar CUSTOMERS die door index.js wordt gezet
let CUSTOMERS_REF = null;
export function setCustomersRef(ref) {
  CUSTOMERS_REF = ref;
}

// In-memory honden
let NEXT_DOG_ID = 1;
const DOGS = []; // { id, name, breed, customerId }

// Alle honden (optioneel filter op customerId ?customerId=...)
router.get("/", (req, res) => {
  const { customerId } = req.query || {};
  let list = DOGS;
  if (customerId) {
    const cid = Number(customerId);
    list = DOGS.filter(d => d.customerId === cid);
  }
  res.json(list);
});

// Hond toevoegen aan een klant
router.post("/:customerId", (req, res) => {
  if (!CUSTOMERS_REF) return res.status(500).json({ error: "Customers referentie niet gezet" });

  const customerId = Number(req.params.customerId);
  const customer = CUSTOMERS_REF.find(c => c.id === customerId);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  const { name, breed } = req.body || {};
  if (!name) return res.status(400).json({ error: "Hond naam is verplicht" });

  const newDog = { id: NEXT_DOG_ID++, name, breed: breed || "", customerId };
  DOGS.push(newDog);

  // ook bij de klant opnemen
  customer.dogs = customer.dogs || [];
  customer.dogs.push(newDog);

  res.status(201).json(newDog);
});

export default router;
