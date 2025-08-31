// server/routes/lessons.js
import express from "express";

const router = express.Router();

/**
 * In-memory opslag van lessen
 * Velden:
 *  - id
 *  - customerId
 *  - dogId (optioneel maar aangeraden)
 *  - classType (bv. "Puppycursus", sleutel of code mag ook)
 *  - date (YYYY-MM-DD)
 *  - startTime (HH:mm)
 *  - endTime (HH:mm | null)
 *  - location (string | null)
 *  - trainer  (string | null)
 *  - theme    (string | null)
 *  - usedPassId (welke strippenkaart is gebruikt om 1 strip af te boeken)
 *  - createdAt / updatedAt
 */
export const LESSONS_REF = [];
let NEXT_LESSON_ID = 1;

const nowISO = () => new Date().toISOString();
const toInt = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

/* ----------------- Kleine HTTP helpers om eigen API te bellen ----------------- */
async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GET ${url} -> HTTP ${r.status}`);
  return r.json();
}
async function postJSON(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(body || {})
  });
  if (!r.ok) {
    const t = await r.text().catch(()=> "");
    throw new Error(`POST ${url} -> HTTP ${r.status} ${t}`);
  }
  try { return await r.json(); } catch { return {}; }
}

/* ----------------- Validatie helpers ----------------- */

/** Checkt of klant bestaat; geeft klant terug of null */
async function ensureCustomer(base, customerId) {
  try {
    return await getJSON(`${base}/api/customers/${customerId}`);
  } catch {
    return null;
  }
}

/** Haalt honden voor klant op en checkt of dogId bij die klant hoort */
async function ensureDogOfCustomer(base, customerId, dogId) {
  if (!dogId) return null; // niet verplicht, dan laten we toe
  try {
    const dogs = await getJSON(`${base}/api/dogs?ownerId=${encodeURIComponent(customerId)}`);
    const did = toInt(dogId);
    return Array.isArray(dogs) ? dogs.find(d => d.id === did) || null : null;
  } catch {
    return null;
  }
}

/**
 * Probeert een strippenkaart te vinden én 1 strip te verbruiken.
 * Ondersteunt twee scenario's:
 *  1) Nieuwe API met filters:  GET /api/passes?customerId=&classType=
 *  2) Eenvoudige API:          GET /api/passes  (dan filteren we client-side op type)
 *
 * Verwacht dat een kaart er uitziet als:
 *  - { id, type, remaining } OF { id, type, strips } (strips = resterend)
 */
async function tryUseOneStrip(base, customerId, classType) {
  let list = [];

  // Eerst proberen met gefilterde endpoint (als je die hebt)
  try {
    const filtered = await getJSON(
      `${base}/api/passes?customerId=${encodeURIComponent(customerId)}&classType=${encodeURIComponent(classType)}`
    );
    if (Array.isArray(filtered)) list = filtered;
    else if (filtered && typeof filtered === "object") list = [filtered];
  } catch {
    // negeren; vallen terug op /api/passes
  }

  // Indien niets gevonden, haal alles op en filter client-side
  if (!list.length) {
    try {
      const all = await getJSON(`${base}/api/passes`);
      if (Array.isArray(all)) {
        // Zoek kaarten met matchend type en nog resterend > 0
        list = all.filter(p => {
          const left = Number(p.remaining ?? p.strips ?? 0);
          return (String(p.type).toLowerCase() === String(classType).toLowerCase()) && left > 0;
        });
      }
    } catch {
      // geen passes beschikbaar
    }
  }

  if (!list.length) {
    return { ok:false, error:"Geen (resterende) strippenkaart gevonden voor dit lestype." };
  }

  // Pak de "beste" kaart (eenvoudig: de eerste met resterend > 0)
  const candidate = list.find(p => Number(p.remaining ?? p.strips ?? 0) > 0) || list[0];

  // Probeer 1 strip te gebruiken. Twee varianten:
  //  A) POST /api/passes/:id/use
  //  B) POST /api/passes/use  { customerId, classType, count:1 }  (als je die route hebt)
  try {
    // A: meest voorkomend in jouw installatie
    const used = await postJSON(`${base}/api/passes/${candidate.id}/use`, {});
    return { ok:true, passId: candidate.id, pass: used?.pass || used };
  } catch {
    // B: alternatieve route
    try {
      const used2 = await postJSON(`${base}/api/passes/use`, {
        customerId: Number(customerId),
        classType: String(classType),
        count: 1
      });
      // als deze route geen passId teruggeeft, laten we het id leeg
      return { ok:true, passId: used2?.id || null, pass: used2 };
    } catch (e2) {
      return { ok:false, error:`Kon geen strip verbruiken (${String(e2.message||e2)})` };
    }
  }
}

/* ----------------- Routes ----------------- */

/**
 * GET /api/lessons
 * Optionele filters: ?customerId=..&date=YYYY-MM-DD
 */
router.get("/", (req, res) => {
  const { customerId, date } = req.query;
  let list = [...LESSONS_REF];

  if (customerId != null) {
    const cid = String(customerId);
    list = list.filter(l => String(l.customerId) === cid);
  }
  if (date) {
    const d = String(date);
    list = list.filter(l => l.date === d);
  }
  res.json(list);
});

/**
 * GET /api/lessons/:id
 */
router.get("/:id", (req, res) => {
  const id = toInt(req.params.id);
  const l = LESSONS_REF.find(x => x.id === id);
  if (!l) return res.status(404).json({ error: "Les niet gevonden" });
  res.json(l);
});

/**
 * POST /api/lessons
 * Body vereist:
 *  { customerId, dogId?, classType, date, startTime, endTime?, location?, trainer?, theme?, dryRun? }
 *  - dryRun=true → valideert alles, maar **boekt geen strip** en bewaart de les niet (handig voor UI precheck)
 */
router.post("/", async (req, res) => {
  try {
    const b = req.body || {};
    const customerId = toInt(b.customerId);
    const dogId      = b.dogId != null ? toInt(b.dogId) : null;
    const classType  = (b.classType || "").toString().trim();
    const date       = (b.date || "").toString().trim();
    const startTime  = (b.startTime || "").toString().trim();
    const endTime    = (b.endTime || "").toString().trim() || null;
    const location   = (b.location || "").toString().trim() || null;
    const trainer    = (b.trainer || "").toString().trim() || null;
    const theme      = (b.theme || "").toString().trim() || null;
    const dryRun     = Boolean(b.dryRun);

    if (!customerId) return res.status(400).json({ error:"customerId is verplicht" });
    if (!classType)  return res.status(400).json({ error:"classType is verplicht" });
    if (!date)       return res.status(400).json({ error:"date is verplicht (YYYY-MM-DD)" });
    if (!startTime)  return res.status(400).json({ error:"startTime is verplicht (HH:mm)" });

    // Base URL (Render ondersteunt fetch naar relatieve paden op dezelfde service)
    const base = "";

    // 1) Klant moet bestaan
    const customer = await ensureCustomer(base, customerId);
    if (!customer) return res.status(404).json({ error:"Klant niet gevonden" });

    // 2) Hond moet bij klant horen (als opgegeven)
    if (dogId) {
      const dog = await ensureDogOfCustomer(base, customerId, dogId);
      if (!dog) return res.status(400).json({ error:"Hond hoort niet bij deze klant (of bestaat niet)" });
    }

    // 3) (Optioneel) overlap-check (eenvoudig): zelfde klant, zelfde datum & starttijd
    const overlaps = LESSONS_REF.find(
      l => l.customerId === customerId && l.date === date && l.startTime === startTime
    );
    if (overlaps) {
      return res.status(409).json({ error:"Klant heeft al een les op dit moment" });
    }

    // 4) Bij echte boeking: 1 strip afschrijven op een passende kaart
    let usedPassId = null;
    let passInfo   = null;
    if (!dryRun) {
      const useRes = await tryUseOneStrip(base, customerId, classType);
      if (!useRes.ok) return res.status(400).json({ error: useRes.error });
      usedPassId = useRes.passId || null;
      passInfo   = useRes.pass || null;
    }

    // 5) Les bewaren (tenzij dryRun)
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
      usedPassId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    if (dryRun) {
      return res.json({ ok:true, dryRun:true, lessonPreview: lesson });
    }

    LESSONS_REF.push(lesson);
    return res.status(201).json({ ok:true, lesson, pass: passInfo });
  } catch (e) {
    return res.status(500).json({ error:"Kon les niet aanmaken", details:String(e?.message || e) });
  }
});

/**
 * DELETE /api/lessons/:id
 * Verwijdert de les. (Optioneel kan je hier later strip "refund" doen als je passes-API dat ondersteunt.)
 */
router.delete("/:id", (req, res) => {
  const id = toInt(req.params.id);
  const idx = LESSONS_REF.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error:"Les niet gevonden" });

  const [removed] = LESSONS_REF.splice(idx, 1);
  // NB: strip teruggeven kan alleen als jouw passes-API een 'refund' ondersteunt;
  // anders laten we dit achterwege of regelen we het via admin.
  return res.json({ ok:true, removed });
});

export default router;
