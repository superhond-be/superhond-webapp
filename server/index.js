// server/index.js
// Superhond.be Admin backend (Express + JSON files) — SAFE IO

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

// ---------- FS helpers (SAFE) ----------
const DB_DIR = path.join(__dirname, "db");

// Zorg dat de DB-map bestaat
function ensureDbDir() {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  } catch (e) {
    console.error("Kan DB-map niet maken:", e.message);
  }
}
ensureDbDir();

const dbPath = (file) => path.join(DB_DIR, file);

// Lezen met fallbacks (retourneert altijd [] bij problemen)
function readDB(file) {
  try {
    ensureDbDir();
    const p = dbPath(file);
    if (!fs.existsSync(p)) return [];
    const raw = fs.readFileSync(p, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Waarschuwing: kon ${file} niet lezen/parsen → [] (${e.message})`);
    return [];
  }
}

// Schrijven (maakt bestand aan als het nog niet bestond)
function writeDB(file, data) {
  try {
    ensureDbDir();
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

// Generieke CRUD (lessen, boekingen, klanten, honden, trainers, locaties)
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

// GET all
app.get(emailBase, (_req, res) => res.json(readDB(emailFile)));

// POST new
app.post(emailBase, (req, res) => {
  const list = readDB(emailFile);
  const item = { id: Date.now().toString(), ...req.body };
  list.push(item);
  writeDB(emailFile, list);
  res.status(201).json(item);
});

// PUT update
app.put(`${emailBase}/:id`, (req, res) => {
  const list = readDB(emailFile);
  const idx = list.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  list[idx] = { ...list[idx], ...req.body, id: req.params.id };
  writeDB(emailFile, list);
  res.json(list[idx]);
});

// DELETE
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
