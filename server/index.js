// server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";

const app = express();
app.use(express.json());

// --- STATIC FRONTEND SERVEN ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));
app.get("/", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));
// --------------------------------

app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export default app;
