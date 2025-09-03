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

function getLesById(lessen, id) {
  return lessen.find(l => l.id === id);
}
function isBevestigd(status) {
  return (status || "").toLowerCase() === "bevestigd";
}

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

  // Optioneel: bij verwijderen van les zou je gekoppelde boekingen kunnen checken.
  // Voor simpelheid laten we dat hier achterwege.

  saveJSON("lessen.json", list);
  res.json({ ok: true, removed });
});

// ---------- CRUD: Boekingen (met capaciteit-bewaking) ----------
app.post("/api/boekingen", (req, res) => {
  const boekingen = loadJSON("boekingen.json");
  const lessen = loadJSON("lessen.json");
  const { les_id, klant_id, hond_id, status = "bevestigd", datum } = req.body || {};
  if (!les_id || !klant_id || !hond_id) {
    return res.status(400).json({ error: "les_id, klant_id en hond_id zijn verplicht." });
  }
  const les = getLesById(lessen, les_id);
  if (!les) return res.status(400).json({ error: "Onbekende les_id" });

  // Capaciteit check alleen voor bevestigde boekingen
  if (isBevestigd(status)) {
    const cap = Number(les.capaciteit ?? 0);
    const bez = Number(les.bezet ?? 0);
    if (cap > 0 && bez >= cap) {
      return res.status(400).json({ error: "Les is vol" });
    }
    // reserveer plek
    les.bezet = bez + 1;
    saveJSON("lessen.json", lessen);
  }

  const item = { id: "bk_" + uid(), les_id, klant_id, hond_id, status, datum: datum || null };
  boekingen.push(item);
  saveJSON("boekingen.json", boekingen);
  res.status(201).json(item);
});

app.put("/api/boekingen/:id", (req, res) => {
  const boekingen = loadJSON("boekingen.json");
  const lessen = loadJSON("lessen.json");
  const idx = boekingen.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Boeking niet gevonden" });

  const prev = boekingen[idx];
  const { les_id, klant_id, hond_id, status, datum } = req.body || {};

  const oldLes = getLesById(lessen, prev.les_id);
  const newLes = getLesById(lessen, les_id ?? prev.les_id);

  // Aanpassingen in bezetting:
  const wasBevestigd = isBevestigd(prev.status);
  const wordtBevestigd = isBevestigd(status ?? prev.status);
  const lesWijzigt = (les_id && les_id !== prev.les_id);

  // 1) als status of les verandert → corrigeer bezetting
  if (wasBevestigd && (!wordtBevestigd || lesWijzigt)) {
    if (oldLes && oldLes.bezet > 0) oldLes.bezet = Number(oldLes.bezet) - 1;
  }
  if ((!wasBevestigd && wordtBevestigd) || (lesWijzigt && wordtBevestigd)) {
    if (!newLes) return res.status(400).json({ error: "Onbekende nieuwe les_id" });
    const cap = Number(newLes.capaciteit ?? 0);
    const bez = Number(newLes.bezet ?? 0);
    if (cap > 0 && bez >= cap) {
      return res.status(400).json({ error: "Les is vol" });
    }
    newLes.bezet = bez + 1;
  }

  // 2) sla boeking op
  boekingen[idx] = {
    ...prev,
    les_id: les_id ?? prev.les_id,
    klant_id: klant_id ?? prev.klant_id,
    hond_id: hond_id ?? prev.hond_id,
    status: status ?? prev.status,
    datum: datum ?? prev.datum
  };

  saveJSON("lessen.json", lessen);
  saveJSON("boekingen.json", boekingen);
  res.json(boekingen[idx]);
});

app.delete("/api/boekingen/:id", (req, res) => {
  const boekingen = loadJSON("boekingen.json");
  const lessen = loadJSON("lessen.json");
  const idx = boekingen.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Boeking niet gevonden" });

  const removed = boekingen.splice(idx, 1)[0];
  // enkel bij bevestigde boeking bezetting verlagen
  if (removed && isBevestigd(removed.status)) {
    const les = getLesById(lessen, removed.les_id);
    if (les && les.bezet > 0) les.bezet = Number(les.bezet) - 1;
    saveJSON("lessen.json", lessen);
  }

  saveJSON("boekingen.json", boekingen);
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
