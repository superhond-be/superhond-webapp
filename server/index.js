// server/index.js
import express from "express";

// ROUTES importeren (maar niets dubbel!)
import customersRoutes, { CUSTOMERS } from "./routes/customers.js";
import dogsRoutes, { setCustomersRef as setDogsCustomersRef } from "./routes/dogs.js";
import passesRoutes, { setCustomersRef as setPassesCustomersRef } from "./routes/passes.js";
// (optioneel) settingsRoutes als je die hebt:
// import settingsRoutes from "./routes/settings.js";

const app = express();
app.use(express.json());

// simple health
app.get("/", (_req, res) => res.send("Superhond backend draait!"));

// routes koppelen
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);
// app.use("/api/settings", settingsRoutes);

// **gedeelde referentie** naar klanten doorgeven aan modules die dat nodig hebben
setDogsCustomersRef(CUSTOMERS);
setPassesCustomersRef(CUSTOMERS);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
