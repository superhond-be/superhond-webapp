// server/index.js  — CommonJS (require) versie

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

/* ---------------------------- Middleware ---------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files uit /public
const PUBLIC_DIR = path.join(__dirname, "..", "public");
app.use(express.static(PUBLIC_DIR));

/* ----------------------------- Helpers ------------------------------ */
// Probeer een router-bestand conditioneel te laden;
// als het ontbreekt of export fout is, blijven we netjes draaien.
function tryMount(routePath, mountAt) {
  try {
    const mod = require(routePath);

    // Sta zowel `module.exports = router` als `{ router }` of `{ default }` toe
    const candidate =
      (mod && mod.router) ||
      (mod && mod.default) ||
      mod;

    if (typeof candidate === "function") {
      app.use(mountAt, candidate);
      console.log(`✅ Mounted ${routePath} at ${mountAt}`);
    } else {
      console.warn(
        `⚠️  ${routePath} gevonden maar export is geen Express router. Overgeslagen.`
      );
    }
  } catch (err) {
    if (err.code === "MODULE_NOT_FOUND") {
      console.warn(`ℹ️  ${routePath} niet gevonden. Sla mounting over.`);
    } else {
      console.warn(`⚠️  Fout bij laden van ${routePath}:`, err.message);
    }
  }
}

/* ------------------------------ Routes ----------------------------- */
// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server draait correct 🚀" });
});

// (Optioneel) API-routers – alleen gemount als het bestand bestaat
tryMount(path.join(__dirname, "routes", "customers.js"), "/api/customers");
tryMount(path.join(__dirname, "routes", "dogs.js"), "/api/dogs");
tryMount(path.join(__dirname, "routes", "passes.js"), "/api/passes");
tryMount(path.join(__dirname, "routes", "lessons.js"), "/api/lessons");

/* ----------------------------- Fallback ---------------------------- */
// Als geen API-route matcht, serveer frontend (index.html) voor SPA/landing
app.get("*", (req, res, next) => {
  // voorkom dat niet-bestaande api-paden index.html teruggeven
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

/* --------------------------- Start server -------------------------- */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
