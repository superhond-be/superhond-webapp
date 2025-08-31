// server/routes/dogs.js
import express from "express";
const router = express.Router();

// Referentie naar klanten (wordt gezet vanuit index.js)
let CUSTOMERS = null;
export function setCustomersRef(ref) { CUSTOMERS = ref; }

// In-memory honden
let NEXT_DOG_ID = 1;
let DOGS = [];

// alle honden (optioneel filter ?customerId=)
router.get("/", (req, res) => {
  const { customerId } = req.query || {};
  const list = customerId ? DOGS.filter(d => d.ownerId === Number(customerId)) : DOGS;
  res.json(list);
});

// hond toevoegen en koppelen aan klant
router.post("/:customerId", (req, res) => {
  if (!CUSTOMERS) return res.status(500).json({ error: "Customers referentie niet ingesteld" });

  const customerId = Number(req.params.customerId);
  const owner = CUSTOMERS.find(c => c.id === customerId);
  if (!owner) return res.status(404).json({ error: "Klant niet gevonden" });

  const {
    name, breed = "", birthDate = "", gender = "-",
    vaccStatus = "", vetPhone = "", vetName = "", emergencyPhone = "", bookRef = ""
  } = req.body || {};

  if (!name) return res.status(400).json({ error: "Naam hond is verplicht" });

  const newDog = {
    id: NEXT_DOG_ID++, ownerId: customerId, name, breed, birthDate, gender,
    vaccStatus, vetPhone, vetName, emergencyPhone, bookRef
  };
  DOGS.push(newDog);
  owner.dogs = owner.dogs || [];
  owner.dogs.push(newDog.id);

  res.status(201).json(newDog);
});

export default router;
