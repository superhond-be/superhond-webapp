// server/routes/lessons.js
import express from "express";

const router = express.Router();

/**
 * In-memory lessen
 * velden:
 *  - id (number)
 *  - customerId (number)
 *  - dogId (number|null)
 *  - classType (string)
 *  - date (YYYY-MM-DD)
 *  - startTime (HH:mm)
 *  - endTime (HH:mm|null)
 *  - location (string|null)
 *  - trainer (string|null)
 *  - theme (string|null)
 *  - status ("planned" | "attended" | "no-show" | "cancelled")
 *  - createdAt / updatedAt (ISO)
 */
export const LESSONS_REF = [];
let NEXT_LESSON_ID = 1;

const nowISO = () => new Date().toISOString();
const toInt = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

/* -------------------- helpers om eigen API te bellen -------------------- */
async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GET ${url} -> ${r.status}`);
  return r.json();
}

/** check klant en honden; retourneert {customer, dog|null} of gooit fout */
async function verifyCustomerAndDog(customerId, dogId) {
  const customer = await getJSON(`/api/customers/${customerId}`);
  if (!customer) throw new Error("Klant niet gevonden");

  let dog = null;
  if (dogId != null) {
    const did = toInt(dogId);
    dog = (customer.dogs || []).find((d) => d.id === did) || null;
    if (!dog) throw new Error("Hond hoort niet bij deze klant");
  }
  return { customer, dog };
}

/* --------------------------- GET /api/lessons ---------------------------
   filters:
   - customerId
   - dogId
   - status (comma-list: planned,attended,cancelled,no-show)
   - dateFrom (YYYY-MM-DD)  inclusive
   - dateTo   (YYYY-MM-DD)  inclusive
------------------------------------------------------------------------- */
router.get("/", (req, res) => {
  const { customerId, dogId, status, dateFrom, dateTo } = req.query;
  let list = [...LESSONS_REF];

  if (customerId != null) {
    const cid = String(customerId);
    list = list.filter((l) => String(l.customerId) === cid);
  }
  if (dogId != null) {
    const did = String(dogId);
    list = list.filter((l) => String(l.dogId) === did);
  }
  if (status) {
    const set = new Set(String(status).split(",").map((s) => s.trim().toLowerCase()));
    list = list.filter((l) => set.has(String(l.status).toLowerCase()));
  }
  if (dateFrom) {
    list = list.filter((l) => l.date >= String(dateFrom));
  }
  if (dateTo) {
    list = list.filter((l) => l.date <= String(dateTo));
  }
  res.json(list);
});

/* --------------------------- GET /api/lessons/:id ---------------------- */
router.get("/:id", (req, res) => {
  const id = toInt(req.params.id);
  const l = LESSONS_REF.find((x) => x.id === id);
  if (!l) return res.status(404).json({ error: "Les niet gevonden" });
  res.json(l);
});

/* --------------------------- POST /api/lessons -------------------------
   body vereist:
   { customerId, dogId?, classType, date, startTime, endTime?, location?, trainer?, theme? }
   - boekt GEEN strip (pas bij attended/no-show, indien je dat later wil)
------------------------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const b = req.body || {};
    const customerId = toInt(b.customerId);
    const dogId = b.dogId != null ? toInt(b.dogId) : null;
    const classType = (b.classType || "").toString().trim();
    const date = (b.date || "").toString().trim();
    const startTime = (b.startTime || "").toString().trim();
    const endTime = (b.endTime || "").toString().trim() || null;
    const location = (b.location || "").toString().trim() || null;
    const trainer = (b.trainer || "").toString().trim() || null;
    const theme = (b.theme || "").toString().trim() || null;

    if (!customerId) return res.status(400).json({ error: "customerId is verplicht" });
    if (!classType) return res.status(400).json({ error: "classType is verplicht" });
    if (!date) return res.status(400).json({ error: "date is verplicht (YYYY-MM-DD)" });
    if (!startTime) return res.status(400).json({ error: "startTime is verplicht (HH:mm)" });

    // valideer klant & hond
    try {
      await verifyCustomerAndDog(customerId, dogId);
    } catch (e) {
      return res.status(400).json({ error: String(e.message || e) });
    }

    // eenvoudige overlap-check: zelfde klant, zelfde datum+start
    const overlap = LESSONS_REF.find(
      (l) => l.customerId === customerId && l.date === date && l.startTime === startTime && l.status !== "cancelled"
    );
    if (overlap) {
      return res.status(409).json({ error: "Deze klant heeft al een les op dit moment" });
    }

    const lesson = {
      id: NEXT_LESSON_ID++,
      customerId,
      dogId,
      classType,
      date,
      startTime,
      endTime,
      location,
      trainer,
      theme,
      status: "planned",
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    LESSONS_REF.push(lesson);
    res.status(201).json({ ok: true, lesson });
  } catch (e) {
    res.status(500).json({ error: "Kon les niet aanmaken", details: String(e?.message || e) });
  }
});

/* --------------------- PATCH /api/lessons/:id/status --------------------
   body: { status }
   status ∈ planned | attended | no-show | cancelled
   (hier kun je later strip-afschrijving triggeren bij 'attended')
------------------------------------------------------------------------- */
router.patch("/:id/status", async (req, res) => {
  const id = toInt(req.params.id);
  const l = LESSONS_REF.find((x) => x.id === id);
  if (!l) return res.status(404).json({ error: "Les niet gevonden" });

  const wanted = String(req.body?.status || "").toLowerCase();
  const allowed = new Set(["planned", "attended", "no-show", "cancelled"]);
  if (!allowed.has(wanted)) return res.status(400).json({ error: "Ongeldige status" });

  l.status = wanted;
  l.updatedAt = nowISO();

  // 👉 Hier later (optioneel): strip afboeken bij attended / terugzetten bij cancelled
  // voorbeeld: await fetch(`/api/customers/${l.customerId}/use-strip-by-type`, { ... })
  // afhankelijk van de implementatie van jullie customers/passes API.

  res.json({ ok: true, lesson: l });
});

/* ------------------------------ DELETE --------------------------------- */
router.delete("/:id", (req, res) => {
  const id = toInt(req.params.id);
  const idx = LESSONS_REF.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "Les niet gevonden" });
  const [removed] = LESSONS_REF.splice(idx, 1);
  res.json({ ok: true, removed });
});

export default router;
