// server/routes/customers.js (ESM)
import express from "express";
import { store, nextId } from "../store.js";

const router = express.Router();

/**
 * GET /api/customers
 * Optioneel: ?q=zoekterm  (filtert op name/email/phone)
 */
router.get("/", (req, res) => {
  const q = (req.query.q || "").toString().trim().toLowerCase();
  if (!q) return res.json(store.customers);

  const list = store.customers.filter((c) => {
    const hay = [c.name, c.email, c.phone].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  });
  res.json(list);
});

/** GET /api/customers/:id */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = store.customers.find((x) => x.id === id);
  if (!c) return res.status(404).json({ error: "Customer not found" });
  res.json(c);
});

/**
 * POST /api/customers
 * body: { name, email?, phone?, lessonType? }
 */
router.post("/", (req, res) => {
  const { name, email, phone, lessonType } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });

  const customer = {
    id: nextId(store.customers),
    name: String(name).trim(),
    email: (email || "").trim(),
    phone: (phone || "").trim(),
    lessonType: (lessonType || "").trim(),
    createdAt: new Date().toISOString()
  };
  store.customers.push(customer);
  res.status(201).json(customer);
});

/**
 * PUT /api/customers/:id
 * body: { name?, email?, phone?, lessonType? }
 */
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = store.customers.find((x) => x.id === id);
  if (!c) return res.status(404).json({ error: "Customer not found" });

  const { name, email, phone, lessonType } = req.body || {};
  if (name !== undefined) c.name = String(name).trim();
  if (email !== undefined) c.email = String(email).trim();
  if (phone !== undefined) c.phone = String(phone).trim();
  if (lessonType !== undefined) c.lessonType = String(lessonType).trim();

  res.json(c);
});

/**
 * DELETE /api/customers/:id
 * Verwijdert ook gekoppelde honden & passes (cascade light)
 */
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = store.customers.length;
  store.customers = store.customers.filter((x) => x.id !== id);
  if (store.customers.length === before) {
    return res.status(404).json({ error: "Customer not found" });
  }
  // Cascade: alle honden & passes van deze klant mee verwijderen
  store.dogs = store.dogs.filter((d) => d.ownerId !== id);
  store.passes = store.passes.filter((p) => p.customerId !== id);
  res.json({ message: "Customer + related dogs/passes removed" });
});

/**
 * GET /api/customers/overview/:id
 * Combineert klant + honden + (indien later) passes + placeholders lessons
 */
router.get("/overview/:id", (req, res) => {
  const id = Number(req.params.id);
  const customer = store.customers.find((c) => c.id === id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  const dogs = store.dogs.filter((d) => d.ownerId === id);

  const passes = store.passes
    .filter((p) => p.customerId === id)
    .map((p) => ({
      id: p.id,
      dogId: p.dogId ?? null,
      lessonType: p.lessonType,
      total: p.total,
      used: p.used
    }));

  const lessons = { past: [], future: [] };
  const counters = { pastCount: 0, futureCount: 0 };

  res.json({ customer, dogs, passes, lessons, counters });
});

export default router;
