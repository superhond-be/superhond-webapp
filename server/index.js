// server/index.js
const express = require("express");
const path = require("path");

const app = express();

// Zorg dat alles in /public bereikbaar is
app.use(express.static(path.join(__dirname, "..", "public")));

// (optioneel) voorbeeld-API endpoint, later uit te breiden
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "superhond-webapp" });
});

// Fallback: altijd index.html tonen bij onbekende route
// (handig als je client-side routing zou gebruiken)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Start server
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`✅ Superhond server live op poort ${port}`);
});
