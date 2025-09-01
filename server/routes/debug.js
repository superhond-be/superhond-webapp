// server/routes/debug.js  (ESM)
import express from "express";
import { store, addCustomer, addDog, addPass } from "../store.js";

const router = express.Router();

/**
 * POST /api/debug/reset
 * Leegt alle in-memory tabellen.
 */
router.post("/reset", (_req, res) => {
  store.customers.length = 0;
  store.dogs.length = 0;
  store.passes.length = 0;
  store.lessons.length = 0;
  store.seq = { customers: 1, dogs: 1, passes: 1, lessons: 1 };
  res.json({ ok: true, msg: "Store reset." });
});

/**
 * POST /api/debug/seed
 * Maakt wat voorbeelddata aan: 2 klanten, 2 honden, 2 strippenkaarten.
 */
router.post("/seed", (_req, res) => {
  // klanten
  const paul   = addCustomer({ name: "Paul Thijs",  email: "paul@example.com",  phone: "0471 11 22 33" });
  const sofie  = addCustomer({ name: "Sofie Jans",  email: "sofie@example.com", phone: "0468 44 55 66" });

  // honden
  const seda   = addDog({ ownerId: paul.id,  name: "Seda",  breed: "Puber", birthdate: "2024-03-10", sex: "F", vaccineStatus: "volledig" });
  const rocky  = addDog({ ownerId: sofie.id, name: "Rocky", breed: "Border Collie", birthdate: "2023-11-02", sex: "M", vaccineStatus: "volledig" });

  // strippenkaarten
  addPass({ customerId: paul.id,  dogId: seda.id,  lessonType: "PUPPY", total: 9 });
  addPass({ customerId: sofie.id, dogId: rocky.id, lessonType: "PUBER", total: 5 });

  res.json({
    ok: true,
    customers: store.customers,
    dogs: store.dogs,
    passes: store.passes,
  });
});

export default router;
