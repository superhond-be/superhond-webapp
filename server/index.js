// server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// ---- Routes importeren ----
import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";
import passesRoutes from "./routes/passes.js";
import lessonsRoutes from "./routes/lessons.js";
import settingsRoutes from "./routes/settings.js";
import integrationsRoutes from "./routes/integrations.js";
import lessonsRoutes from "./routes/lessons.js";
app.use("/api/lessons", lessonsRoutes);
// ---- Basis setup ----
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- API routes koppelen ----
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/settings", settingsRoutes);
app.use(integrationsRoutes); // deze definieert zelf /api/integrations/...

// ---- Static files (frontend) ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// ---- Health check ----
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ---- Server starten ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server draait op poort ${PORT}`);
});

// vervang je bestaande summary-handler door deze
async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GET ${url} -> ${r.status}`);
  return r.json();
}

router.get("/:cid/summary", async (req, res) => {
  try {
    const cid = Number(req.params.cid);
    const customer = (customers || []).find(c => c.id === cid);
    if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

    const lessons = await getJSON(`/api/lessons?customerId=${encodeURIComponent(cid)}`);

    res.json({
      customer,
      dogs: customer.dogs || [],
      passes: (customer.passes || []).map(p => ({
        ...p,
        remaining: Math.max(0, Number(p.totalStrips || 0) - Number(p.usedStrips || 0))
      })),
      lessons
    });
  } catch (e) {
    res.status(500).json({ error: "Kon klantenoverzicht niet laden", details: String(e?.message || e) });
  }
});
