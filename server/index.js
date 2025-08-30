// server/index.js (alleen relevante delen)
import customersRoutes from "./routes/customers.js";
app.use("/api/customers", customersRoutes);
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";
import registerRoutes from "./routes/register.js"; // <— NIEUW

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// API
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/register", registerRoutes); // <— NIEUW

// health & root
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "..", "public", "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
