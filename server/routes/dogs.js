import express from "express";
import { CUSTOMERS } from "./customers.js"; // we gebruiken de klanten-lijst om honden te koppelen
const router = express.Router();


import express from "express";
import { store } from "../data/store.js";

const router = express.Router();

// Alle honden
router.get("/", (_req, res) => {
  res.json(store.dogs);
});

// Hond toevoegen aan een klant
router.post("/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const customer = store.customers.find(c => c.id === customerId);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  const { name, breed } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam hond is verplicht" });

  const dog = {
    id: store.nextDogId++,
    customerId,
    name,
    breed: breed || "",
  };

  store.dogs.push(dog);
  if (!customer.dogs) customer.dogs = [];
  customer.dogs.push(dog.id);

  res.status(201).json(dog);
});






// Honden-ID teller per klant houden we simpel in memory:
let DOG_SEQ = 1;

// == Alle honden (vlak) ==
router.get("/", (_req, res) => {
  const allDogs = CUSTOMERS.flatMap(c =>
    (c.dogs || []).map(d => ({ ...d, customerId: c.id, owner: c.name }))
  );
  res.json(allDogs);
});

// == Honden van één klant ==
router.get("/by-customer/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const customer = CUSTOMERS.find(c => c.id === customerId);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer.dogs || []);
});

// == Hond toevoegen aan klant ==
router.post("/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const customer = CUSTOMERS.find(c => c.id === customerId);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  const { name, breed } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam van de hond is verplicht" });

  if (!customer.dogs) customer.dogs = [];
  const newDog = { id: DOG_SEQ++, name, breed: breed || "" };
  customer.dogs.push(newDog);

  res.status(201).json(newDog);
});

// == Hond verwijderen bij klant ==
router.delete("/:customerId/:dogId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const dogId = Number(req.params.dogId);
  const customer = CUSTOMERS.find(c => c.id === customerId);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  const before = (customer.dogs || []).length;
  customer.dogs = (customer.dogs || []).filter(d => d.id !== dogId);
  if (customer.dogs.length === before) {
    return res.status(404).json({ error: "Hond niet gevonden" });
  }
  res.status(204).end();
});

export default router;
