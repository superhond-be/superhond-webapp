import express from "express";
import { CUSTOMERS } from "./customers.js";

const router = express.Router();

// Alle honden van een klant ophalen
router.get("/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const customer = CUSTOMERS.find(c => c.id === customerId);

  if (!customer) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }

  res.json(customer.dogs || []);
});

// Alle honden (van alle klanten)
router.get("/", (_req, res) => {
  const dogs = CUSTOMERS.flatMap(c =>
    (c.dogs || []).map(d => ({ ...d, ownerId: c.id }))
  );
  res.json(dogs);
});

// Nieuwe hond koppelen aan klant
router.post("/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const customer = CUSTOMERS.find(c => c.id === customerId);

  if (!customer) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }

  const { name, breed } = req.body;
  if (!name) return res.status(400).json({ error: "Naam hond is verplicht" });

  const newDog = {
    id: (customer.dogs?.length || 0) + 1,
    name,
    breed: breed || ""
  };

  if (!customer.dogs) {
    customer.dogs = [];
  }
  customer.dogs.push(newDog);

  res.status(201).json(newDog);
});
// Hond verwijderen bij klant
router.delete("/:customerId/:dogId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const dogId = Number(req.params.dogId);

  const customer = CUSTOMERS.find(c => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }

  if (!customer.dogs) {
    return res.status(404).json({ error: "Geen honden gevonden voor deze klant" });
  }

  const index = customer.dogs.findIndex(d => d.id === dogId);
  if (index === -1) {
    return res.status(404).json({ error: "Hond niet gevonden" });
  }

  // Hond verwijderen
  customer.dogs.splice(index, 1);

  res.json({ success: true, dogs: customer.dogs });
});

export { router as dogsRoutes };
