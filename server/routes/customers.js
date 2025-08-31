// server/routes/customers.js
import { Router } from "express";

const router = Router();

// In-memory klanten
let CUSTOMERS = [];
let NEXT_CUSTOMER_ID = 1;

// -------- Helpers --------
const okJson = (r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); };
const toStr = (v) => (v == null ? "" : String(v));

// -------- Basis: lijst klanten (zonder zware joins) --------
router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

// -------- Registreren: klant (+ optioneel hond + lestype via andere routes) --------
router.post("/", async (req, res) => {
  try {
    const { customer, dog, lessonType } = req.body || {};
    if (!customer?.name) return res.status(400).json({ error: "Klantnaam is verplicht" });

    const c = {
      id: NEXT_CUSTOMER_ID++,
      name: customer.name ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      createdAt: new Date().toISOString(),
    };
    CUSTOMERS.push(c);

    let createdDog = null;
    if (dog?.name) {
      const r = await fetch("http://localhost:3000/api/dogs", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ ...dog, customerId: c.id })
      });
      createdDog = await okJson(r);
    }

    let createdPass = null;
    if (lessonType) {
      const r = await fetch("http://localhost:3000/api/passes/assign", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ customerId: c.id, lessonType })
      });
      if (r.ok) createdPass = await r.json(); // als lesstype bekend is
    }

    res.status(201).json({ customer: c, dog: createdDog, pass: createdPass });
  } catch (e) {
    res.status(500).json({ error: "Kon klant niet registreren", details: String(e?.message || e) });
  }
});

// -------- Zoek: klant of hond --------
// query op: klant (name/email/phone) of hond (name)
// returns: array van { customer, match:"customer"|"dog" }
router.get("/search", async (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  if (!q) return res.json([]);

  // haal honden op 1x op (we zoeken lokaal)
  let dogs = [];
  try {
    dogs = await okJson(await fetch("http://localhost:3000/api/dogs"));
  } catch { dogs = []; }

  const results = [];

  // match klanten
  for (const c of CUSTOMERS) {
    const hay = [c.name, c.email, c.phone].map(toStr).join(" ").toLowerCase();
    if (hay.includes(q)) {
      results.push({ customer: c, match: "customer" });
    }
  }

  // match honden -> koppel naar klant
  for (const d of dogs) {
    const hay = toStr(d.name).toLowerCase();
    if (hay.includes(q)) {
      const c = CUSTOMERS.find(x => x.id === Number(d.customerId));
      if (c && !results.some(r => r.customer.id === c.id)) {
        results.push({ customer: c, match: "dog" });
      }
    }
  }

  res.json(results);
});

// -------- Overzicht: één payload met alles bij elkaar --------
// { customer, dogs[], passes[], lessons: { past[], future[] }, counters { pastCount, futureCount } }
router.get("/overview/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const customer = CUSTOMERS.find(c => c.id === id);
    if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

    // haal kinderen op via bestaande services
    const [dogs, passes, lessons] = await Promise.all([
      okJson(await fetch(`http://localhost:3000/api/dogs?customerId=${encodeURIComponent(id)}`)).catch(() => []),
      okJson(await fetch(`http://localhost:3000/api/passes/${encodeURIComponent(id)}`)).catch(() => []),
      okJson(await fetch(`http://localhost:3000/api/lessons?customerId=${encodeURIComponent(id)}`)).catch(() => []),
    ]);

    // splits lessen in verleden/toekomst
    const today = new Date();
    const toDate = (s) => {
      // verwacht YYYY-MM-DD
      const [y, m, d] = String(s || "").split("-").map(Number);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    };

    const past = [];
    const future = [];

    for (const l of lessons) {
      const dt = toDate(l.date);
      if (!dt) continue;
      (dt < new Date(today.getFullYear(), today.getMonth(), today.getDate()) ? past : future).push(l);
    }

    // sorteer beide lijsten (oud->nieuw, en toekomst -> eerstvolgend)
    past.sort((a,b) => a.date.localeCompare(b.date));
    future.sort((a,b) => a.date.localeCompare(b.date));

    res.json({
      customer,
      dogs,
      passes, // elk item { lessonType, total, used }
      lessons: { past, future },
      counters: { pastCount: past.length, futureCount: future.length }
    });
  } catch (e) {
    res.status(500).json({ error: "Kon overzicht niet laden", details: String(e?.message || e) });
  }
});

export default router;
