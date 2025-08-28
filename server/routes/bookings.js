// server/routes/bookings.js
import express from "express";
const router = express.Router();

/** simpele in-memory opslag voor demo */
let NEXT_ID = 1;
const BOOKINGS = []; // {id, clientId, classId, sessionId, status, createdAt}

const toInt = v => (Number.isNaN(parseInt(v, 10)) ? null : parseInt(v, 10));
const findBooking = id => BOOKINGS.find(b => b.id === id);
const countReservedForSession = sid =>
  BOOKINGS.filter(b => b.sessionId === sid && b.status === "RESERVED").length;
const countReservedForClientInClass = (cid, clsId) =>
  BOOKINGS.filter(b => b.clientId === cid && b.classId === clsId && b.status === "RESERVED").length;

/** Lijst opvragen (optioneel filteren) */
router.get("/", (req, res) => {
  const sessionId = req.query.sessionId ? toInt(req.query.sessionId) : null;
  const classId   = req.query.classId   ? toInt(req.query.classId)   : null;
  const clientId  = req.query.clientId  ? toInt(req.query.clientId)  : null;

  let list = BOOKINGS.slice();
  if (sessionId !== null) list = list.filter(b => b.sessionId === sessionId);
  if (classId   !== null) list = list.filter(b => b.classId   === classId);
  if (clientId  !== null) list = list.filter(b => b.clientId  === clientId);
  list.sort((a,b) => (a.createdAt < b.createdAt ? 1 : -1));

  res.json(list);
});

/** Eén booking */
router.get("/:id", (req, res) => {
  const id = toInt(req.params.id);
  const b = id ? findBooking(id) : null;
  if (!b) return res.status(404).json({ error: "Booking niet gevonden" });
  res.json(b);
});

/** Nieuwe booking (respecteert capaciteit + max 2 actieve reservaties per klas) */
router.post("/", (req, res) => {
  const { clientId, classId, sessionId, sessionCapacity } = req.body || {};
  const cId = toInt(clientId), clId = toInt(classId), sId = toInt(sessionId);
  const cap = sessionCapacity !== undefined ? toInt(sessionCapacity) : null;
  if (!cId || !clId || !sId) return res.status(400).json({ error: "clientId, classId en sessionId zijn verplicht" });

  if (BOOKINGS.find(b => b.clientId === cId && b.sessionId === sId && b.status !== "CANCELLED")) {
    return res.status(409).json({ error: "Deze klant is al geboekt voor deze sessie" });
  }
  if (countReservedForClientInClass(cId, clId) >= 2) {
    return res.status(409).json({ error: "Maximum 2 actieve reservaties bereikt voor deze klas" });
  }
  if (cap !== null && countReservedForSession(sId) >= cap) {
    return res.status(409).json({ error: "Sessie zit vol (capaciteit bereikt)" });
  }

  const booking = {
    id: NEXT_ID++,
    clientId: cId,
    classId: clId,
    sessionId: sId,
    status: "RESERVED",
    createdAt: new Date().toISOString()
  };
  BOOKINGS.push(booking);
  res.status(201).json(booking);
});

/** Aanwezig markeren */
router.post("/:id/attend", (req, res) => {
  const id = toInt(req.params.id);
  const b = id ? findBooking(id) : null;
  if (!b) return res.status(404).json({ error: "Booking niet gevonden" });
  if (b.status === "CANCELLED") return res.status(409).json({ error: "Geannuleerde booking kan niet aanwezig gezet worden" });
  if (b.status === "ATTENDED") return res.json(b);
  b.status = "ATTENDED";
  b.attendedAt = new Date().toISOString();
  res.json(b);
});

/** Afmelden (annuleren) */
router.post("/:id/cancel", (req, res) => {
  const id = toInt(req.params.id);
  const b = id ? findBooking(id) : null;
  if (!b) return res.status(404).json({ error: "Booking niet gevonden" });
  if (b.status === "ATTENDED") return res.status(409).json({ error: "Aanwezige booking kan niet geannuleerd worden" });
  if (b.status === "CANCELLED") return res.json(b);
  b.status = "CANCELLED";
  b.cancelledAt = new Date().toISOString();
  res.json(b);
});

/** Statistieken per sessie (optioneel capacity=? doorgeven) */
router.get("/stats/session/:sessionId", (req, res) => {
  const sId = toInt(req.params.sessionId);
  if (!sId) return res.status(400).json({ error: "sessionId ongeldig" });
  const cap = req.query.capacity !== undefined ? toInt(req.query.capacity) : null;

  const reserved  = BOOKINGS.filter(b => b.sessionId === sId && b.status === "RESERVED").length;
  const attended  = BOOKINGS.filter(b => b.sessionId === sId && b.status === "ATTENDED").length;
  const cancelled = BOOKINGS.filter(b => b.sessionId === sId && b.status === "CANCELLED").length;

  const stats = { sessionId: sId, reserved, attended, cancelled };
  if (cap !== null) { stats.capacity = cap; stats.free = Math.max(0, cap - reserved); }
  res.json(stats);
});

export default router;
