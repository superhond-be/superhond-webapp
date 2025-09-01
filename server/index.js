const express = require("express");
const path = require("path");

const customersRoutes = require("./routes/customers");
const dogsRoutes = require("./routes/dogs");
const passesRoutes = require("./routes/passes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend bestanden (public map)
app.use(express.static(path.join(__dirname, "../public")));

// API routes
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);

// Root naar index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
