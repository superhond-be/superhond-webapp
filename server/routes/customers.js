// server/routes/customers.js
import express from "express";
import { DOGS_REF } from "./dogs.js"; // om honden te kunnen koppelen in /with-dogs

const router = express.Router();

/**
 * In-memory klanten
 * Velden:
 *  - id (number)
 *  - name (string)            // verplicht
 *  - email (string|null)
 *  - phone (string|null)
 *  - address (string|null)
 *  - emergency (string|null)  // noodcontact/extra info
 *  - createdAt / updatedAt (ISO string)
 */
export const CUSTOMERS_REF = [];
let NEXT_CUSTOMER_ID = 1;

const nowISO = () => new Date().toISOString();
const toInt = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

// -------------------- GET /api/customers --------------------
// Optionele filters: ?q=zoekterm  (zoekt in name/email/phone)
router.get("/", (req, res) => {
  const { q } = req.query;
  let list = [...CUSTOMERS_REF];

  if (q && String(q).trim()) {
    const s = String(q).trim().toLowerCase();
    list = list.filter(c =>
      (c.name || "").toLowerCase().includes(s) ||
      (c.email || "").toLowerCase().includes(s) ||
      (c.phone || "").toLowerCase().includes(s)
    );
  }
  res.json(list);
});

// -------------------- GET /api/customers-with-dogs --------------------
// Zelfde als /api/customers maar voegt per klant een 'dogs' array toe.
router.get("/with-dogs", (_req, res) => {
  const out = CUSTOMERS_REF.map(c => {
    const dogs = DOGS_REF.filter(d => d.ownerId === c.id);
    return { ...c, dogs };
  });
  res.json(out);
});

// -------------------- GET /api/customers/:id --------------------
router.get("/:id", (req, res) => {
  const id = toInt(req.params.id);
  const c = CUSTOMERS_REF.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });
  res.json(c);
});

// -------------------- POST /api/customers --------------------
// Body minimaal: { name }
// Optioneel: email, phone, address, emergency
router.post("/", (req, res) => {
  try {
    const b = req.body || {};
    const name = (b.name || "").toString().trim();
    if (!name) return res.status(400).json({ error: "Naam is verplicht" });

    // eenvoudige 'upsert' op email (optioneel): als email bestaat, update
    const email = (b.email ?? "").toString().trim() || null;
    if (email) {
      const existing = CUSTOMERS_REF.find(
        x => (x.email || "").toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        // update enkel meegegeven velden
        if (name) existing.name = name;
        if (b.phone !== undefined)    existing.phone = String(b.phone || "").trim() || null;
        if (b.address !== undefined)  existing.address = String(b.address || "").trim() || null;
        if (b.emergency !== undefined)existing.emergency = String(b.emergency || "").trim() || null;
        existing.updatedAt = nowISO();
        return res.status(200).json(existing);
      }
    }

    const customer = {
      id: NEXT_CUSTOMER_ID++,
      name,
      email,
      phone: (b.phone ?? "").toString().trim() || null,
      address: (b.address ?? "").toString().trim() || null,
      emergency: (b.emergency ?? "").toString().trim() || null,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    CUSTOMERS_REF.push(customer);
    res.status(201).json(customer);
  } catch (e) {
    res.status(500).json({ error: "Kon klant niet aanmaken", details: String(e?.message || e) });
  }
});

// -------------------- PATCH /api/customers/:id --------------------
// Alleen velden die je meestuurt worden aangepast.
router.patch("/:id", (req, res) => {
  const id = toInt(req.params.id);
  const c = CUSTOMERS_REF.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });

  const b = req.body || {};
  const maybe = (k) => (b[k] !== undefined ? String(b[k]).trim() : undefined);

  const updates = {
    name: maybe("name"),
    email: maybe("email"),
    phone: maybe("phone"),
    address: maybe("address"),
    emergency: maybe("emergency"),
  };

  Object.entries(updates).forEach(([k, v]) => {
    if (v !== undefined) c[k] = v || null;
  });
  c.updatedAt = nowISO();
  res.json(c);
});

// -------------------- DELETE /api/customers/:id --------------------
router.delete("/:id", (req, res) => {
  const id = toInt(req.params.id);
  const idx = CUSTOMERS_REF.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "Klant niet gevonden" });
  const [removed] = CUSTOMERS_REF.splice(idx, 1);
  res.json({ ok: true, removed });
});

export default router;
