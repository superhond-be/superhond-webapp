import express from "express";
const router = express.Router();

// In-memory honden
let DOGS = [];
let NEXT_DOG_ID = 1;

// Referentie naar klanten (wordt ingesteld in index.js via setCustomersRef)
let CUSTOMERS_REF = null;
export function setCustomersRef(ref) {
  CUSTOMERS_REF = ref;
}

// Alle honden (optioneel filteren per klant)
router.get("/", (req, res) => {
  const { customerId } = req.query;
  let result = DOGS;

  if (customerId) {
    result = DOGS.filter(d => d.ownerId == customerId);
  }

  res.json(result);
});

// Hond koppelen aan klant
router.post("/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const customer = CUSTOMERS_REF?.find(c => c.id === customerId);

  if (!customer) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }

  const { name, breed } = req.body;
  const newDog = {
    id: NEXT_DOG_ID++,
    name,
    breed: breed || "",
    ownerId: customerId
  };

  DOGS.push(newDog);
  res.status(201).json(newDog);
});

export default router;
