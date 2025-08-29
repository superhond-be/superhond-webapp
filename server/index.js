// --- core ---
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// --- routes (elk precies één keer importeren) ---
import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";
import lessonTypesRoutes from "./routes/lessonTypes.js";
import themesRoutes from "./routes/themes.js";
import locationsRoutes from "./routes/locations.js";

// --- app setup ---
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// --- healthcheck ---
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// --- route mounting (elk precies één keer koppelen) ---
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/lesson-types", lessonTypesRoutes);
app.use("/api/themes", themesRoutes);
app.use("/api/locations", locationsRoutes);

// --- 404 fallback voor onbekende API-routes ---
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// --- start server ---
app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});
