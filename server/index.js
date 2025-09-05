// server/index.js
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware om JSON bodies te kunnen lezen
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (public)
app.use(express.static(path.join(__dirname, "../public")));

// API routes
const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

// fallback – laat index.html zien voor onbekende routes in public
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Superhond server luistert op ${PORT}`);
});
