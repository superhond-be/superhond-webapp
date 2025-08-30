// server/routes/customers.js
import express from "express";
const router = express.Router();

/**
 * In-memory opslag voor klanten.
 * Wordt gedeeld met andere routes (dogs, passes) via de named export.
 */
export let CUSTOMERS = [
  // voorbeelddata (mag je weghalen)
  // {
  //   id: 1,
  //   name: "Demo Klant",
  //   email: "demo@example.com",
  //   phone: "000/00.00.00",
  //   emergencyPhone: "",
  //   vetName: "",
  //   vetPhone: "",
  //   vaccineStatus: "",
  //   vaccineBookRef: "",
  //   dogs: [],         // honden gekoppeld aan klant
  //   passes: []        // strippenkaarten gekoppeld aan klant
  // }
];

let NEXT_ID = 1;

/** Hulpfunctie om een klant toe te voegen (handig voor seed of andere routes) */
export function addCustomer(data) {
  const customer = {
    id: NEXT_ID++,
    name: data?.name?.trim() || "",
    email: data?.email?.trim() || "",
    phone: data?.phone?.trim() || "",
    emergencyPhone: data?.emergencyPhone?.trim?.() || "",
    vetName: data?.vetName?.trim?.() || "",
    vetPhone: data?.vetPhone?.trim?.() || "",
    vaccineStatus: data?.vaccineStatus?.trim?.() || "",
    vaccineBookRef: data?.vaccineBookRef?.trim?.() || "",
    dogs: Array.isArray(data?.dogs) ? data.dogs : [],
    passes: Array.isArray(data?.passes) ? data.passes : [],
    createdAt: new Date().toISOString()
  };
  CUSTOMERS.push(customer);
  return customer;
}

/** Alle klanten */
router.get("/", (req, res) => {
  res.json(CUSTOMERS);
});

/** Eén klant ophalen */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer);
});

/** Nieuwe klant aanmaken */
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "Naam en e-mail zijn verplicht" });
  }
  const created = addCustomer(req.body);
  res.status(201).json(created);
});

/** Klant updaten */
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = CUSTOMERS.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Klant niet gevonden" });

  const prev = CUSTOMERS[idx];
  const updated = {
    ...prev,
    ...req.body,
    id: prev.id, // id blijft vast
  };
  CUSTOMERS[idx] = updated;
  res.json(updated);
});

/** Klant verwijderen */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = CUSTOMERS.length;
  CUSTOMERS = CUSTOMERS.filter(c => c.id !== id);
  if (CUSTOMERS.length === before) {
    return res.status(404).json({ error: "Klant niet gevonden" });
  }
  res.status(204).send();
});

export default router;
