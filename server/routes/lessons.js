// server/routes/lessons.js
import express from "express";
import { getCustomers, findCustomer } from "./customers.js";

const router = express.Router();

// In-memory lijst van lessen
let lessons = []; // { id, title, date, time, capacity, participants: [ {customerId, dogId} ] }

// Alle lessen ophalen
router.get("/", (_req, res) => {
  res.json(lessons);
});

// Nieuwe les toevoegen
router.post("/", (req, res) => {
  const { title, date, time, capacity } = req.body;
  const newLesson = {
    id: lessons.length + 1,
    title,
    date,
    time,
    capacity: capacity || 10,
    participants: []
  };
  lessons.push(newLesson);
  res.json(newLesson);
});

// Inschrijven voor een les
router.post("/:lessonId/enroll", (req, res) => {
  const lessonId = Number(req.params.lessonId);
  const { customerId, dogId } = req.body;
  const lesson = lessons.find(l => l.id === lessonId);
  if (!lesson) return res.status(404).json({ error: "Les niet gevonden" });

  const customer = findCustomer(customerId);
  if (!customer) return res.status(404).json({ error: "Klant niet gevonden" });

  if (lesson.capacity && lesson.participants.length >= lesson.capacity) {
    return res.status(400).json({ error: "Les vol" });
  }

  // check of klant nog een pass heeft
  const pass = customer.passes?.find(p => p.remaining > 0);
  if (!pass) {
    return res.status(400).json({ error: "Geen strippen meer beschikbaar" });
  }

  // gebruik 1 strip pas NA deelname (dus we markeren 'gepland')
  lesson.participants.push({ customerId, dogId, status: "gepland" });

  res.json({ ok: true, lesson });
});

// Deelname bevestigen (strip verbruiken)
router.post("/:lessonId/confirm", (req, res) => {
  const lessonId = Number(req.params.lessonId);
  const { customerId } = req.body;
  const lesson = lessons.find(l => l.id === lessonId);
  if (!lesson) return res.status(404).json({ error: "Les niet gevonden" });

  const part = lesson.participants.find(p => p.customerId === customerId);
  if (!part) return res.status(404).json({ error: "Inschrijving niet gevonden" });

  if (part.status === "bevestigd") {
    return res.status(400).json({ error: "Al bevestigd" });
  }

  const customer = findCustomer(customerId);
  const pass = customer.passes?.find(p => p.remaining > 0);
  if (!pass) {
    return res.status(400).json({ error: "Geen strippen meer beschikbaar" });
  }

  pass.remaining -= 1;
  part.status = "bevestigd";

  res.json({ ok: true, lesson });
});

export default router;
