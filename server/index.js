import express from "express";

import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";
import settingsRoutes from "./routes/settings.js";
import lessonTypesRoutes from "./routes/lessonTypes.js";
import themesRoutes from "./routes/themes.js";
import locationsRoutes from "./routes/locations.js";
import passesRoutes from "./routes/passes.js";
import bookingsRoutes from "./routes/bookings.js";



const app = express();


// API
app.use(express.json());
app.use("/api/lesson-types", lessonTypesRoutes);
app.use("/api/themes", themesRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/passes", passesRoutes);
app.use("/api/bookings", bookingsRoutes);

    
// statics
app.use(express.static("public"));

// health + frontend entry
app.get("/", (_req, res) => res.send("✅ Superhond backend draait!"));
app.get("/app", (_req, res) => res.sendFile(process.cwd() + "/public/index.html"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

export default app;
