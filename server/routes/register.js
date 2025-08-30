// server/routes/register.js
import express from "express";
import { CUSTOMERS, addCustomer } from "./customers.js";
import { DOGS, createDogForCustomer } from "./dogs.js";

const router = express.Router();

/**
 * POST /api/register
 * Body: {
 *   customer: { name, email?, phone? },
 *   dog: {
 *     name, breed?, birthDate?, sex?,
 *     vaccinationStatus?, vaccinationBookRef?,
 *     vetName?, vetPhone?, emergencyContact?
 *   }
 * }
 * Resultaat: { customer, dog }
 */
router.post("/", (req, res) => {
  const { customer, dog } = req.body || {};
  if (!customer?.name) return res.status(400).json({ error: "Klantnaam is verplicht" });
  if (!dog?.name) return res.status(400).json({ error: "Hondnaam is verplicht" });

  // 1) klant aanmaken
  const newCustomer = addCustomer({
    name: String(customer.name),
    email: customer.email ? String(customer.email) : "",
    phone: customer.phone ? String(customer.phone) : ""
  });

  // 2) hond koppelen aan klant
  const newDog = createDogForCustomer(newCustomer.id, {
    name: String(dog.name),
    breed: dog.breed ? String(dog.breed) : "",
    birthDate: dog.birthDate ? String(dog.birthDate) : "",
    sex: dog.sex ? String(dog.sex) : "",
    vaccinationStatus: dog.vaccinationStatus ? String(dog.vaccinationStatus) : "",
    vaccinationBookRef: dog.vaccinationBookRef ? String(dog.vaccinationBookRef) : "",
    vetName: dog.vetName ? String(dog.vetName) : "",
    vetPhone: dog.vetPhone ? String(dog.vetPhone) : "",
    emergencyContact: dog.emergencyContact ? String(dog.emergencyContact) : ""
  });

  return res.status(201).json({ customer: newCustomer, dog: newDog });
});

export default router;
