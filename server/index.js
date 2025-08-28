

import classesRoutes from "./routes/classes.js";
import sessionsRoutes from "./routes/sessions.js";
app.use("/api/classes", classesRoutes);
app.use("/api/sessions", sessionsRoutes);
// server/routes/settings.js
import express from "express";
const router = express.Router();
import settingsRoutes from "./routes/settings.js";
app.use("/api/settings", settingsRoutes);

// Voor nu in-memory; later kun je dit bewaren in SQLite/DB.
let SETTINGS = {
  org: {
    naam: "Superhond",
    logoUrl: "",            // URL naar geüpload logo
    primaireKleur: "#1a73e8"
  },
  logic: {
    maxActieveReservatiesPerKlas: 2,
    annulatieUurgrens: 12,   // aantal uren vóór start dat kosteloos annuleren kan
    creditVerbruik: "ATTEND",// 'ATTEND' = pas verbruiken bij aanwezigheid
  },
  locaties: [
    // { id: 1, naam: "Dessel - Tabloo", maxDeelnemersDefault: 15, adres: "..." }
  ],
  agenda: {
    icsExportAan: true,
    persoonlijkeIcsAlleenEigenBoekingen: true,
    herinneringUrenVooraf: 24 // e-mail/push reminder
  },
  communicatie: {
    emailAfzenderNaam: "Superhond Team",
    emailAfzenderAdres: "info@superhond.be",
    whatsappAutomatischGroeperen: true   // later koppel je dit aan Google Sheet/Group
  },
  security: {
    rollen: ["ADMIN", "COACH"], // later per gebruiker opslaan
    privacyNotitie: "Gegevens worden enkel gebruikt voor lesregistraties."
  }
};

// Ophalen
router.get("/", (_req, res) => {
  res.json(SETTINGS);
});

// Updaten (volledige of gedeeltelijke update)
router.put("/", (req, res) => {
  const patch = req.body || {};
  SETTINGS = deepMerge(SETTINGS, patch);
  res.json(SETTINGS);
});

// Helper: diepe merge voor eenvoudige objecten/arrays
function deepMerge(target, source) {
  if (Array.isArray(source)) return source.slice();
  if (source && typeof source === "object") {
    const out = { ...target };
    for (const k of Object.keys(source)) {
      out[k] = deepMerge(target?.[k], source[k]);
    }
    return out;
  }
  return source === undefined ? target : source;
}

export default router;

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// importeer routes
import bookingsRoutes from "./routes/bookings.js";
import classesRoutes from "./routes/classes.js";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// gebruik routes
app.use("/api/bookings", bookingsRoutes);
app.use("/api/classes", classesRoutes);

app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});
