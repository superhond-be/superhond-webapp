// BOVENAAN BIJ DE OVERIGE IMPORTS
import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";

// … je bestaande express app, middleware, etc.

// ROUTE-KOPPELINGEN (één keer, alleen hier)
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);

// healthcheck blijft zoals je hem had:
// app.get("/api/health", (_req, res) => res.json({ ok: true }));
