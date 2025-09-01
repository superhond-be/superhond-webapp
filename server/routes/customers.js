// server/routes/customers.js
import express from "express";
const router = express.Router();

// In-memory opslag (later kan dit vervangen worden door database)
let CUSTOMERS = [];
let NEXT_ID = 1;

/**
 * GET /api/customers?q=...
 * → Alle klanten ophalen (optioneel filteren met querystring)
 */
router.get("/", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  const result = !q
    ? CUSTOMERS
    : CUSTOMERS.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
  res.json(result);
});

/**
 * GET /api/customers/:id
 * → Eén klant ophalen
 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = CUSTOMERS.find((c) => c.id === id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json(customer);
});

/**
 * POST /api/customers
 * body: { name, email?, phone? }
 * → Nieuwe klant aanmaken
 */
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: "Name is required" });

  const customer = {
    id: NEXT_ID++,
    name,
    email: email || "",
    phone: phone || "",
    dogs: [],     // gekoppelde honden
    passes: [],   // strippenkaarten
    createdAt: new Date().toISOString(),
  };

  CUSTOMERS.push(customer);
  res.status(201).json(customer);
});

/**
 * POST /api/customers/:id/dogs
 * body: { dogId }
 * → Hond koppelen aan klant
 */
router.post("/:id/dogs", (req, res) => {
  const id = Number(req.params.id);
  const { dogId } = req.body || {};
  const customer = CUSTOMERS.find((c) => c.id === id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  if (!dogId) return res.status(400).json({ error: "dogId is required" });

  if (!customer.dogs.includes(dogId)) customer.dogs.push(dogId);
  res.json(customer);
});

/**
 * POST /api/customers/:id/passes
 * body: { lessonType, total }
 * → Strippenkaart koppelen aan klant
 */
router.post("/:id/passes", (req, res) => {
  const id = Number(req.params.id);
  const { lessonType, total } = req.body || {};
  const customer = CUSTOMERS.find((c) => c.id === id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  if (!lessonType || !total) {
    return res.status(400).json({ error: "lessonType and total required" });
  }

  const pass = {
    id: `${id}-${Date.now()}`,
    lessonType,
    total: Number(total),
    used: 0,
    createdAt: new Date().toISOString(),
  };

  customer.passes.push(pass);
  res.status(201).json(pass);
});

export default router;
