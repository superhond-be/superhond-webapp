import express from "express";
import { getCustomersRef } from "./customers.js";

const router = express.Router();

// in-memory
let DOGS = [];
let NEXT_DOG_ID = 1;

// alle honden (optioneel filter ?customerId=)
router.get("/", (req, res) => {
  const { customerId } = req.query;
  let list = DOGS;
  if (customerId) list = list.filter(d => d.ownerId === Number(customerId));
  res.json(list);
});

// hond detail
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const dog = DOGS.find(d => d.id === id);
  if (!dog) return res.status(404).json({ error: "Hond niet gevonden" });
  res.json(dog);
});

// nieuwe hond gekoppeld aan klant
router.post("/:customerId", (req, res) => {
  const customers = getCustomersRef();
  const customerId = Number(req.params.customerId);
  const owner = customers.find(c => c.id === customerId);
  if (!owner) return res.status(404).json({ error: "Klant niet gevonden" });

  const {
    name,
    breed,
    birthDate,
    sex,
    vaccineStatus,
    vetPhone,
    vetName,
    bookletRef,
    emergencyNumber
  } = req.body || {};

  if (!name) return res.status(400).json({ error: "Naam hond is verplicht" });

  const created = {
    id: NEXT_DOG_ID++,
    ownerId: owner.id,
    name,
    breed: breed || "",
    birthDate: birthDate || "",
    sex: sex || "",
    vaccineStatus: vaccineStatus || "",
    vetPhone: vetPhone || "",
    vetName: vetName || "",
    bookletRef: bookletRef || "",
    emergencyNumber: emergencyNumber || ""
  };

  DOGS.push(created);
  res.status(201).json(created);
});

export default router;
