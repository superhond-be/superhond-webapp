// server/routes/debug.js
import express from "express";
import { getCustomers, addCustomer, findCustomer } from "./customers.js";

const router = express.Router();

/**
 * POST /api/debug/seed
 * Maakt 3 klanten, 3 honden en strippenkaarten aan (als ze nog niet bestaan).
 */
router.post("/debug/seed", (_req, res) => {
  const customers = getCustomers();

  // voorkom dubbel seeden
  const already = customers.some(c => c.email === "demo1@superhond.be");
  if (already) {
    return res.json({ ok: true, message: "Seed bestond al", customersCount: customers.length });
  }

  // 1) klanten
  const c1 = addCustomer({ name: "Demo Klant 1", email: "demo1@superhond.be", phone: "0470 11 22 33" });
  const c2 = addCustomer({ name: "Demo Klant 2", email: "demo2@superhond.be", phone: "0470 22 33 44" });
  const c3 = addCustomer({ name: "Demo Klant 3", email: "demo3@superhond.be", phone: "0470 33 44 55" });

  // 2) honden
  c1.dogs = [
    { id: 1, name: "Rex", breed: "Border Collie", sex: "m", birthDate: "2022-03-10" },
    { id: 2, name: "Bella", breed: "Labrador", sex: "v", birthDate: "2021-11-01" }
  ];
  c2.dogs = [{ id: 3, name: "Milo", breed: "Beagle", sex: "m", birthDate: "2023-05-20" }];
  c3.dogs = [];

  // 3) strippenkaarten
  c1.passes = [
    { id: 1, type: "puppy-9", totalStrips: 9, remaining: 7, createdAt: new Date().toISOString() }
  ];
  c2.passes = [
    { id: 1, type: "puppy-9", totalStrips: 9, remaining: 9, createdAt: new Date().toISOString() }
  ];
  c3.passes = [];

  return res.json({
    ok: true,
    customersSeeded: [c1.id, c2.id, c3.id],
    dogsTotal: (c1.dogs?.length || 0) + (c2.dogs?.length || 0) + (c3.dogs?.length || 0)
  });
});

/**
 * POST /api/debug/reset
 * Leegt alle data (klanten/honden/passes). Handig voor schone test.
 * N.B.: alleen in-memory; server-herstart doet dit ook.
 */
router.post("/debug/reset", (_req, res) => {
  const customers = getCustomers();
  customers.splice(0, customers.length); // leegt array
  return res.json({ ok: true, message: "In-memory data gewist" });
});

export default router;
