import express from "express";
const router = express.Router();

// We gebruiken dezelfde in-memory klantenlijst.
// TIP: in een echte app stop je dit in een module/db laag.
import customersRouter from "./customers.js";
let _refToCustomers;
// hackje: we vangen de array op via een setter
export const setCustomersRef = arr => (_refToCustomers = arr);

// Alle honden (optioneel filter op customerId)
router.get("/", (req, res) => {
  const customerId = req.query.customerId ? Number(req.query.customerId) : null;
  const allDogs = (_refToCustomers ?? []).flatMap(c =>
    c.dogs.map(d => ({ ...d, customerId: c.id, customerName: c.name }))
  );
  const out = customerId ? allDogs.filter(d => d.customerId === customerId) : allDogs;
  res.json(out);
});

// Hond toevoegen aan klant
router.post("/", (req, res) => {
  const { customerId, name, breed, birthdate } = req.body ?? {};
  if (!customerId) return res.status(400).json({ error: "customerId is verplicht" });
  if (!name) return res.status(400).json({ error: "Hondnaam is verplicht" });

  const c = (_refToCustomers ?? []).find(x => x.id === Number(customerId));
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const newDog = {
    id: c.dogs.length ? Math.max(...c.dogs.map(d => d.id)) + 1 : 1,
    name,
    breed: breed ?? "",
    birthdate: birthdate ?? ""
  };
  c.dogs.push(newDog);
  res.status(201).json({ ...newDog, customerId: c.id });
});

// Hond bewerken
router.patch("/:customerId/:dogId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const dogId = Number(req.params.dogId);

  const c = (_refToCustomers ?? []).find(x => x.id === customerId);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const d = c.dogs.find(x => x.id === dogId);
  if (!d) return res.status(404).json({ error: "Hond niet gevonden" });

  const { name, breed, birthdate } = req.body ?? {};
  if (name !== undefined) d.name = name;
  if (breed !== undefined) d.breed = breed;
  if (birthdate !== undefined) d.birthdate = birthdate;

  res.json({ ...d, customerId: c.id });
});

// Hond verwijderen
router.delete("/:customerId/:dogId", (req, res) => {
  const customerId = Number(req.params.customerId);
  const dogId = Number(req.params.dogId);

  const c = (_refToCustomers ?? []).find(x => x.id === customerId);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const idx = c.dogs.findIndex(x => x.id === dogId);
  if (idx === -1) return res.status(404).json({ error: "Hond niet gevonden" });

  c.dogs.splice(idx, 1);
  res.status(204).end();
});

export default router;
