 1 // ---- Imports ----
 2 const express = require("express");
 3 const path = require("path");
 4 const customersRoutes = require("./routes/customers");
 5 const dogsRoutes = require("./routes/dogs");
 6 const passesRoutes = require("./routes/passes");
 7 
 8 // ---- App setup ----
 9 const app = express();
10 const PORT = process.env.PORT || 3000;
11 
12 // ---- Middleware ----
13 app.use(express.json());
14 app.use(express.urlencoded({ extended: true }));
15 
16 // ---- Static frontend ----
17 app.use(express.static(path.join(__dirname, "../public")));
18 
19 // ---- Routes ----
20 app.use("/api/customers", customersRoutes);
21 app.use("/api/dogs", dogsRoutes);
22 app.use("/api/passes", passesRoutes);
23 
24 // ---- Root ----
25 app.get("/", (req, res) => {
26   res.sendFile(path.join(__dirname, "../public/index.html"));
27 });
28 
29 // ---- Start server ----
30 app.listen(PORT, () => {
31   console.log(`🚀 Server running on port ${PORT}`);
32 });

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Routers
import customersRoutes from "./routes/customers.js";
 7 import lessonsRoutes from "./routes/lessons.js";
 8 import passesRoutes from "./routes/passes.js";

import passesRoutes from "./routes/passes.js";

// --- App setup (1x definiëren!) ---
const app = express();
app.use(express.json());

// API routes
app.use("/api/customers", customersRoutes);
app.use("/api/passes", passesRoutes);

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "superhond-backend" });
});

// (optioneel) statische frontend /public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "..", "public")));

// Root
app.get("/", (_req, res) => {
  res.send("✅ Superhond backend draait!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
