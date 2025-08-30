import express from "express";
import { CUSTOMERS } from "./customers.js";

const router = express.Router();

/** In-memory honden */
export const DOGS = [];
let NEXT_DOG_ID = 1;

/** Alle honden (optioneel filter op customerId: /api/dogs?customerId=3) */
router.get("/", (req, res) => {
  const { customerId } = req.query;
  let list = DOGS;
  if (customerId) {
    const id = Number(customerId);
    list = DOGS.filter(d => d.ownerId === id);
  }
  res.json(list);
});

/** Eén hond */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const dog = DOGS.find(d => d.id === id);
  if (!dog) return res.status(404).json({ error: "Hond niet gevonden" });
  res.json(dog);
});

/** Hond toevoegen én koppelen aan klant */
router.post("/:customerId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const customer = CUSTOMERS.find(c => c.id === customerId);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  const {
    name,
    breed = "",
    birthDate = "",
    sex = "",
    vaxStatus = "",
    bookletRef = "",
    vetName = "",
    vetPhone = "",
    emergencyPhone = ""
  } = req.body ?? {};

  if (!name) return res.status(400).json({ error: "Naam hond is verplicht" });

  const dog = {
    id: NEXT_DOG_ID++,
    ownerId: customerId,
    name,
    breed,
    birthDate,
    sex,
    vaxStatus,
    bookletRef,
    vetName,
    vetPhone,
    emergencyPhone
  };

  DOGS.push(dog);
  if (!Array.isArray(customer.dogs)) customer.dogs = [];
  customer.dogs.push(dog.id);

  res.status(201).json(dog);
});

/** Hond bijwerken */
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const dog = DOGS.find(d => d.id === id);
  if (!dog) return res.status(404).json({ error: "Hond niet gevonden" });

  Object.assign(dog, req.body || {});
  res.json(dog);
});

export default router;
