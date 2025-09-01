// server/index.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// --- Imports van routes ---
import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";
import passesRoutes from "./routes/passes.js";
import lessonsRoutes from "./routes/lessons.js";
import settingsRoutes from "./routes/settings.js";

// --- App setup ---
const app = express();
app.use(cors());
app.use(express.json());

// Bepaal __dirname (nodig bij ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Koppel routes ---
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/settings", settingsRoutes);

// --- Public folder (frontend) ---
app.use(express.static(path.join(__dirname, "../public")));

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
