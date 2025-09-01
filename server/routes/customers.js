// server/index.js

// 1. Basis imports
const express = require("express");
const path = require("path");

// 2. Routes importeren (gebruik require in plaats van import)
const customersRoutes = require("./routes/customers.js");
const dogsRoutes = require("./routes/dogs.js");
const passesRoutes = require("./routes/passes.js");

// 3. App aanmaken
const app = express();

// 4. Middleware
app.use(express.json()); // voor JSON body parsing
app.use(express.urlencoded({ extended: true })); // voor form-data

// 5. Routes koppelen
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);

// 6. Statische bestanden (frontend)
app.use(express.static(path.join(__dirname, "../public")));

// 7. Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
