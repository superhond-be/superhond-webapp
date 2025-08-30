// server/index.js
import express from "express";
import customersRoutes from "./routes/customers.js";
import dogsRoutes from "./routes/dogs.js";

const app = express();
app.use(express.json());

// routes koppelen
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);

// healthcheck
app.get("/", (_req, res) => res.send("✅ Superhond backend draait!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export default app;
