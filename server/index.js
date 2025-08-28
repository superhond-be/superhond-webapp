import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";

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
