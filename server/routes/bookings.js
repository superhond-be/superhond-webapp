await api("/bookings", {
  method: "POST",
  body: JSON.stringify({
    clientId,
    sessionId: ADMIN_SELECTED_SESSION.id,
    classId: ADMIN_SELECTED_SESSION.classId,
    sessionCapacity: ADMIN_SELECTED_SESSION.capacity // als je die in je sessie bewaart
// server/routes/bookings.js
import express from "express";
const router = express.Router();

/**
 * In-memory demo store
 * In productie vervang je dit door je database (SQLite/Postgres/…)
 */
let _nextId = 1;
/**
 * Booking shape:
 * {
 *   id: number,
 *   clientId: number,
 *   classId: number,
 *   sessionId: number,
 *   status: "RESERVED" | "ATTENDED" | "CANCELLED",
 *   createdAt: ISOString,
 *   attendedAt?: ISOString,
 *   cancelledAt?: ISOString
 * }
 */
const BOOKINGS = [];

/* -------- helpers -------- */

function toInt(v) {
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

function findBooking(id) {
  return BOOKINGS.find(b => b.id === id);
}

function countReservedForSession(sessionId) {
  return BOOKINGS.filter(b => b.sessionId === sessionId && b.status === "RESERVED").length;
}

function countReservedForClientInClass(clientId, classId) {
  return BOOKINGS.filter(
    b => b.clientId === clientId && b.classId === classId && b.status === "RESERVED"
  ).length;
}

/* -------- routes -------- */

/**
 * Lijst met bookings
 * Filters:
 *   - ?sessionId=...
 *   - ?classId=...
 *   - ?clientId=...
 */
router.get("/", (req, res) => {
  const q = req.query;
  const sessionId = q.sessionId ? toInt(q.sessionId) : null;
  const classId = q.classId ? toInt(q.classId) : null;
  const clientId = q.clientId ? toInt(q.clientId) : null;

  let list = BOOKINGS.slice();

  if (sessionId !== null) list = list.filter(b => b.sessionId === sessionId);
  if (classId !== null) list = list.filter(b => b.classId === classId);
  if (clientId !== null) list = list.filter(b => b.clientId === clientId);

  // sorteer meest recent eerst
  list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  res.json(list);
});

/**
 * Eén booking ophalen
 */
router.get("/:id", (req, res) => {
  const id = toInt(req.params.id);
  const b = id ? findBooking(id) : null;
  if (!b) return res.status(404).json({ error: "Booking niet gevonden" });
  res.json(b);
});

/**
 * Booking aanmaken
 * Body:
 *   {
 *     clientId: number (vereist),
 *     classId: number (vereist),
 *     sessionId: number (vereist),
 *     sessionCapacity?: number  // optioneel, voor eenvoudige capaciteitscheck
 *   }
 */
router.post("/", (req, res) => {
  const { clientId, classId, sessionId, sessionCapacity } = req.body || {};

  const cId = toInt(clientId);
  const clId = toInt(classId);
  const sId = toInt(sessionId);
  const cap = sessionCapacity !== undefined ? toInt(sessionCapacity) : null;

  if (!cId || !clId || !sId) {
    return res.status(400).json({ error: "clientId, classId en sessionId zijn verplicht" });
  }

  // 1) geen dubbele boeking voor dezelfde sessie en klant
  const already = BOOKINGS.find(b => b.clientId === cId && b.sessionId === sId && b.status !== "CANCELLED");
  if (already) {
    return res.status(409).json({ error: "Deze klant is al geboekt voor deze sessie" });
  }

  // 2) max 2 actieve reservaties per klant per klas (RESERVED)
  const activeForClass = countReservedForClientInClass(cId, clId);
  if (activeForClass >= 2) {
    return res.status(409).json({
      error: "Maximum 2 actieve reservaties bereikt voor deze klas (annuleer eerst een reservatie)"
    });
  }

  // 3) capaciteit check (optioneel)
  if (cap !== null) {
    const alreadyReserved = countReservedForSession(sId);
    if (alreadyReserved >= cap) {
      return res.status(409).json({ error: "Sessie zit vol (capaciteit bereikt)" });
    }
  }

  const now = new Date().toISOString();
  const booking = {
    id: _nextId++,
    clientId: cId,
    classId: clId,
    sessionId: sId,
    status: "RESERVED",
    createdAt: now
  };
  BOOKINGS.push(booking);

  res.status(201).json(booking);
});

/**
 * Aanwezig markeren (credit verbruiken)
 */
router.post("/:id/attend", (req, res) => {
  const id = toInt(req.params.id);
  const b = id ? findBooking(id) : null;
  if (!b) return res.status(404).json({ error: "Booking niet gevonden" });

  if (b.status === "CANCELLED") {
    return res.status(409).json({ error: "Geannuleerde booking kan niet aanwezig gezet worden" });
  }
  if (b.status === "ATTENDED") {
    return res.json(b); // idempotent
  }

  b.status = "ATTENDED";
  b.attendedAt = new Date().toISOString();

  res.json(b);
});

/**
 * Afmelden (credit niet verbruiken)
 */
router.post("/:id/cancel", (req, res) => {
  const id = toInt(req.params.id);
  const b = id ? findBooking(id) : null;
  if (!b) return res.status(404).json({ error: "Booking niet gevonden" });

  if (b.status === "CANCELLED") {
    return res.json(b); // idempotent
  }
  if (b.status === "ATTENDED") {
    return res.status(409).json({ error: "Aanwezige booking kan niet geannuleerd worden" });
  }

  b.status = "CANCELLED";
  b.cancelledAt = new Date().toISOString();

  res.json(b);
});

/**
 * Stats voor UI (badges, teller, vrije plaatsen)
 * GET /api/bookings/stats/session/:sessionId?capacity=15
 */
router.get("/stats/session/:sessionId", (req, res) => {
  const sId = toInt(req.params.sessionId);
  if (!sId) return res.status(400).json({ error: "sessionId ongeldig" });

  const cap = req.query.capacity !== undefined ? toInt(req.query.capacity) : null;

  const reserved = BOOKINGS.filter(b => b.sessionId === sId && b.status === "RESERVED").length;
  const attended = BOOKINGS.filter(b => b.sessionId === sId && b.status === "ATTENDED").length;
  const cancelled = BOOKINGS.filter(b => b.sessionId === sId && b.status === "CANCELLED").length;

  const stats = { sessionId: sId, reserved, attended, cancelled };
  if (cap !== null) {
    stats.capacity = cap;
    stats.free = Math.max(0, cap - reserved);
  }

  res.json(stats);
});

export default router;
