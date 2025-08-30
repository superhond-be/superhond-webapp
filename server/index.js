import express from "express";

import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";
import settingsRoutes from "./routes/settings.js";

const app = express();
app.use(express.json());

// API
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/settings", settingsRoutes);

// statics
app.use(express.static("public"));

// health + frontend entry
app.get("/", (_req, res) => res.send("✅ Superhond backend draait!"));
app.get("/app", (_req, res) => res.sendFile(process.cwd() + "/public/index.html"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

export default app;
