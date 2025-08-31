// server/routes/lessons.js
import express from "express";
import { useOneStripForCustomer } from "./passes.js";

const router = express.Router();

let NEXT_LESSON_ID = 1;
/**
 * LESSONS: {
 *   id, title, date, time, location, capacity (null=onbeperkt),
 *   participants: [ { customerId, dogId, status: "gepland" | "bevestigd", joinedAt } ]
 * }
 */
const LESSONS = [];

/** GET /api/lessons  (overzicht) */
router.get("/", (_req, res) => {
  res.json(LESSONS);
});

/** POST /api/lessons  Body: { title, date, time, location?, capacity? } */
router.post("/", (req, res) => {
  const { title, date, time, location = "", capacity = null } = req.body || {};
  if (!title || !date || !time) {
    return res.status(400).json({ error: "title, date en time zijn verplicht" });
  }
  const lesson = {
    id: NEXT_LESSON_ID++,
    title: String(title),
    date: String(date),
    time: String(time),
    location: String(location),
    capacity: Number.isFinite(Number(capacity)) && Number(capacity) > 0 ? Number(capacity) : null,
    participants: [],
    createdAt: new Date().toISOString(),
  };
  LESSONS.push(lesson);
  res.status(201).json(lesson);
});

/** POST /api/lessons/:lessonId/enroll  Body: { customerId, dogId? }  (nog GEEN strip verbruik) */
router.post("/:lessonId/enroll", (req, res) => {
  const lessonId = Number(req.params.lessonId);
  const { customerId, dogId = null } = req.body || {};
  const lesson = LESSONS.find(l => l.id === lessonId);
  if (!lesson) return res.status(404).json({ error: "Les niet gevonden" });
  if (!customerId) return res.status(400).json({ error: "customerId verplicht" });

  // Capaciteit check
  if (lesson.capacity && lesson.participants.length >= lesson.capacity) {
    return res.status(409).json({ error: "Les is vol" });
  }
  // Dubbele inschrijving voorkomen
  if (lesson.participants.some(p => p.customerId === Number(customerId))) {
    return res.status(409).json({ error: "Klant is al ingeschreven" });
  }

  lesson.participants.push({
    customerId: Number(customerId),
    dogId: dogId ? Number(dogId) : null,
    status: "gepland",
    joinedAt: new Date().toISOString(),
  });

  res.json({ ok: true, lesson });
});

/** POST /api/lessons/:lessonId/confirm  Body: { customerId }  (strip verbruiken) */
router.post("/:lessonId/confirm", (req, res) => {
  const lessonId = Number(req.params.lessonId);
  const { customerId } = req.body || {};
  const lesson = LESSONS.find(l => l.id === lessonId);
  if (!lesson) return res.status(404).json({ error: "Les niet gevonden" });
  if (!customerId) return res.status(400).json({ error: "customerId verplicht" });

  const part = lesson.participants.find(p => p.customerId === Number(customerId));
  if (!part) return res.status(404).json({ error: "Inschrijving niet gevonden" });
  if (part.status === "bevestigd") {
    return res.status(409).json({ error: "Al bevestigd" });
  }

  // Verbruik 1 strip (via passes helper)
  const used = useOneStripForCustomer(Number(customerId));
  if (!used.ok) return res.status(400).json({ error: used.error || "Geen strips" });

  part.status = "bevestigd";
  res.json({ ok: true, lesson, used: used.purchase });
});

export default router;
