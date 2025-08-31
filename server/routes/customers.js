// server/routes/customers.js
import express from "express";

const router = express.Router();

/**
 * In-memory klanten (kan later naar DB)
 * Let op: we exporteren de array-referentie via CUSTOMERS_REF zodat andere modules
 * (bv. dogs.js) dezelfde referentie gebruiken.
 */
let NEXT_CUSTOMER_ID = 2;

const CUSTOMERS = [
  {
    id: 1,
    name: "Demo Klant",
    email: "demo@example.com",
    phone: "000/00.00.00",
    emergencyPhone: "",
    vetName: "",
    vetPhone: ""
  }
];

// Belangrijke export: gedeelde referentie (NIET her-assignen, wel muteren)
export const CUSTOMERS_REF = CUSTOMERS;

/** Eventueel nuttig voor seeding of testen vanuit elders */
export function addCustomer(cust) {
  const id = NEXT_CUSTOMER_ID++;
  const customer = { id, ...cust };
  CUSTOMERS.push(customer);
  return customer;
}

/** Kleine helper voor lokale fetches */
async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fetch ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

/**
 * GET /api/customers
 * Optionele query:
 *   - q: vrije tekst (match op name/email/phone)
 *   - id: exact id (handig voor snel lookup)
 */
router.get("/", (req, res) => {
  const { q, id } = req.query;

  if (id) {
    const num = Number(id);
    const found = CUSTOMERS.find(c => c.id === num);
    return res.json(found ? [found] : []);
  }

  if (!q) return res.json(CUSTOMERS);

  const needle = String(q).toLowerCase();
  const out = CUSTOMERS.filter(c =>
    [c.name, c.email, c.phone]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(needle))
  );
  res.json(out);
});

/**
 * GET /api/customers/:id
 * Eén klant ophalen.
 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(customer);
});

/**
 * POST /api/customers
 * Body: { name, email, phone, emergencyPhone, vetName, vetPhone }
 * (Koppeling van honden/lessen/strippenkaarten gebeurt in hun eigen routes.)
 */
router.post("/", (req, res) => {
  const { name, email, phone, emergencyPhone, vetName, vetPhone } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: "Naam en e-mail zijn verplicht" });
  }

  const exists = CUSTOMERS.some(c => c.email && email && c.email.toLowerCase() === String(email).toLowerCase());
  if (exists) {
    return res.status(409).json({ error: "Er bestaat al een klant met dit e-mailadres" });
  }

  const created = addCustomer({
    name: String(name).trim(),
    email: String(email).trim(),
    phone: phone || "",
    emergencyPhone: emergencyPhone || "",
    vetName: vetName || "",
    vetPhone: vetPhone || ""
  });

  res.status(201).json(created);
});

/**
 * GET /api/customers/:id/summary
 * Samenvatting met gekoppelde data uit andere endpoints:
 *  - /api/dogs?ownerId=:id
 *  - /api/passes?customerId=:id
 *  - /api/lessons?customerId=:id[&dogId=:dogId]
 *
 * Optionele query:
 *  - dogId: filter lessen op hond
 */
router.get("/:id/summary", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const customer = CUSTOMERS.find(c => c.id === id);
    if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

    const { dogId } = req.query;

    // Base URL leeg laten: we roepen dezelfde service aan.
    const base = "";

    const [dogs, passes, lessons] = await Promise.all([
      getJSON(`${base}/api/dogs?ownerId=${encodeURIComponent(id)}`),
      getJSON(`${base}/api/passes?customerId=${encodeURIComponent(id)}`),
      getJSON(
        `${base}/api/lessons?customerId=${encodeURIComponent(id)}${
          dogId ? `&dogId=${encodeURIComponent(dogId)}` : ""
        }`
      )
    ]);

    res.json({ customer, dogs, passes, lessons });
  } catch (e) {
    res.status(500).json({
      error: "Kon klantenoverzicht niet laden",
      details: String(e?.message || e)
    });
  }
});

export default router;
