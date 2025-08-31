// server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// --- Project routes (altijd aanwezig) ---
import customersRoutes from "./routes/customers.js";
import lessonsRoutes from "./routes/lessons.js";

// __dirname opzetten (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App
const app = express();

// Render/Proxy: correcte IP & HTTPS headers vertrouwen
app.set("trust proxy", true);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Static files (frontend)
const publicDir = path.resolve(__dirname, "../public");
app.use(express.static(publicDir));

// -------------------- Healthcheck --------------------
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "superhond",
    version: "1.0.0",
    time: new Date().toISOString(),
  });
});

// -------------------- API routes --------------------
// Verplichte routes
app.use("/api/customers", customersRoutes);
app.use("/api/lessons", lessonsRoutes);

// Optionele routes (alleen mounten als bestand bestaat)
const mountOptional = async (routePath, mountAt) => {
  try {
    const mod = await import(routePath);
    const router = mod.default || mod;
    if (router) {
      app.use(mountAt, router);
      console.log(`[routes] mounted ${mountAt} from ${routePath}`);
    }
  } catch (e) {
    // Stil overslaan als bestand niet bestaat
    if (String(e?.message || e).includes("Cannot find module")) {
      console.log(`[routes] optional ${routePath} not found – skipped`);
    } else {
      console.warn(`[routes] failed to mount ${routePath}:`, e.message || e);
    }
  }
};

// Probeer optioneel te mounten (alleen als je deze files hebt)
await mountOptional("./routes/dogs.js", "/api/dogs");
await mountOptional("./routes/passes.js", "/api/passes");
await mountOptional("./routes/classes.js", "/api/classes");
await mountOptional("./routes/sessions.js", "/api/sessions");
await mountOptional("./routes/settings.js", "/api/settings");

// -------------------- API 404 handler --------------------
app.use("/api", (_req, res, _next) => {
  res.status(404).json({ error: "API endpoint niet gevonden" });
});

// -------------------- Frontend fallback --------------------
// Zorgt dat refreshen in de browser op een route gewoon index.html serveert
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// -------------------- Start server --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Superhond server luistert op http://localhost:${PORT}`);
});
