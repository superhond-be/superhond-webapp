import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";


import lestypesRoutes from "./routes/lestypes.js";
import themasRoutes from "./routes/themas.js";
import locatiesRoutes from "./routes/locaties.js";

;


app.use("/api/lesson-types", lessonTypesRoutes);
app.use("/api/themes", themesRoutes);
app.use("/api/locations", locationsRoutes);



const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// route-koppelingen
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);

app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});


// ==== jouw API-routes ====
import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";
import taxonomiesRoutes from "./routes/taxonomies.js"; // ✅ NIEUW

const app = express();
const PORT = process.env.PORT || 10000;

// middleware
app.use(cors());
app.use(bodyParser.json());
// public assets (frontend)
app.use(express.static("public"));

// healthcheck
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ==== route-koppelingen ====
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/taxonomies", taxonomiesRoutes); // ✅ NIEUW
<hr />
<h2>Instellingen</h2>

<nav style="margin-bottom:12px;">
  <button onclick="showPanel('lestypes')">Lestypes</button>
  <button onclick="showPanel('themas')">Thema's</button>
  <button onclick="showPanel('locaties')">Locaties</button>
</nav>

<!-- LESTYPES -->
<section id="panel-lestypes" class="admin-panel" style="display:none">
  <h3>Lestypes</h3>

  <form id="form-lestype" onsubmit="return createLestype(event)">
    <input name="name" placeholder="Naam" required />
    <input name="description" placeholder="Omschrijving" />
    <button type="submit">Toevoegen</button>
  </form>

  <ul id="list-lestypes" class="list"></ul>
</section>

<!-- THEMA'S -->
<section id="panel-themas" class="admin-panel" style="display:none">
  <h3>Thema's</h3>

  <form id="form-thema" onsubmit="return createThema(event)">
    <input name="name" placeholder="Naam" required />
    <input name="description" placeholder="Omschrijving" />
    <button type="submit">Toevoegen</button>
  </form>

  <ul id="list-themas" class="list"></ul>
</section>

<!-- LOCATIES -->
<section id="panel-locaties" class="admin-panel" style="display:none">
  <h3>Locaties</h3>

  <form id="form-locatie" onsubmit="return createLocatie(event)">
    <input name="name" placeholder="Naam" required />
    <input name="address" placeholder="Adres" />
    <input name="postcode" placeholder="Postcode" />
    <input name="city" placeholder="Plaats" />
    <input name="description" placeholder="Beschrijving" />
    <button type="submit">Toevoegen</button>
  </form>

  <ul id="list-locaties" class="list"></ul>
</section>

<style>
  .list { padding-left: 0; list-style: none; }
  .list li { display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom: 1px solid #eee; }
  .list li small { opacity:.7 }
  .list button { margin-left:auto }
</style>
// opstart
app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});


