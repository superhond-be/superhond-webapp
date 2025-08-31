// server/routes/integrations.js
import express from "express";
const router = express.Router();

/**
 * Config: vaste strippen per pakket
 * KEY's laat je overeenkomen met wat jouw extern systeem stuurt.
 */
const PACKAGE_MAP = {
  PUPPY:        { name: "Puppycursus", strips: 9 },
  PUBER:        { name: "Pubertraining", strips: 8 },
  GEHOORZAAM:   { name: "Gehoorzaamheid", strips: 10 },
};

/**
 * Idempotency-store: onthoud welke externalOrderId we al verwerkten.
 * (Zolang we in-memory werken; in DB vervang je dit door een tabel.)
 */
const PROCESSED_ORDERS = new Set();

/** Kleine helper */
async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GET ${url} -> HTTP ${r.status}`);
  return r.json();
}
async function postJSON(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text().catch(()=>"");
    throw new Error(`POST ${url} -> HTTP ${r.status} ${t}`);
  }
  return r.json().catch(()=> ({}));
}
async function patchJSON(url, body) {
  const r = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text().catch(()=>"");
    throw new Error(`PATCH ${url} -> HTTP ${r.status} ${t}`);
  }
  return r.json().catch(()=> ({}));
}

/**
 * POST /api/integrations/external-order
 *
 * Header (optioneel, voor beveiliging):
 *   x-sh-secret: <jouw_geheime_token>
 *
 * Body (voorbeeld):
 * {
 *   "externalOrderId": "ANIDAY-12345",
 *   "customer": {
 *     "name": "Jan Jansen",
 *     "email": "jan@example.com",
 *     "phone": "0470 00 00 00",
 *     "address": "Stationsstraat 1, 2400 Mol"
 *   },
 *   "dog": {
 *     "name": "Rex",
 *     "breed": "Labrador",
 *     "birthDate": "2024-05-10",
 *     "sex": "reu"
 *   },
 *   "packageKey": "PUPPY"  // moet bestaan in PACKAGE_MAP
 * }
 */
router.post("/api/integrations/external-order", async (req, res) => {
  try {
    // (1) Secret check (optioneel — zet env var SH_WEBHOOK_SECRET in Render)
    const expected = process.env.SH_WEBHOOK_SECRET || null;
    if (expected) {
      const got = req.get("x-sh-secret");
      if (!got || got !== expected) {
        return res.status(401).json({ error: "Invalid or missing x-sh-secret" });
      }
    }

    const { externalOrderId, customer, dog, packageKey } = req.body || {};
    if (!externalOrderId) return res.status(400).json({ error: "externalOrderId is verplicht" });
    if (!customer?.email || !customer?.name) {
      return res.status(400).json({ error: "customer.name en customer.email zijn verplicht" });
    }
    if (!packageKey || !PACKAGE_MAP[packageKey]) {
      return res.status(400).json({ error: `Onbekend packageKey. Gebruik: ${Object.keys(PACKAGE_MAP).join(", ")}` });
    }

    // (2) Idempotent: als we dit orderId al verwerkten → return bestaande status
    if (PROCESSED_ORDERS.has(externalOrderId)) {
      return res.json({ ok: true, duplicated: true, info: "Order reeds verwerkt." });
    }

    // Base URL voor eigen API-calls
    const base = process.env.RENDER_INTERNAL_URL || ""; // Render interne URL, of laat leeg en gebruik relatieve paden
    const api = (path) => (base ? `${base}${path}` : path);

    // (3) Upsert klant op e-mail
    const customers = await getJSON(api("/api/customers"));
    let found = customers.find(c => String(c.email).toLowerCase() === String(customer.email).toLowerCase());
    if (!found) {
      // maak nieuwe klant
      found = await postJSON(api("/api/customers"), {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        address: customer.address || ""
      });
    } else {
      // werk gegevens bij indien nieuw
      const patch = {};
      if (customer.name   && customer.name   !== found.name)  patch.name = customer.name;
      if (customer.phone  && customer.phone  !== found.phone) patch.phone = customer.phone;
      if (customer.address && customer.address !== found.address) patch.address = customer.address;
      if (Object.keys(patch).length) {
        found = await patchJSON(api(`/api/customers/${found.id}`), patch);
      }
    }

    // (4) Hond koppelen (optioneel)
    let newDog = null;
    if (dog?.name) {
      // check of klant al een hond met die naam heeft (heel eenvoudige matching)
      const dogsList = await getJSON(api(`/api/dogs?ownerId=${found.id}`));
      const exists = dogsList.find(d => String(d.name).toLowerCase() === String(dog.name).toLowerCase());
      if (exists) {
        newDog = exists;
      } else {
        newDog = await postJSON(api("/api/dogs"), {
          ownerId: found.id,
          name: dog.name,
          breed: dog.breed || "",
          sex: dog.sex || "",
          birthdate: dog.birthDate || ""
        });
      }
    }

    // (5) Strippenkaart aanmaken voor het pakket
    const pkg = PACKAGE_MAP[packageKey];
    const pass = await postJSON(api("/api/passes"), {
      type: pkg.name,
      strips: pkg.strips
    });

    // (6) Markeer order als verwerkt
    PROCESSED_ORDERS.add(externalOrderId);

    return res.status(201).json({
      ok: true,
      customer: found,
      dog: newDog,
      pass,
      package: { key: packageKey, ...pkg }
    });
  } catch (e) {
    console.error("external-order error:", e);
    return res.status(500).json({ error: "Kon externe bestelling niet verwerken", details: String(e.message || e) });
  }
});

export default router;
