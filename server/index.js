// server/index.js

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files uit public-map
app.use(express.static(path.join(__dirname, "../public")));

// Basis route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server draait correct 🚀" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
