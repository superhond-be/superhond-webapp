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

// Public map serveren
app.use(express.static(path.join(__dirname, "..", "public")));

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
  "email-templates.json",
];

// Zorg dat de DB-map én lege bestanden bestaan
function ensureDbDir() {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    ENTITIES.forEach((file) => {
      const p = path.join(DB_DIR, file);
      if (!fs.existsSync(p)) {
        fs.writeFileSync(p, "[]", "utf8");
        console.log(`📂 Init: ${file} aangemaakt (leeg).`);
      }
    });
  } catch (e) {
    console.error("Kan DB-map/bestanden niet maken:", e.message);
  }
}
ensureDbDir();

const dbPath = (file) => path.join(DB_DIR, file);

// Lezen met fallbacks
function readDB(file) {
  try {
    const raw = fs.readFileSync(dbPath(file), "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Waarschuwing: kon ${file} niet lezen/parsen → [] (${e.message})`);
    return [];
  }
}

// Schrijven
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

// Generieke CRUD voor alle entities behalve e-mail
["lessen", "boekingen", "klanten", "honden", "trainers", "locaties"].forEach(
  (entity) => {
    const file = `${entity}.json`;
    const base = `/api/${entity}`;

    // GET all
    app.get(base, (_req, res) => res.json(readDB(file)));

    // POST new
    app.post(base, (req, res) => {
      const list = readDB(file);
      const item = { id: Date.now().toString(), ...req.body };
      list.push(item);
      writeDB(file, list);
      res.status(201).json(item);
    });

    // PUT update
    app.put(`${base}/:id`, (req, res) => {
      const list = readDB(file);
      const idx = list.findIndex((x) => x.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Not found" });
      list[idx] = { ...list[idx], ...req.body, id: req.params.id };
      writeDB(file, list);
      res.json(list[idx]);
    });

    // DELETE
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

// ---------- CRUD: Email Templates ----------
const emailFile = "email-templates.json";
const emailBase = "/api/email-templates";

app.get(emailBase, (_req, res) => res.json(readDB(emailFile)));

app.post(emailBase, (req, res) => {
  const list = readDB(emailFile);
  const item = { id: Date.now().toString(), ...req.body };
  list.push(item);
  writeDB(emailFile, list);
  res.status(201).json(item);
});

app.put(`${emailBase}/:id`, (req, res) => {
  const list = readDB(emailFile);
  const idx = list.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  list[idx] = { ...list[idx], ...req.body, id: req.params.id };
  writeDB(emailFile, list);
  res.json(list[idx]);
});

app.delete(`${emailBase}/:id`, (req, res) => {
  let list = readDB(emailFile);
  const before = list.length;
  list = list.filter((x) => x.id !== req.params.id);
  if (list.length === before)
    return res.status(404).json({ error: "Not found" });
  writeDB(emailFile, list);
  res.json({ ok: true });
});

// ---------- Fallback naar frontend ---------- //
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Superhond server draait op http://localhost:${PORT}`);
});
