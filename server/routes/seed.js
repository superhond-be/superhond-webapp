// server/routes/seed.js
import express from "express";
import { store, addCustomer, addDog, addPass, addLesson, addBooking } from "../data/store.js";

const router = express.Router();

router.post("/", (req, res) => {
  // wis huidige data (alleen voor test)
  store.customers = [];
  store.dogs = [];
  store.passes = [];
  store.lessons = [];
  store.bookings = [];

  // klant
  const c1 = addCustomer({ id: "c1", name: "Mitchell de Heer", email: "mitchell@example.com", phone: "0470 00 00 00" });

  // hond
  const d1 = addDog({ id: "d1", customerId: "c1", name: "Seda", breed: "Border Collie", gender: "♀", birthdate: "2023-05-01" });

  // strippenkaart (9 beurten, 2 gebruikt)
  const p1 = addPass({ id: "p1", customerId: "c1", dogId: "d1", classType: "Puppy Pack", total: 9, used: 2, validUntil: "2026-03-11" });

  // lessen (enkele datums)
  const l1 = addLesson({ id: "l1", classType: "Puppy Pack", date: "2025-08-11", start: "18:00", end: "19:00", location: "Dessel Tabloo" });
  const l2 = addLesson({ id: "l2", classType: "Puppy Pack", date: "2025-08-24", start: "10:00", end: "11:00", location: "Dessel Tabloo" });
  const l3 = addLesson({ id: "l3", classType: "Puppy Pack", date: "2025-09-14", start: "10:00", end: "11:00", location: "Dessel Tabloo" });

  // boekingen (markeer één als afgemeld)
  addBooking({ id: "b1", lessonId: "l1", customerId: "c1", dogId: "d1", status: "present" });
  addBooking({ id: "b2", lessonId: "l2", customerId: "c1", dogId: "d1", status: "present" });
  addBooking({ id: "b3", lessonId: "l3", customerId: "c1", dogId: "d1", status: "cancelled" });

  res.json({ ok: true, counts: {
    customers: store.customers.length,
    dogs: store.dogs.length,
    passes: store.passes.length,
    lessons: store.lessons.length,
    bookings: store.bookings.length
  }});
});

export default router;
