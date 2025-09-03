// server/index.js
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

// ---------- helpers ----------
const DB_DIR = path.join(__dirname, "db");
function loadJSON(name, fallback = []) {
  try {
    const p = path.join(DB_DIR, name);
    if (!fs.existsSync(p)) return fallback;
    const txt = fs.readFileSync(p, "utf8");
    return JSON.parse(txt);
  } catch (e) {
    console.error("JSON read error:", name, e.message);
    return fallback;
  }
}

// ---------- API ----------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "superhond-webapp" });
});

// Lessen (reeksen/lessoorten/instances — in dit voorbeeld één lijst)
app.get("/api/lessen", (_req, res) => res.json(loadJSON("lessen.json")));

// Boekingen (inschrijvingen)
app.get("/api/boekingen", (_req, res) => res.json(loadJSON("boekingen.json")));

// Basistabellen
app.get("/api/klanten", (_req, res) => res.json(loadJSON("klanten.json")));
app.get("/api/honden", (_req, res) => res.json(loadJSON("honden.json")));
app.get("/api/locaties", (_req, res) => res.json(loadJSON("locaties.json")));
app.get("/api/trainers", (_req, res) => res.json(loadJSON("trainers.json")));

// (optioneel) e-mailtemplates uit server (naast de localStorage variant)
app.get("/api/email-templates", (_req, res) => res.json(loadJSON("email-templates.json")));

// ---------- static ----------
app.use(express.static(path.join(__dirname, "..", "public")));

// Fallback naar index.html (laat staan, handig voor client routing)
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ Superhond server live op poort ${port}`);
});
