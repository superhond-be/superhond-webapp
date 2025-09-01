// ---- Imports ----
const express = require("express");
const path = require("path");
const fs = require("fs");

// Routes (zorg dat deze bestanden bestaan)
const customersRoutes = require("./routes/customers");
const dogsRoutes = require("./routes/dogs");
const passesRoutes = require("./routes/passes");

// ---- App init ----
const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Zorg dat de uploads-map bestaat (voor hondenfoto’s)
const uploadsDir = path.join(__dirname, "../uploads");
try { if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir); } catch {}

// Public frontend files
app.use(express.static(path.join(__dirname, "../public")));
// Geuploade foto’s publiek bereikbaar maken
app.use("/uploads", express.static(uploadsDir));

// ---- API routes ----
app.use("/api/customers", customersRoutes);
app.use("/api/dogs", dogsRoutes);
app.use("/api/passes", passesRoutes);

// Healthcheck
app.get("/health", (_req, res) => res.json({ ok: true }));

// Root → index.html
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`🚀 Superhond server draait op poort ${PORT}`);
});

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
