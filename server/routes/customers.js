import { Router } from "express";
import { assignInitialPasses, listPassesForCustomer, getPassCountForLessonType } from "./passes.js";

const router = Router();

// In-memory klanten & honden
// klant: { id, name, email, phone }
// hond:  { id, customerId, name, breed, birthDate, gender, vetPhone, vetName, vaccineStatus, bookletRef, emergency }
let CUSTOMERS = [];
let DOGS = [];
let NEXT_CUSTOMER_ID = 1;
let NEXT_DOG_ID = 1;

// Alle klanten (met honden en strippen)
router.get("/", (_req, res) => {
  const data = CUSTOMERS.map(c => ({
    ...c,
    dogs: DOGS.filter(d => d.customerId === c.id),
    passes: listPassesForCustomer(c.id),
  }));
  res.json(data);
});

// Eén klant detail
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = CUSTOMERS.find(k => k.id === id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json({
    ...c,
    dogs: DOGS.filter(d => d.customerId === id),
    passes: listPassesForCustomer(id),
  });
});

// Registreren: klant + (optioneel) hond + (optioneel) lestype => strippenkaart
router.post("/", (req, res) => {
  const { customer, dog, lessonType } = req.body || {};

  if (!customer?.name) return res.status(400).json({ error: "Klantnaam is verplicht" });

  const newCustomer = {
    id: NEXT_CUSTOMER_ID++,
    name: customer.name ?? "",
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    createdAt: new Date().toISOString(),
  };
  CUSTOMERS.push(newCustomer);

  let newDog = null;
  if (dog?.name) {
    newDog = {
      id: NEXT_DOG_ID++,
      customerId: newCustomer.id,
      name: dog.name ?? "",
      breed: dog.breed ?? "",
      birthDate: dog.birthDate ?? "",
      gender: dog.gender ?? "-",
      vetPhone: dog.vetPhone ?? "",
      vetName: dog.vetName ?? "",
      vaccineStatus: dog.vaccineStatus ?? "",
      bookletRef: dog.bookletRef ?? "",
      emergency: dog.emergency ?? "",
      createdAt: new Date().toISOString(),
    };
    DOGS.push(newDog);
  }

  let pass = null;
  if (lessonType) {
    const total = getPassCountForLessonType(lessonType);
    if (total > 0) {
      pass = assignInitialPasses(newCustomer.id, lessonType);
    }
  }

  return res.status(201).json({
    customer: newCustomer,
    dog: newDog,
    pass,
  });
});

// Hond toevoegen aan bestaande klant
router.post("/:customerId/dogs", (req, res) => {
  const customerId = Number(req.params.customerId);
  const cust = CUSTOMERS.find(c => c.id === customerId);
  if (!cust) return res.status(404).json({ error: "Klant niet gevonden" });

  const d = req.body?.dog || {};
  if (!d.name) return res.status(400).json({ error: "Naam hond is verplicht" });

  const newDog = {
    id: NEXT_DOG_ID++,
    customerId,
    name: d.name ?? "",
    breed: d.breed ?? "",
    birthDate: d.birthDate ?? "",
    gender: d.gender ?? "-",
    vetPhone: d.vetPhone ?? "",
    vetName: d.vetName ?? "",
    vaccineStatus: d.vaccineStatus ?? "",
    bookletRef: d.bookletRef ?? "",
    emergency: d.emergency ?? "",
    createdAt: new Date().toISOString(),
  };
  DOGS.push(newDog);
  res.status(201).json(newDog);
});

// (optioneel) reset endpoint voor testen
router.post("/__reset", (_req, res) => {
  CUSTOMERS = [];
  DOGS = [];
  res.json({ ok: true });
});

export default router;
