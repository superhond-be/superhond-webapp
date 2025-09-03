// server/index.js
// CommonJS versie (werkt met require, geen ESM)

// Basis
const express = require("express");
const path = require("path");
const fs = require("fs");

// Setup
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());

// Public map serveren
app.use(express.static(path.join(__dirname, "..", "public")));

// Helpers voor JSON-db
const dbPath = (file) => path.join(__dirname, "db", file);

function readDB(file) {
  try {
    return JSON.parse(fs.readFileSync(dbPath(file), "utf8"));
  } catch {
    return [];
  }
}

function writeDB(file, data) {
  fs.writeFileSync(dbPath(file), JSON.stringify(data, null, 2));
}

// -------- API endpoints -------- //

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "superhond-webapp" });
});

// Generieke CRUD (voorbeeld voor lessen/boekingen/etc.)
["lessen", "boekingen", "klanten", "honden", "trainers", "locaties"].forEach(
  (entity) => {
    const file = `${entity}.json`;
    const base = `/api/${entity}`;

    // GET all
    app.get(base, (req, res) => {
      res.json(readDB(file));
    });

    // POST new
    app.post(base, (req, res) => {
      const list = readDB(file);
      const item = { id: Date.now().toString(), ...req.body };
      list.push(item);
      writeDB(file, list);
      res.json(item);
    });

    // PUT update
    app.put(`${base}/:id`, (req, res) => {
      const list = readDB(file);
      const idx = list.findIndex((x) => x.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: "Not found" });
      list[idx] = { ...list[idx], ...req.body };
      writeDB(file, list);
      res.json(list[idx]);
    });

    // DELETE
    app.delete(`${base}/:id`, (req, res) => {
      let list = readDB(file);
      const before = list.length;
      list = list.filter((x) => x.id !== req.params.id);
      if (list.length === before)
        return res.status(404).json({ error: "Not found" });
      writeDB(file, list);
      res.json({ ok: true });
    });
  }
);

// Fallback naar index.html (SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Superhond server draait op http://localhost:${PORT}`);
});
