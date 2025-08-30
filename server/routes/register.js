import express from "express";
export const router = express.Router();

// Eenvoudige in-memory stores (delen ze met bestaande routes via globalThis)
globalThis.CUSTOMERS ??= [];
globalThis.DOGS ??= [];
globalThis.NEXT_CUSTOMER_ID ??= 1;
globalThis.NEXT_DOG_ID ??= 1;

/**
 * POST /api/register
 * body: { customer: {...}, dog: {...} }
 * 1) maakt klant aan
 * 2) koppelt hond aan klant
 */
router.post("/", (req, res) => {
  const { customer, dog } = req.body || {};
  if (!customer?.name || !customer?.email) {
    return res.status(400).json({ error: "Klant: naam en e-mail zijn verplicht." });
  }
  if (!dog?.name) {
    return res.status(400).json({ error: "Hond: naam is verplicht." });
  }

  const newCustomer = {
    id: globalThis.NEXT_CUSTOMER_ID++,
    name: String(customer.name),
    email: String(customer.email),
    phone: customer.phone ?? "",
    address: customer.address ?? "",
    dogs: [],
  };
  globalThis.CUSTOMERS.push(newCustomer);

  const newDog = {
    id: globalThis.NEXT_DOG_ID++,
    ownerId: newCustomer.id,
    name: String(dog.name),
    breed: dog.breed ?? "",
    birthdate: dog.birthdate ?? null,
    gender: dog.gender ?? "",
    vaccination_status: dog.vaccination_status ?? "",
    vaccination_book_ref: dog.vaccination_book_ref ?? "",
    vet_phone: dog.vet_phone ?? "",
    emergency_phone: dog.emergency_phone ?? "",
    vet_name: dog.vet_name ?? "",
  };
  globalThis.DOGS.push(newDog);
  newCustomer.dogs.push(newDog);

  return res.status(201).json({ customer: newCustomer, dog: newDog });
});

export default router;
