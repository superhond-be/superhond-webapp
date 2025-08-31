// server/routes/dogs.js
import express from "express";

const router = express.Router();

/**
 * In-memory opslag van honden
 * Velden:
 *  - id (number)
 *  - ownerId (number, klant-id)
 *  - name (string)                // verplicht
 *  - breed (string|null)
 *  - sex (string|null)            // "reu" | "teef" | ""
 *  - birthdate (string|null)      // "YYYY-MM-DD"
 *  - bookRef (string|null)        // referentie/omschrijving inentingsboekje
 *  - vaccStatus (string|null)     // bv. "volledig", "in orde", ...
 *  - vetName (string|null)
 *  - vetPhone (string|null)
 *  - emergencyPhone (string|null)
 *  - notes (string|null)
 *  - createdAt / updatedAt (ISO string)
 */
export const DOGS_REF = [];
let NEXT_DOG_ID = 1;

function nowISO() { return new Date().toISOString(); }
function toInt(n) { const v = Number(n); return Number.isFinite(v) ? v : null; }

// ----------- GET /api/dogs  -------------------------------------------
// Optionele filters: ?ownerId=...&q=zoekterm_in_naam
router.get("/", (req, res) => {
  let list = [...DOGS_REF];
  const { ownerId, q } = req.query;

  if (ownerId != null) {
    const oid = String(ownerId);
    list = list.filter(d => String(d.ownerId) === oid);
  }
  if (q && String(q).trim()) {
    const s = String(q).trim().toLowerCase();
    list = list.filter(d =>
      (d.name || "").toLowerCase().includes(s) ||
      (d.breed || "").toLowerCase().includes(s)
    );
  }

  res.json(list);
});

// ----------- GET /api/dogs/:id  ---------------------------------------
router.get("/:id", (req, res) => {
  const id = toInt(req.params.id);
  const dog = DOGS_REF.find(d => d.id === id);
  if (!dog) return res.status(404).json({ error: "Hond niet gevonden" });
  res.json(dog);
});

// ----------- POST /api/dogs  ------------------------------------------
// Body minimaal: { ownerId, name }
// Optioneel: breed, sex, birthdate, bookRef, vaccStatus, vetName, vetPhone, emergencyPhone, notes
router.post("/", (req, res) => {
  try {
    const body = req.body || {};
    const ownerId = toInt(body.ownerId);
    const name = (body.name || "").toString().trim();

    if (!ownerId) return res.status(400).json({ error: "ownerId is verplicht (klant-id)" });
    if (!name)    return res.status(400).json({ error: "Naam hond is verplicht" });

    const dog = {
      id: NEXT_DOG_ID++,
      ownerId,
      name,
      breed: (body.breed ?? "").toString().trim() || null,
      sex: (body.sex ?? "").toString().trim() || null,
      birthdate: (body.birthdate ?? "").toString().trim() || null,
      bookRef: (body.bookRef ?? "").toString().trim() || null,
      vaccStatus: (body.vaccStatus ?? "").toString().trim() || null,
      vetName: (body.vetName ?? "").toString().trim() || null,
      vetPhone: (body.vetPhone ?? "").toString().trim() || null,
      emergencyPhone: (body.emergencyPhone ?? "").toString().trim() || null,
      notes: (body.notes ?? "").toString().trim() || null,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    DOGS_REF.push(dog);
    res.status(201).json(dog);
  } catch (e) {
    res.status(500).json({ error: "Kon hond niet aanmaken", details: String(e?.message || e) });
  }
});

// ----------- PATCH /api/dogs/:id  -------------------------------------
// Werk velden bij; alleen meegegeven velden worden overschreven
router.patch("/:id", (req, res) => {
  const id = toInt(req.params.id);
  const dog = DOGS_REF.find(d => d.id === id);
  if (!dog) return res.status(404).json({ error: "Hond niet gevonden" });

  const b = req.body || {};
  const maybe = (k) => (b[k] !== undefined ? String(b[k]).trim() : undefined);

  const updates = {
    ownerId: b.ownerId !== undefined ? toInt(b.ownerId) : undefined,
    name: maybe("name"),
    breed: maybe("breed"),
    sex: maybe("sex"),
    birthdate: maybe("birthdate"),
    bookRef: maybe("bookRef"),
    vaccStatus: maybe("vaccStatus"),
    vetName: maybe("vetName"),
    vetPhone: maybe("vetPhone"),
    emergencyPhone: maybe("emergencyPhone"),
    notes: maybe("notes"),
  };

  Object.entries(updates).forEach(([k, v]) => {
    if (v !== undefined) dog[k] = v || (k === "ownerId" ? dog[k] : null);
  });

  dog.updatedAt = nowISO();
  res.json(dog);
});

// ----------- DELETE /api/dogs/:id  ------------------------------------
router.delete("/:id", (req, res) => {
  const id = toInt(req.params.id);
  const idx = DOGS_REF.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ error: "Hond niet gevonden" });
  const [removed] = DOGS_REF.splice(idx, 1);
  res.json({ ok: true, removed });
});

export default router;
