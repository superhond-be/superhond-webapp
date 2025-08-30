// server/routes/customers.js
import express from "express";
import { addDogForCustomer, DOGS } from "./dogs.js"; // geen cirkel (dogs importeert niets van customers)
const router = express.Router();

/** In-memory opslag (eenvoudig voor nu) */
export const CUSTOMERS = [];
let NEXT_CUSTOMER_ID = 1;

/** Helper: klant toevoegen */
export function addCustomer(input = {}) {
  const { name = "", email = "", phone = "" } = input;
  const customer = {
    id: NEXT_CUSTOMER_ID++,
    name,
    email,
    phone
  };
  CUSTOMERS.push(customer);
  return customer;
}

/** GET /api/customers */
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

/**
 * POST /api/customers
 * Body:
 * {
 *   "customer": { name, email, phone },
 *   "dog": { name, breed, birthDate, gender, vaccStatus, vetPhone, vetName, emergencyPhone, vaccineBookRef }
 * }
 * → maakt klant, en indien "dog" aanwezig is, koppel hond aan klant
 */
router.post("/", (req, res) => {
  const { customer: customerInput = {}, dog: dogInput = null } = req.body || {};

  if (!customerInput.name?.trim()) {
    return res.status(400).json({ error: "Klantnaam is verplicht." });
  }

  const customer = addCustomer(customerInput);
  let dog = null;

  if (dogInput && Object.keys(dogInput).length > 0) {
    dog = addDogForCustomer(customer.id, dogInput);
  }

  res.status(201).json({ customer, dog });
});

/** (optioneel) GET /api/customers/:id/dogs — alle honden van een klant */
router.get("/:id/dogs", (req, res) => {
  const id = Number(req.params.id);
  const list = DOGS.filter(d => d.customerId === id);
  res.json(list);
});

export default router;
