// [01]  // server/index.js  — ESM (package.json heeft "type": "module")
/* [02]  * Belangrijkste regels:
   [03]  * - Gebruik overal ESM imports (GEEN require).
   [04]  * - Eén keer 'import express from "express";' (geen dubbele declaraties).
   [05]  * - Alle API-routes hangen onder /api/...
   [06]  * - Statische frontend uit ./public
   [07]  */

 // ---------- Core & utils ----------
import express from "express";                      // [10]
import path from "path";                            // [11]
import { fileURLToPath } from "url";                // [12]

 // ---------- Routers ----------
 // Let op: deze bestanden moeten 'export default router' hebben.
import customersRoutes from "./routes/customers.js"; // [20]
import dogsRoutes       from "./routes/dogs.js";      // [21]
import passesRoutes     from "./routes/passes.js";    // [22]
import lessonsRoutes    from "./routes/lessons.js";   // [23]
import settingsRoutes   from "./routes/settings.js";  // [24]

 // ---------- __dirname helper (ESM) ----------
const __filename = fileURLToPath(import.meta.url);   // [30]
const __dirname  = path.dirname(__filename);         // [31]

 // ---------- App & basics ----------
const app  = express();                              // [40]
const PORT = process.env.PORT || 3000;               // [41]

app.use(express.json());                             // [44]
app.use(express.urlencoded({ extended: true }));     // [45]

 // ---------- CORS (simpel, indien nodig) ----------
app.use((req, res, next) => {                        // [50]
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

 // ---------- Static frontend ----------
const publicDir = path.join(__dirname, "..", "public"); // [60]
app.use(express.static(publicDir, { index: "index.html" }));

 // ---------- Health & info ----------
app.get("/healthz", (_req, res) => res.json({ ok: true })); // [66]
app.get("/api",     (_req, res) => res.json({ service: "superhond-api" })); // [67]

 // ---------- API routes ----------
app.use("/api/customers", customersRoutes);         // [70]
app.use("/api/dogs",      dogsRoutes);              // [71]
app.use("/api/passes",    passesRoutes);            // [72]
app.use("/api/lessons",   lessonsRoutes);           // [73]
app.use("/api/settings",  settingsRoutes);          // [74]

 // ---------- SPA fallback (optioneel) ----------
app.get("*", (req, res, next) => {                  // [80]
  // Als het geen API-call is en geen bestaand bestand, stuur index.html
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(publicDir, "index.html"));
});

 // ---------- Foutafhandeling ----------
app.use((err, _req, res, _next) => {                // [90]
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

 // ---------- Start server ----------
app.listen(PORT, () => {                             // [96]
  console.log(`Server running on port ${PORT}`);
});

export default app;                                  // [100]
