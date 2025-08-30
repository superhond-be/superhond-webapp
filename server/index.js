// server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Nodig om __dirname te gebruiken in ES-modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// ---- Static files (frontend) ----
app.use(express.static(path.join(__dirname, "..", "public")));

// ---- API routes ----
// Voorbeeld: voeg hier je eigen routes toe als ze bestaan
// import customersRoutes from "./routes/customers.js";
// import dogsRoutes from "./routes/dogs.js";

// app.use("/api/customers", customersRoutes);
// app.use("/api/dogs", dogsRoutes);

// ---- Healthcheck ----
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Superhond backend draait!" });
});

// ---- Root: index.html ----
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// ---- Start server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
