// server/index.js
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

// ---------- helpers ----------
const DB_DIR = path.join(__dirname, "db");
function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
}
function loadJSON(name, fallback = []) {
  try {
    ensureDbDir();
    const p = path.join(DB_DIR, name);
    if (!fs.existsSync(p)) return fallback;
    const txt = fs.readFileSync(p, "utf8");
    return JSON.parse(txt);
  } catch (e) {
    console.error("JSON read error:", name, e.message);
    return fallback;
  }
}
function saveJSON(name, data) {
  ensureDbDir();
  const p = path.join(DB_DIR, name);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
}
const uid = () => Math.random().toString(36).slice(2, 10);

// ---------- API (read) ----------
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "superhond-webapp" }));
app.get("/api/lessen",   (_req, res) => res.json(loadJSON("lessen.json")));
app.get("/api/boekingen",(_req, res) => res.json(loadJSON("boekingen.json")));
app.get("/api/klanten",  (_req, res) => res.json(loadJSON("klanten.json")));
app.get("/api/honden",   (_req, res) => res.json(loadJSON("honden.json")));
app.get("/api/locaties", (_req, res) => res.json(loadJSON("locaties.json")));
app.get("/api/trainers", (_req, res) => res.json(loadJSON("trainers.json")));
app.get("/api/email-templates", (_req, res) => res.json(loadJSON("email-templates.json")));

// ---------- CRUD: Lessen ----------
app.post("/api/lessen", (req, res) => {
  const list = loadJSON("lessen.json");
  const { naam, type, trainer_id, locatie_id, start, capaciteit, bezet = 0, status = "actief" } = req.body || {};
  if (!naam || !trainer_id || !locatie_id || !start) {
    return res.status(400).json({ error: "naam, trainer_id, locatie_id en start zijn verplicht." });
  }
  const item = {
    id: "ls_" + uid(),
    naam, type: type || "", trainer_id, locatie_id,
    start, capaciteit: Number(capaciteit ?? 0), bezet: Number(bezet ?? 0),
    status
  };
  list.push(item);
  saveJSON("lessen.json", list);
  res.status(201).json(item);
});

app.put("/api/lessen/:id", (req, res) => {
  const list = loadJSON("lessen.json");
  const idx = list.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Les niet gevonden" });
  const prev = list[idx];
  const { naam, type, trainer_id, locatie_id, start, capaciteit, bezet, status } = req.body || {};
  list[idx] = {
    ...prev,
    naam: naam ?? prev.naam,
    type: type ?? prev.type,
    trainer_id: trainer_id ?? prev.trainer_id,
    locatie_id: locatie_id ?? prev.locatie_id,
    start: start ?? prev.start,
    capaciteit: (capaciteit ?? prev.capaciteit),
    bezet: (bezet ?? prev.bezet),
    status: status ?? prev.status
  };
  saveJSON("lessen.json", list);
  res.json(list[idx]);
});

app.delete("/api/lessen/:id", (req, res) => {
  const list = loadJSON("lessen.json");
  const idx = list.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Les niet gevonden" });
  const [removed] = list.splice(idx, 1);
  saveJSON("lessen.json", list);
  res.json({ ok: true, removed });
});

// ---------- CRUD: Boekingen (reeds aanwezig, laten staan) ----------
app.post("/api/boekingen", (req, res) => {
  const list = loadJSON("boekingen.json");
  const { les_id, klant_id, hond_id, status = "bevestigd", datum } = req.body || {};
  if (!les_id || !klant_id || !hond_id) {
    return res.status(400).json({ error: "les_id, klant_id en hond_id zijn verplicht." });
  }
  const item = { id: "bk_" + uid(), les_id, klant_id, hond_id, status, datum: datum || null };
  list.push(item);
  saveJSON("boekingen.json", list);
  res.status(201).json(item);
});

app.put("/api/boekingen/:id", (req, res) => {
  const list = loadJSON("boekingen.json");
  const idx = list.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Boeking niet gevonden" });
  const prev = list[idx];
  const { les_id, klant_id, hond_id, status, datum } = req.body || {};
  list[idx] = { ...prev, les_id: les_id ?? prev.les_id, klant_id: klant_id ?? prev.klant_id, hond_id: hond_id ?? prev.hond_id, status: status ?? prev.status, datum: datum ?? prev.datum };
  saveJSON("boekingen.json", list);
  res.json(list[idx]);
});

app.delete("/api/boekingen/:id", (req, res) => {
  const list = loadJSON("boekingen.json");
  const idx = list.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Boeking niet gevonden" });
  const [removed] = list.splice(idx, 1);
  saveJSON("boekingen.json", list);
  res.json({ ok: true, removed });
});

// ---------- static ----------
app.use(express.static(path.join(__dirname, "..", "public")));

// Fallback naar index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`✅ Superhond server live op poort ${port}`));
