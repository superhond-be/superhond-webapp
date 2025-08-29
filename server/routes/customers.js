import express from "express";
const router = express.Router();

// >>> Slechts één keer declareren! <<<
let CUSTOMERS = [
  { id: 1, name: "Marie", email: "marie@example.com", phone: "012/34.56.78", dogs: [] },
];

// Optioneel: eenvoudige "ref" export om dezelfde array in andere routers te gebruiken (bv. dogs.js)
export const CUSTOMERS_REF = { get: () => CUSTOMERS, set: (v) => (CUSTOMERS = v) };

/** Alle klanten */
router.get("/", (_req, res) => {
  res.json(CUSTOMERS.map(c => ({ ...c, dogs: c.dogs ?? [] })));
});

/** Eén klant */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = CUSTOMERS.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json({ ...c, dogs: c.dogs ?? [] });
});

/** Nieuwe klant */
router.post("/", (req, res) => {
  const { name, email, phone } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const id = (CUSTOMERS.at(-1)?.id ?? 0) + 1;
  const newCustomer = { id, name, email, phone, dogs: [] };
  CUSTOMERS.push(newCustomer);
  res.status(201).json(newCustomer);
});

export default router;
