// server/routes/dogs.js
import express from "express";
const router = express.Router();

// In-memory opslag
let DOGS = [];
let NEXT_DOG_ID = 1;

// Referentie naar CUSTOMERS array (wordt later ingesteld)
let CUSTOMERS_REF = null;

// Functie om de referentie te zetten
export function setCustomersRef(ref) {
  CUSTOMERS_REF = ref;
}

// Alle honden ophalen, optioneel gefilterd per klant
router.get("/", (req, res) => {
  const { customerId } = req.query;
  let result = DOGS;
  if (customerId) {
    result = DOGS.filter(d => d.customerId == customerId);
  }
  res.json(result);
});

// Nieuwe hond toevoegen aan klant
router.post("/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const customer = CUSTOMERS_REF?.find(c => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }

  const { name, breed, birthdate, gender } = req.body;
  const newDog = {
    id: NEXT_DOG_ID++,
    name,
    breed,
    birthdate,
    gender,
    customerId
  };

  DOGS.push(newDog);
  if (!customer.dogs) customer.dogs = [];
  customer.dogs.push(newDog.id);

  res.status(201).json(newDog);
});

export default router;
