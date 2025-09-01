const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { store, nextId } = require("../store");

const router = express.Router();

// ---- Multer configuratie voor foto-upload ---------------------------------
const uploadsDir = path.join(__dirname, "../../uploads");
try { if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true }); } catch {}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `dog_${Date.now()}${ext || ".jpg"}`);
  }
});
const upload = multer({ storage });

// ==========================================================================
// POST /api/customers/register
// multipart/form-data met velden:
// - customerName, customerEmail, customerPhone, lessonType
// - dogName, dogBreed, dogBirth, dogSex, vaccineStatus, bookRef,
//   vetPhone, vetName, emergency
// - dogPhoto (file, optioneel)
// ==========================================================================
router.post("/register", upload.single("dogPhoto"), (req, res) => {
  try {
    const b = req.body || {};

    // Validatie basisvelden
    if (!b.customerName || !b.customerEmail || !b.dogName) {
      return res.status(400).json({ message: "customerName, customerEmail en dogName zijn verplicht." });
    }

    // 1) Customer bewaren
    const customer = {
      id: nextId(store.customers),
      name: String(b.customerName).trim(),
      email: String(b.customerEmail).trim(),
      phone: (b.customerPhone || "").trim(),
      lessonType: (b.lessonType || "").trim()
    };
    store.customers.push(customer);

    // 2) Dog bewaren + fotopad
    let photoUrl = null;
    if (req.file && req.file.filename) {
      // Serveerbaar via server/index.js -> app.use("/uploads", express.static(...))
      photoUrl = `/uploads/${req.file.filename}`;
    }

    const dog = {
      id: nextId(store.dogs),
      customerId: customer.id,
      name: String(b.dogName).trim(),
      breed: (b.dogBreed || "").trim(),
      birthdate: (b.dogBirth || "").trim(),
      gender: (b.dogSex || "").trim(),
      vaccinationStatus: (b.vaccineStatus || "").trim(),
      passportRef: (b.bookRef || "").trim(),
      vetPhone: (b.vetPhone || "").trim(),
      vetName: (b.vetName || "").trim(),
      emergencyPhone: (b.emergency || "").trim(),
      photoUrl
    };
    store.dogs.push(dog);

    // Antwoord dat perfect aansluit op jouw frontend
    return res.status(201).json({ customer, dog });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Interne fout bij registreren." });
  }
});

// ==========================================================================
// GET /api/customers/search?q=term
// Zoekt in klantnaam/email/telefoon én in hondnaam.
// Retourneert lijst met { match: 'customer'|'dog', customer: {...}, dog?: {...} }
// ==========================================================================
router.get("/search", (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  if (q.length < 2) return res.json([]);

  const results = [];

  // Zoek in klanten
  for (const c of store.customers) {
    const hay = [c.name, c.email, c.phone].filter(Boolean).join(" ").toLowerCase();
    if (hay.includes(q)) {
      results.push({ match: "customer", customer: { id: c.id, name: c.name, email: c.email, phone: c.phone } });
    }
  }

  // Zoek in honden (koppel eigenaar mee terug)
  for (const d of store.dogs) {
    if ((d.name || "").toLowerCase().includes(q)) {
      const owner = store.customers.find((c) => c.id === d.customerId);
      if (owner) {
        // duw de eigenaar als match (type 'dog'), zodat UI één selectiepad heeft
        results.push({
          match: "dog",
          customer: { id: owner.id, name: owner.name, email: owner.email, phone: owner.phone },
          dog: { id: d.id, name: d.name, breed: d.breed, photoUrl: d.photoUrl }
        });
      }
    }
  }

  // Dubbele customers ontdubbelen (eenvoudig)
  const seen = new Set();
  const unique = [];
  for (const r of results) {
    const key = `${r.match}-${r.customer.id}-${r.dog?.id || ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(r);
    }
  }

  res.json(unique);
});

// ==========================================================================
// GET /api/customers/overview/:id
// Combineert:
//   - klant
//   - alle honden van klant
//   - strippenkaarten (samenvatting)
//   - dummy placeholders voor 'lessons' (kan later gekoppeld worden)
// ==========================================================================
router.get("/overview/:id", (req, res) => {
  const cid = Number(req.params.id);
  const customer = store.customers.find((c) => c.id === cid);
  if (!customer) return res.status(404).json({ message: "Klant niet gevonden" });

  const dogs = store.dogs.filter((d) => d.customerId === cid);

  // Strippenkaarten van deze klant (alle honden)
  const passes = store.passes
    .filter((p) => p.customerId === cid)
    .map((p) => ({
      id: p.id,
      dogId: p.dogId,
      typeCode: p.type || "",
      total: p.totalStrips || 0,
      used: p.usedStrips || 0
    }));

  // Voor nu geen echte lessenplanner — placeholders:
  const lessons = { past: [], future: [] };

  const counters = {
    pastCount: lessons.past.length,
    futureCount: lessons.future.length
  };

  res.json({ customer, dogs, passes, lessons, counters });
});

// ==========================================================================
// Eenvoudige CRUD (optioneel) – blijft verenigbaar met oudere code
// ==========================================================================

// GET alle klanten
router.get("/", (_req, res) => {
  res.json(store.customers);
});

// GET klant op ID
router.get("/:id", (req, res) => {
  const c = store.customers.find((x) => x.id === Number(req.params.id));
  if (!c) return res.status(404).json({ message: "Klant niet gevonden" });
  res.json(c);
});

// POST klant (zonder hond, eenvoudige variant)
router.post("/", (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.email) return res.status(400).json({ message: "name en email zijn verplicht" });
  const c = {
    id: nextId(store.customers),
    name: String(b.name).trim(),
    email: String(b.email).trim(),
    phone: (b.phone || "").trim(),
    lessonType: (b.lessonType || "").trim()
  };
  store.customers.push(c);
  res.status(201).json(c);
});

// PUT klant
router.put("/:id", (req, res) => {
  const c = store.customers.find((x) => x.id === Number(req.params.id));
  if (!c) return res.status(404).json({ message: "Klant niet gevonden" });

  c.name = req.body.name ?? c.name;
  c.email = req.body.email ?? c.email;
  c.phone = req.body.phone ?? c.phone;
  c.lessonType = req.body.lessonType ?? c.lessonType;

  res.json(c);
});

// DELETE klant
router.delete("/:id", (req, res) => {
  const before = store.customers.length;
  store.customers = store.customers.filter((x) => x.id !== Number(req.params.id));

  // Verwijder ook gekoppelde honden & passes (cascade light)
  store.dogs = store.dogs.filter((d) => d.customerId !== Number(req.params.id));
  store.passes = store.passes.filter((p) => p.customerId !== Number(req.params.id));

  if (store.customers.length === before) {
    return res.status(404).json({ message: "Klant niet gevonden" });
  }
  res.json({ message: "Klant + gekoppelde data verwijderd" });
});

module.exports = router;
