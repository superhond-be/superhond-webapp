import express from "express";
import { CUSTOMERS_REF } from "./customers.js";

const router = express.Router();

// alle honden (uit alle klanten)
router.get("/", (_req, res) => {
  const CUSTOMERS = CUSTOMERS_REF.get();
  const dogs = CUSTOMERS.flatMap(c =>
    (c.dogs ?? []).map(d => ({ ...d, ownerId: c.id }))
  );
  res.json(dogs);
});

// hond toevoegen aan een klant
router.post("/:customerId", (req, res) => {
  const CUSTOMERS = CUSTOMERS_REF.get();
  const customerId = Number(req.params.customerId);
  const customer = CUSTOMERS.find(c => c.id === customerId);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  const { name, breed, age } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "Hondenaam is verplicht" });

  const newDog = { id: (customer.dogs?.at(-1)?.id ?? 0) + 1, name, breed, age };
  customer.dogs = customer.dogs ?? [];
  customer.dogs.push(newDog);

  res.status(201).json(newDog);
});

export default router;
