import express from "express";
const router = express.Router();

let DOGS = [];
let NEXT_DOG_ID = 1;

// Referentie naar klanten-array
let CUSTOMERS_REF = null;
export function setCustomersRef(ref) { CUSTOMERS_REF = ref; }

// Alle honden
router.get("/", (req, res) => {
  const { customerId } = req.query;
  const list = customerId ? DOGS.filter(d => d.ownerId === Number(customerId)) : DOGS;
  res.json(list);
});

// Hond toevoegen aan klant
router.post("/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  if (!CUSTOMERS_REF) return res.status(500).json({ error: "CUSTOMERS_REF niet gezet" });

  const customer = CUSTOMERS_REF.find(c => c.id === customerId);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  const { name, breed } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: "Hondnaam is verplicht" });

  const newDog = {
    id: NEXT_DOG_ID++,
    name: name.trim(),
    breed: breed || "",
    ownerId: customerId
  };

  DOGS.push(newDog);
  customer.dogs = customer.dogs || [];
  customer.dogs.push(newDog);

  res.status(201).json(newDog);
});

export default router;
