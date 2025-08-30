// server/routes/dogs.js
import express from "express";
const router = express.Router();

/** In-memory opslag (eenvoudig voor nu) */
export const DOGS = [];
let NEXT_DOG_ID = 1;

/** Helper: hond toevoegen voor klant */
export function addDogForCustomer(customerId, dogInput = {}) {
  const {
    name = "",
    breed = "",
    birthDate = "",
    gender = "",
    vaccStatus = "",
    vetPhone = "",
    vetName = "",
    emergencyPhone = "",
    vaccineBookRef = ""
  } = dogInput;

  const dog = {
    id: NEXT_DOG_ID++,
    customerId: Number(customerId),
    name,
    breed,
    birthDate,
    gender,
    vaccStatus,
    vetPhone,
    vetName,
    emergencyPhone,
    vaccineBookRef
  };
  DOGS.push(dog);
  return dog;
}

/** GET /api/dogs  (optioneel ?customerId=…) */
router.get("/", (req, res) => {
  const { customerId } = req.query;
  if (customerId) {
    return res.json(DOGS.filter(d => d.customerId === Number(customerId)));
  }
  res.json(DOGS);
});

/** POST /api/dogs/:customerId  (alleen hond toevoegen voor bestaande klant) */
router.post("/:customerId", (req, res) => {
  const { customerId } = req.params;
  const dog = addDogForCustomer(customerId, req.body || {});
  res.status(201).json(dog);
});

export default router;
