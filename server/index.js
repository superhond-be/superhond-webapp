import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";

import lestypesRoutes from "./routes/lestypes.js";
import themasRoutes from "./routes/themas.js";
import locatiesRoutes from "./routes/locaties.js";

app.use("/api/lestypes", lestypesRoutes);
app.use("/api/themas", themasRoutes);
app.use("/api/locaties", locatiesRoutes);
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// route-koppelingen
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);

app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});
// server/index.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// ==== jouw API-routes ====
import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";
import taxonomiesRoutes from "./routes/taxonomies.js"; // ✅ NIEUW

const app = express();
const PORT = process.env.PORT || 10000;

// middleware
app.use(cors());
app.use(bodyParser.json());
// public assets (frontend)
app.use(express.static("public"));

// healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ==== route-koppelingen ====
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/taxonomies", taxonomiesRoutes); // ✅ NIEUW

// opstart
app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});


