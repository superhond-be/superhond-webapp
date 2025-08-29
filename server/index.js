import express from "express";
import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";
import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";



const app = express();
app.use(express.json());

// Routes koppelen
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);

// Healthcheck

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Start server (Render neemt poort uit env var)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
export default router;
