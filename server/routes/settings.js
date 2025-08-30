// server/routes/settings.js
import express from "express";
const router = express.Router();

/**
 * In-memory SETTINGS (voor testen / demo).
 * Bij een server-restart is dit terug naar de defaults.
 * Later kun je dit vervangen door een DB (b.v. SQLite/Postgres).
 */
let SETTINGS = {
  org: {
    name: "Superhond",
    email: "info@superhond.be",
    phone: "+32 498 877 065",
    address: {
      street: "Huisnummerstraat",
      nr: "33a",
      city: "Mol",
      country: "BE",
      postal: "2400",
    },
    website: "https://www.superhond.be",
  },
  branding: {
    primaryColor: "#00896c",
    secondaryColor: "#ffffff",
    logoUrl: "",
  },

  // Beheerdata
  locations: [
    { id: 1, name: "Dessel Tabloo", street: "Gravenstraat", nr: "3", postal: "2480", city: "Dessel", notes: "" },
    { id: 2, name: "Retie Prinsenpark", street: "Kastelsedijk", nr: "5", postal: "2470", city: "Retie", notes: "" },
  ],

  lessonTypes: [
    { id: 1, name: "Puppy – Coachgroep", description: "Startgroep voor pups (socialisatie, basis oefeningen)" },
    { id: 2, name: "Puber – Coachgroep", description: "Vervolg voor pubers; focus op prikkels & impulscontrole" },
  ],

  themes: [
    { id: 1, name: "Gehoorzaamheid", description: "Luisteren, volgen, blijven, hierkomen" },
    { id: 2, name: "Wandelen", description: "Lijnlopen, los volgen, wandelen in groep" },
  ],
};

// Helpers
const nextId = (arr) => (arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1);

// ---------- Root: alles ophalen ----------
router.get("/", (_req, res) => {
  res.json(SETTINGS);
});

// ---------- Organisatie ----------
router.get("/org", (_req, res) => res.json(SETTINGS.org));

router.put("/org", (req, res) => {
  const { name, email, phone, address, website } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is verplicht" });
  SETTINGS.org = {
    name,
    email: email ?? SETTINGS.org.email,
    phone: phone ?? SETTINGS.org.phone,
    address: { ...SETTINGS.org.address, ...(address || {}) },
    website: website ?? SETTINGS.org.website,
  };
  res.json(SETTINGS.org);
});

// ---------- Branding ----------
router.get("/branding", (_req, res) => res.json(SETTINGS.branding));

router.put("/branding", (req, res) => {
  const { primaryColor, secondaryColor, logoUrl } = req.body || {};
  SETTINGS.branding = {
    primaryColor: primaryColor ?? SETTINGS.branding.primaryColor,
    secondaryColor: secondaryColor ?? SETTINGS.branding.secondaryColor,
    logoUrl: logoUrl ?? SETTINGS.branding.logoUrl,
  };
  res.json(SETTINGS.branding);
});

// ---------- Locaties (CRUD) ----------
router.get("/locations", (_req, res) => res.json(SETTINGS.locations));

router.post("/locations", (req, res) => {
  const { name, street = "", nr = "", postal = "", city = "", notes = "" } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is verplicht" });
  const item = { id: nextId(SETTINGS.locations), name, street, nr, postal, city, notes };
  SETTINGS.locations.push(item);
  res.status(201).json(item);
});

router.put("/locations/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = SETTINGS.locations.findIndex((l) => l.id === id);
  if (idx === -1) return res.status(404).json({ error: "locatie niet gevonden" });
  SETTINGS.locations[idx] = { ...SETTINGS.locations[idx], ...(req.body || {}) };
  res.json(SETTINGS.locations[idx]);
});

router.delete("/locations/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = SETTINGS.locations.length;
  SETTINGS.locations = SETTINGS.locations.filter((l) => l.id !== id);
  if (SETTINGS.locations.length === before) return res.status(404).json({ error: "locatie niet gevonden" });
  res.status(204).end();
});

// ---------- Les-types (lijst vervangen of individuele upsert) ----------
router.get("/lesson-types", (_req, res) => res.json(SETTINGS.lessonTypes));

/**
 * Vervangt de volledige lijst in één keer
 * Body: { items: [{id?, name, description}] }
 */
router.put("/lesson-types", (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  SETTINGS.lessonTypes = items.map((t, i) => ({
    id: t.id ?? i + 1,
    name: t.name ?? `Type ${i + 1}`,
    description: t.description ?? "",
  }));
  res.json(SETTINGS.lessonTypes);
});

/**
 * Upsert één item
 * POST: nieuw item zonder id
 * PUT: update met :id
 */
router.post("/lesson-types", (req, res) => {
  const { name, description = "" } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is verplicht" });
  const item = { id: nextId(SETTINGS.lessonTypes), name, description };
  SETTINGS.lessonTypes.push(item);
  res.status(201).json(item);
});

router.put("/lesson-types/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = SETTINGS.lessonTypes.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "type niet gevonden" });
  SETTINGS.lessonTypes[idx] = { ...SETTINGS.lessonTypes[idx], ...(req.body || {}) };
  res.json(SETTINGS.lessonTypes[idx]);
});

router.delete("/lesson-types/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = SETTINGS.lessonTypes.length;
  SETTINGS.lessonTypes = SETTINGS.lessonTypes.filter((t) => t.id !== id);
  if (SETTINGS.lessonTypes.length === before) return res.status(404).json({ error: "type niet gevonden" });
  res.status(204).end();
});

// ---------- Thema’s (lijst vervangen of individuele upsert) ----------
router.get("/themes", (_req, res) => res.json(SETTINGS.themes));

router.put("/themes", (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  SETTINGS.themes = items.map((t, i) => ({
    id: t.id ?? i + 1,
    name: t.name ?? `Thema ${i + 1}`,
    description: t.description ?? "",
  }));
  res.json(SETTINGS.themes);
});

router.post("/themes", (req, res) => {
  const { name, description = "" } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is verplicht" });
  const item = { id: nextId(SETTINGS.themes), name, description };
  SETTINGS.themes.push(item);
  res.status(201).json(item);
});

router.put("/themes/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = SETTINGS.themes.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "thema niet gevonden" });
  SETTINGS.themes[idx] = { ...SETTINGS.themes[idx], ...(req.body || {}) };
  res.json(SETTINGS.themes[idx]);
});

router.delete("/themes/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = SETTINGS.themes.length;
  SETTINGS.themes = SETTINGS.themes.filter((t) => t.id !== id);
  if (SETTINGS.themes.length === before) return res.status(404).json({ error: "thema niet gevonden" });
  res.status(204).end();
});

export default router;
