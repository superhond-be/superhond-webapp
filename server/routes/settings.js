// server/routes/settings.js
import express from "express";
const router = express.Router();

/**
 * In-memory settings.
 * Later kan dit naar een database. Nu is het bewust eenvoudig.
 */
let SETTINGS = {
  org: {
    name: "Superhond.be",
    email: "info@superhond.be",
    phone: "",
    website: "https://www.superhond.be"
  },
  branding: {
    logoUrl: "",                 // absolute of relatieve URL naar je logo (bv. "/logo.png")
    primaryColor: "#0a7a3a",     // hoofdkleur
    accentColor: "#e6f5ec"       // zachte achtergrond/steunkleur
  },
  locations: [
    // { id: 1, name: "Retie", address: "Voorbeeldstraat 1, 2470 Retie", notes: "" }
  ],
  meta: {
    lessonTypes: [               // vrije lijst, te gebruiken als keuzelijst bij lessen
      // "Puppy (starters)", "Puppy (gevorderd)", "Puber", ...
    ],
    themes: [                    // bv. "Leiband", "Socialisatie", "Geurwerk"
      // "Leiband", "Socialisatie"
    ]
  }
};

let NEXT_LOCATION_ID = 1;

/* ---------------------------
   BASIS: alles opvragen
   --------------------------- */

// Volledige settings in één call
router.get("/", (_req, res) => {
  res.json(SETTINGS);
});

/* ---------------------------
   ORGANISATIE
   --------------------------- */

router.put("/org", (req, res) => {
  const { name, email, phone, website } = req.body || {};
  if (name !== undefined) SETTINGS.org.name = String(name);
  if (email !== undefined) SETTINGS.org.email = String(email);
  if (phone !== undefined) SETTINGS.org.phone = String(phone);
  if (website !== undefined) SETTINGS.org.website = String(website);
  res.json(SETTINGS.org);
});

/* ---------------------------
   BRANDING
   --------------------------- */

router.put("/branding", (req, res) => {
  const { logoUrl, primaryColor, accentColor } = req.body || {};
  if (logoUrl !== undefined) SETTINGS.branding.logoUrl = String(logoUrl);
  if (primaryColor !== undefined) SETTINGS.branding.primaryColor = String(primaryColor);
  if (accentColor !== undefined) SETTINGS.branding.accentColor = String(accentColor);
  res.json(SETTINGS.branding);
});

/* ---------------------------
   LOCATIES (CRUD)
   --------------------------- */

// Lijst
router.get("/locations", (_req, res) => {
  res.json(SETTINGS.locations);
});

// Toevoegen
router.post("/locations", (req, res) => {
  const { name, address, notes } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: "Naam van de locatie is verplicht" });

  const loc = {
    id: NEXT_LOCATION_ID++,
    name: String(name).trim(),
    address: address ? String(address) : "",
    notes: notes ? String(notes) : ""
  };
  SETTINGS.locations.push(loc);
  res.status(201).json(loc);
});

// Bijwerken
router.put("/locations/:id", (req, res) => {
  const id = Number(req.params.id);
  const i = SETTINGS.locations.findIndex(l => l.id === id);
  if (i === -1) return res.status(404).json({ error: "Locatie niet gevonden" });

  const { name, address, notes } = req.body || {};
  if (name !== undefined) SETTINGS.locations[i].name = String(name);
  if (address !== undefined) SETTINGS.locations[i].address = String(address);
  if (notes !== undefined) SETTINGS.locations[i].notes = String(notes);
  res.json(SETTINGS.locations[i]);
});

// Verwijderen
router.delete("/locations/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = SETTINGS.locations.length;
  SETTINGS.locations = SETTINGS.locations.filter(l => l.id !== id);
  if (SETTINGS.locations.length === before) return res.status(404).json({ error: "Locatie niet gevonden" });
  res.status(204).end();
});

/* ---------------------------
   LES-META (lestypes & thema's)
   --------------------------- */

// Lestypes ophalen/bijwerken
router.get("/lesson-types", (_req, res) => {
  res.json(SETTINGS.meta.lessonTypes);
});
router.put("/lesson-types", (req, res) => {
  const { lessonTypes } = req.body || {};
  if (!Array.isArray(lessonTypes)) {
    return res.status(400).json({ error: "lessonTypes moet een array zijn" });
  }
  SETTINGS.meta.lessonTypes = lessonTypes.map(x => String(x));
  res.json(SETTINGS.meta.lessonTypes);
});

// Thema's ophalen/bijwerken
router.get("/themes", (_req, res) => {
  res.json(SETTINGS.meta.themes);
});
router.put("/themes", (req, res) => {
  const { themes } = req.body || {};
  if (!Array.isArray(themes)) {
    return res.status(400).json({ error: "themes moet een array zijn" });
  }
  SETTINGS.meta.themes = themes.map(x => String(x));
  res.json(SETTINGS.meta.themes);
});

export default router;
