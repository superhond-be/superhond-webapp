import express from "express";
import {
  bookings, clients, packages, sessions, classes,
  getSessionById, getClientById, getPackage,
  MAX_ACTIVE_RES, defaultCapacity
} from "../data/store.js";

const router = express.Router();

// Helpers
function parseDateParts(dateStr, timeStr) {
  // "YYYY-MM-DD", "HH:MM" -> Date
  const [y,m,d] = dateStr.split("-").map(Number);
  const [hh,mm] = (timeStr || "00:00").split(":").map(Number);
  return new Date(Date.UTC(y, m-1, d, hh, mm));
}

function isFutureSession(session) {
  const dt = parseDateParts(session.date, session.start);
  return dt.getTime() > Date.now();
}

function sessionCapacity(sessionId) {
  const s = getSessionById(sessionId);
  return s?.capacity ?? defaultCapacity;
}

function currentReservedCount(sessionId) {
  return bookings.filter(b => b.sessionId === Number(sessionId) && (b.status === "RESERVED" || b.status === "ATTENDED")).length;
}

// Lijst (optionele filters: ?clientId= & ?sessionId=)
router.get("/", (req, res) => {
  const { clientId, sessionId } = req.query;
  let data = bookings;
  if (clientId)  data = data.filter(b => b.clientId === Number(clientId));
  if (sessionId) data = data.filter(b => b.sessionId === Number(sessionId));
  res.json(data);
});

// Boeken (reserve), GEEN credit verbruik
router.post("/", (req, res) => {
  const { clientId, sessionId } = req.body || {};
  const client = getClientById(clientId);
  const session = getSessionById(sessionId);
  if (!client || !session) return res.status(400).json({ error: "Ongeldige clientId of sessionId" });

  // Heeft klant een geldig pakket voor deze klas?
  const pkg = getPackage(clientId, session.classId);
  if (!pkg) return res.status(400).json({ error: "Geen pakket voor deze klas" });

  // Geldig tot?
  if (pkg.valid_until && session.date > pkg.valid_until) {
    return res.status(400).json({ error: "Pakket niet meer geldig voor deze datum" });
  }

  // Max 2 toekomstige reserveringen per klant per klas
  const futureRes = bookings.filter(b =>
    b.clientId === Number(clientId) &&
    b.classId === session.classId &&
    b.status === "RESERVED" &&
    isFutureSession(getSessionById(b.sessionId))
  ).length;
  if (futureRes >= MAX_ACTIVE_RES) {
    return res.status(400).json({ error: `Max ${MAX_ACTIVE_RES} toekomstige reservaties voor deze klas bereikt` });
  }

  // Capaciteit check
  const cap = sessionCapacity(sessionId);
  if (currentReservedCount(sessionId) >= cap) {
    return res.status(400).json({ error: "Sessie volgeboekt" });
  }

  const id = bookings.length ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
  const created = {
    id,
    clientId: Number(clientId),
    classId: session.classId,
    sessionId: Number(sessionId),
    status: "RESERVED", // geen credit verbruikt
    createdAt: new Date().toISOString()
  };
  bookings.push(created);
  res.status(201).json(created);
});

// Annuleren (vooraf): geen credit verbruik
router.post("/:id/cancel", (req, res) => {
  const b = bookings.find(x => x.id === Number(req.params.id));
  if (!b) return res.status(404).json({ error: "Boeking niet gevonden" });
  if (b.status !== "RESERVED") {
    return res.status(400).json({ error: "Alleen RESERVED boekingen kunnen geannuleerd worden" });
  }
  b.status = "CANCELLED";
  b.cancelledAt = new Date().toISOString();
  res.json({ ok: true, id: b.id, status: b.status });
});

// Aanwezig markeren: verbruikt 1 credit
router.post("/:id/attend", (req, res) => {
  const b = bookings.find(x => x.id === Number(req.params.id));
  if (!b) return res.status(404).json({ error: "Boeking niet gevonden" });
  if (b.status !== "RESERVED") {
    return res.status(400).json({ error: "Alleen RESERVED boekingen kunnen als ATTENDED gemarkeerd worden" });
  }

  const pkg = getPackage(b.clientId, b.classId);
  if (!pkg) return res.status(400).json({ error: "Geen pakket gevonden" });

  if (pkg.credits_used >= pkg.credits_total) {
    return res.status(400).json({ error: "Geen credits meer over" });
  }

  b.status = "ATTENDED";
  b.attendedAt = new Date().toISOString();

  pkg.credits_used += 1; // credit gaat er NU af (bij aanwezigheid)
  res.json({ ok: true, id: b.id, status: b.status, credits_used: pkg.credits_used, credits_total: pkg.credits_total });
});

export default router;
