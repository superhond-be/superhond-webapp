import express from "express";
const router = express.Router();

// Referentie naar klanten-array (ingesteld door setCustomersRef)
let CUSTOMERS_REF = null;
export function setCustomersRef(ref) {
  CUSTOMERS_REF = ref;
}

// In-memory hondenlijst
let DOGS = [];
let NEXT_DOG_ID = 1;

// Alle honden (optioneel filter: ?customerId=...)
router.get("/", (req, res) => {
  const { customerId } = req.query || {};
  if (customerId) {
    const cid = Number(customerId);
    const list = DOGS.filter(d => d.ownerId === cid);
    return res.json(list);
  }
  res.json(DOGS);
});

// Nieuwe hond koppelen aan klant
router.post("/:customerId", (req, res) => {
  if (!CUSTOMERS_REF) {
    return res.status(500).json({ error: "CustomersRef niet gezet" });
  }

  const customerId = Number(req.params.customerId);
  const customer = CUSTOMERS_REF.find(c => c.id === customerId);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  const { name, breed } = req.body || {};
  if (!name) return res.status(400).json({ error: "Hondnaam is verplicht" });

  const dog = {
    id: NEXT_DOG_ID++,
    name,
    breed: breed || "",
    ownerId: customerId,
  };

  DOGS.push(dog);
  customer.dogs = customer.dogs || [];
  customer.dogs.push(dog.id);

  res.status(201).json(dog);
});

export default router;
