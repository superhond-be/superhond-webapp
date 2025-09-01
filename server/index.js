// server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
// bovenaan bij de imports
import searchRoutes from "./routes/search.js";



// ⤵️ Optioneel: alleen gebruiken als je een routes/debug.js hebt
import debugRoutes from "./routes/debug.js";

// __dirname voor ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App
const app = express();
app.use(express.json());

// ... na app en middleware:
app.use("/api/search", searchRoutes);

// Static frontend (public/)
app.use(express.static(path.join(__dirname, "..", "public")));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Debug endpoints (optioneel)
if (debugRoutes) {
  app.use("/debug", debugRoutes);
}

// SPA fallback naar public/index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

export default app;
