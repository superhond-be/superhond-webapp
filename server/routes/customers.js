// server/routes/customers.js
import express from "express";

const router = express.Router();

/**
 * In-memory opslag (reset bij herstart)
 * customers: [{ id, name, email, phone, dogs:[{...}], passes:[{...}] }]
 * pass: { id, type, totalStrips, usedStrips, dogId|null }
 */
let customers = [];
let customerIdCounter = 1;
let dogIdCounter = 1;
let passIdCounter = 1;

/* -------------------- Helpers -------------------- */
const nowISO = () => new Date().toISOString();

function remainingOf(pass) {
  return Math.max(0, Number(pass.totalStrips || 0) - Number(pass.usedStrips || 0));
}

function toCustomerDTO(c) {
  // handige vorm met remaining
  return {
    ...c,
    dogs: c.dogs || [],
    passes: (c.passes || []).map(p => ({ ...p, remaining: remainingOf(p) })),
    updatedAt: c.updatedAt || nowISO(),
  };
}

function findCustomer(id) {
  return customers.find(c => String(c.id) === String(id));
}

/* -------------------- Seed data -------------------- */
function seedData() {
  customers = [];
  customerIdCounter = 1;
  dogIdCounter = 1;
  passIdCounter = 1;

  const jan = {
    id: customerIdCounter++,
    name: "Jan Jansen",
    email: "jan@example.com",
    phone: "0470 00 00 00",
    dogs: [],
    passes: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  jan.dogs.push({
    id: dogIdCounter++,
    name: "Rex",
    breed: "Labrador",
    sex: "reu",
    birthdate: "2024-05-10",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  });
  jan.passes.push({
    id: passIdCounter++,
    type: "Puppycursus",
    totalStrips: 9,
    usedStrips: 2,   // nog 7 over
    dogId: jan.dogs[0].id,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  });

  const ann = {
    id: customerIdCounter++,
    name: "Ann Peeters",
    email: "ann@example.com",
    phone: "0485 11 22 33",
    dogs: [],
    passes: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  ann.dogs.push({
    id: dogIdCounter++,
    name: "Luna",
    breed: "Border Collie",
    sex: "teef",
    birthdate: "2023-11-20",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  });
  ann.passes.push({
    id: passIdCounter++,
    type: "Pubertraining",
    totalStrips: 8,
    usedStrips: 0,   // nog 8 over
    dogId: ann.dogs[0].id,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  });

  customers.push(jan, ann);
}

// auto-seed bij lege lijst (alleen bij opstart of herstart)
if (customers.length === 0) {
  seedData();
}

/* -------------------- Dev/seed endpoint -------------------- */
/**
 * POST /api/customers/dev/seed
 * Reset en vul opnieuw met demo-data.
 * (Zet evt. achter een env-secret als je wil)
 */
router.post("/dev/seed", (_req, res) => {
  seedData();
  res.json({ ok: true, customers: customers.map(toCustomerDTO) });
});

/* -------------------- API: Customers -------------------- */

/**
 * GET /api/customers
 * Optioneel: ?q=<zoek> (in name/email/phone)
 */
router.get("/", (req, res) => {
  const { q } = req.query;
  let list = customers;
  if (q && String(q).trim()) {
    const s = String(q).toLowerCase();
    list = list.filter(c =>
      [c.name, c.email, c.phone].filter(Boolean)
        .some(v => String(v).toLowerCase().includes(s))
    );
  }
  res.json(list.map(toCustomerDTO));
});

/**
 * GET /api/customers/:customerId
 */
router.get("/:customerId", (req, res) => {
  const c = findCustomer(req.params.customerId);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(toCustomerDTO(c));
});

/**
 * POST /api/customers/register
 * Body: { name, email, phone }
 */
router.post("/register", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "Naam en e-mail zijn verplicht" });
  }
  const exists = customers.some(c => c.email?.toLowerCase() === String(email).toLowerCase());
  if (exists) return res.status(409).json({ error: "Er bestaat al een klant met dit e-mailadres" });

  const customer = {
    id: customerIdCounter++,
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone || "").trim(),
    dogs: [],
    passes: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  customers.push(customer);
  res.status(201).json(toCustomerDTO(customer));
});

/* -------------------- API: Dogs gekoppeld aan klant -------------------- */

/**
 * POST /api/customers/:customerId/add-dog
 * Body: { name, breed?, birthdate?, sex? }
 */
router.post("/:customerId/add-dog", (req, res) => {
  const c = findCustomer(req.params.customerId);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const { name, breed, birthdate, sex } = req.body || {};
  if (!name) return res.status(400).json({ error: "Naam van de hond is verplicht" });

  const dog = {
    id: dogIdCounter++,
    name: String(name).trim(),
    breed: breed ? String(breed).trim() : "",
    birthdate: birthdate ? String(birthdate).trim() : "",
    sex: sex ? String(sex).trim() : "",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  c.dogs.push(dog);
  c.updatedAt = nowISO();
  res.status(201).json(dog);
});

/* -------------------- API: Strippenkaarten gekoppeld aan klant -------------------- */

/**
 * POST /api/customers/:customerId/add-pass
 * Body: { type, totalStrips, dogId? }
 */
router.post("/:customerId/add-pass", (req, res) => {
  const c = findCustomer(req.params.customerId);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const { type, totalStrips, dogId } = req.body || {};
  if (!type || totalStrips == null) {
    return res.status(400).json({ error: "type en totalStrips zijn verplicht" });
  }
  if (dogId) {
    const dog = (c.dogs || []).find(d => String(d.id) === String(dogId));
    if (!dog) return res.status(400).json({ error: "dogId hoort niet bij deze klant" });
  }

  const pass = {
    id: passIdCounter++,
    type: String(type).trim(),
    totalStrips: Number(totalStrips),
    usedStrips: 0,
    dogId: dogId ? Number(dogId) : null,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  c.passes.push(pass);
  c.updatedAt = nowISO();
  res.status(201).json({ ...pass, remaining: remainingOf(pass) });
});

/**
 * POST /api/customers/:customerId/use-strip/:passId
 * Verbruikt 1 strip op een kaart.
 */
router.post("/:customerId/use-strip/:passId", (req, res) => {
  const c = findCustomer(req.params.customerId);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const pass = (c.passes || []).find(p => String(p.id) === String(req.params.passId));
  if (!pass) return res.status(404).json({ error: "Strippenkaart niet gevonden" });

  if (pass.usedStrips >= pass.totalStrips) {
    return res.status(400).json({ error: "Geen strippen meer beschikbaar" });
  }

  pass.usedStrips += 1;
  pass.updatedAt = nowISO();
  c.updatedAt = nowISO();
  res.json({ ok: true, pass: { ...pass, remaining: remainingOf(pass) } });
});
/* -------------------- Einde routes -------------------- */

export default router;
