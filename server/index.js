// server/index.js
// Superhond.be Admin backend (Express + JSON files) — SAFE INIT

const express = require("express");
const path = require("path");
const fs = require("fs");

// App setup
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());

// Public map serveren (zonder cache)
app.use(
  express.static(path.join(__dirname, "..", "public"), {
    etag: false,
    lastModified: false,
    maxAge: 0,
    setHeaders(res) {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      res.set("Surrogate-Control", "no-store");
    },
  })
);

// ---------- FS helpers (SAFE INIT) ----------
const DB_DIR = path.join(__dirname, "db");

// lijst van alle JSON-bestanden die we gebruiken
const ENTITIES = [
  "lessen.json",
  "boekingen.json",
  "klanten.json",
  "honden.json",
  "trainers.json",
  "locaties.json",
  "les-types.json",          // << nieuw
  "email-templates.json"
];

// Zorg dat de DB-map én lege bestanden bestaan (met optionele demo)
function ensureDbDir() {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    ENTITIES.forEach((file) => {
      const p = path.join(DB_DIR, file);
      if (!fs.existsSync(p)) {
        let demo = [];
        if (file === "email-templates.json") {
          demo = [
            {
              id: "tpl_demo1",
              naam: "Verjaardag hond",
              categorie: "Klant",
              trigger: "dog_birthday",
              onderwerp: "Proficiat met de verjaardag van {{hond_naam}}!",
              inhoud_html: "<p>Beste {{klant_naam}},<br>Vandaag viert {{hond_naam}} zijn verjaardag 🎉!</p>"
            }
          ];
        }
        if (file === "les-types.json") {
          demo = [
            {
              id: "lt_demo1",
              naam: "Puppy",
              aantal_lessen: 6,
              lesduur_min: 60,
              geldigheid_m: 6,
              max_deelnemers: 10,
              beschrijving: "Basiscursus voor pups."
            }
          ];
        }
        fs.writeFileSync(p, JSON.stringify(demo, null, 2), "utf8");
        console.log(`📂 Init: ${file} aangemaakt.`);
      }
    });
  } catch (e) {
    console.error("Kan DB-map/bestanden niet maken:", e.message);
  }
}
ensureDbDir();

const dbPath = (file) => path.join(DB_DIR, file);

function readDB(file) {
  try {
    const raw = fs.readFileSync(dbPath(file), "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Waarschuwing: kon ${file} niet lezen/parsen → [] (${e.message})`);
    return [];
  }
}

function writeDB(file, data) {
  try {
    fs.writeFileSync(dbPath(file), JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error(`Fout bij schrijven ${file}:`, e.message);
  }
}

// -------- API endpoints -------- //

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "superhond-webapp" });
});

// Generieke CRUD voor basis-entiteiten
["lessen", "boekingen", "klanten", "honden", "trainers", "locaties"].forEach(
  (entity) => {
    const file = `${entity}.json`;
    const base = `/api/${entity}`;

    app.get(base, (_req, res) => res.json(readDB(file)));

    app.post(base, (req, res) => {
      const list = readDB(file);
      const item = { id: Date.now().toString(), ...req.body };
      list.push(item);
      writeDB(file, list);
      res.status(201).json(item);
    });

    app.put(`${base}/:id`, (req, res) => {
      const list = readDB(file);
      const idx = list.findIndex((x) => x.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Not found" });
      list[idx] = { ...list[idx], ...req.body, id: req.params.id };
      writeDB(file, list);
      res.json(list[idx]);
    });

    app.delete(`${base}/:id`, (req, res) => {
      let list = readDB(file);
      const before = list.length;
      list = list.filter((x) => x.id !== req.params.id);
      if (list.length === before)
        return res.status(404).json({ error: "Not found" });
      writeDB(file, list);
      res.json({ ok: true });
    });
  }
);

// ---------- CRUD: Les Types ----------
(() => {
  const file = "les-types.json";
  const base = "/api/les-types";

  app.get(base, (_req, res) => res.json(readDB(file)));

  app.post(base, (req, res) => {
    const list = readDB(file);
    const item = { id: Date.now().toString(), ...req.body };
    list.push(item);
    writeDB(file, list);
    res.status(201).json(item);
  });

  app.put(`${base}/:id`, (req, res) => {
    const list = readDB(file);
    const idx = list.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    list[idx] = { ...list[idx], ...req.body, id: req.params.id };
    writeDB(file, list);
    res.json(list[idx]);
  });

  app.delete(`${base}/:id`, (req, res) => {
    let list = readDB(file);
    const before = list.length;
    list = list.filter((x) => x.id !== req.params.id);
    if (list.length === before)
      return res.status(404).json({ error: "Not found" });
    writeDB(file, list);
    res.json({ ok: true });
  });
})();

// ---------- CRUD: Email Templates ----------
(() => {
  const file = "email-templates.json";
  const base = "/api/email-templates";

  app.get(base, (_req, res) => res.json(readDB(file)));

  app.post(base, (req, res) => {
    const list = readDB(file);
    const item = { id: Date.now().toString(), ...req.body };
    list.push(item);
    writeDB(file, list);
    res.status(201).json(item);
  });

  app.put(`${base}/:id`, (req, res) => {
    const list = readDB(file);
    const idx = list.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    list[idx] = { ...list[idx], ...req.body, id: req.params.id };
    writeDB(file, list);
    res.json(list[idx]);
  });

  app.delete(`${base}/:id`, (req, res) => {
    let list = readDB(file);
    const before = list.length;
    list = list.filter((x) => x.id !== req.params.id);
    if (list.length === before)
      return res.status(404).json({ error: "Not found" });
    writeDB(file, list);
    res.json({ ok: true });
  });
})();

// ---------- Fallback naar frontend ---------- //
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Superhond server draait op http://localhost:${PORT}`);
});


// ...
app.use('/api/passes', require('./routes/passes'));   // <— NIEUW
app.use('/api/clients', require('./routes/clients'));
app.use('/api/dogs', require('./routes/dogs'));
// ...

