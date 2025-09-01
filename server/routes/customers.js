import express from "express";
const router = express.Router();

// In-memory "database"
let CUSTOMERS = [];
let NEXT_ID = 1;

/**
 * GET /api/customers?q=...
 *  - lijst alle klanten (optioneel filter op naam of e-mail)
 */
router.get("/", (req, res) => {
  const q = (req.query.q || "").toString().toLowerCase();
  const list = !q
    ? CUSTOMERS
    : CUSTOMERS.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q)
      );
  res.json(list);
});

/** GET /api/customers/:id */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = CUSTOMERS.find((c) => c.id === id);
  if (!item) return res.status(404).json({ error: "Customer not found" });
  res.json(item);
});

/**
 * POST /api/customers
 * body: { name, email, phone }
 */
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });

  const customer = {
    id: NEXT_ID++,
    name,
    email: email || "",
    phone: phone || "",
    dogs: [],                    // array met dogIds
    passes: [],                  // [{ id, lessonType, total, used }]
    createdAt: new Date().toISOString(),
  };
  CUSTOMERS.push(customer);
  res.status(201).json(customer);
});

/**
 * POST /api/customers/:id/dogs
 * body: { dogId }
 */
router.post("/:id/dogs", (req, res) => {
  const id = Number(req.params.id);
  const { dogId } = req.body || {};
  const customer = CUSTOMERS.find((c) => c.id === id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  if (!Number.isFinite(dogId)) {
    return res.status(400).json({ error: "dogId is required" });
  }
  if (!customer.dogs.includes(dogId)) customer.dogs.push(dogId);
  res.json(customer);
});

/**
 * POST /api/customers/:id/passes
 * body: { lessonType, total }
 */
router.post("/:id/passes", (req, res) => {
  const id = Number(req.params.id);
  const { lessonType, total } = req.body || {};
  const customer = CUSTOMERS.find((c) => c.id === id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  if (!lessonType || !Number.isFinite(total) || total <= 0) {
    return res.status(400).json({ error: "lessonType and positive total required" });
  }
  const pass = {
    id: `${id}-${Date.now()}`,
    lessonType,
    total,
    used: 0,
    createdAt: new Date().toISOString(),
  };
  customer.passes.push(pass);
  res.status(201).json(pass);
});

export default router;
