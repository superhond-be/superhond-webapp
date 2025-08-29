import express from "express";
const router = express.Router();

// heel simpele in-memory opslag
let CUSTOMERS = [];
let CUSTOMER_SEQ = 1;

// Alle klanten (optioneel inclusief honden)
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

// Eén klant met honden
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer);
});

// Klant aanmaken
router.post("/", (req, res) => {
  const { name, phone, email } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "Naam is verplicht" });

  const newCustomer = {
    id: CUSTOMER_SEQ++,
    name,
    phone: phone ?? "",
    email: email ?? "",
    dogs: []            // hier koppelen we honden
  };
  CUSTOMERS.push(newCustomer);
  res.status(201).json(newCustomer);
});

// Klant bewerken
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = CUSTOMERS.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const { name, phone, email } = req.body ?? {};
  if (name !== undefined) c.name = name;
  if (phone !== undefined) c.phone = phone;
  if (email !== undefined) c.email = email;

  res.json(c);
});

// Klant verwijderen (incl. honden)
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = CUSTOMERS.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "Klant niet gevonden" });
  CUSTOMERS.splice(idx, 1);
  res.status(204).end();
});
// koppel bestaande routes
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);

// koppel nieuwe routes
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);

let CUSTOMERS = [
  { id: 1, name: "Marie", email: "marie@example.com", phone: "012/34.56.78", dogs: [] },
];
export const CUSTOMERS_REF = { get: () => CUSTOMERS, set: v => (CUSTOMERS = v) };
export const setCustomersRef = (ref) => {
  // optioneel; als je elders de bron-array wil vervangen of delen
};

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


// Geef dogs-route toegang tot de in-memory klantenlijst
// (we halen de referentie uit het customersRoutes-bestand via een simpele hack)
import customersModule from "./routes/customers.js"; // alleen voor types, we hebben de array nodig
// De in-memory array zit in het module closure. Simpelste manier:
// we voegen hieronder éénmalig een klant toe en lezen dan de reference via request 😉
// Maar makkelijker: pas customers.js aan om expliciet te exporteren:

export const _CUSTOMERS_REF = () => CUSTOMERS;
export default router;
