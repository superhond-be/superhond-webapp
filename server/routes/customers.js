import express from "express";
export const router = express.Router();

// In-memory opslag (demo)
export let CUSTOMERS = [];
let NEXT_CUSTOMER_ID = 1;

// Zorg dat we honden kunnen inlezen om mee te sturen:
import { DOGS } from "./dogs.js";

/**
 * GET /api/customers
 * Retourneert alle klanten met hun gekoppelde honden
 */
router.get("/", (_req, res) => {
  const withDogs = CUSTOMERS.map(c => ({
    ...c,
    dogs: DOGS.filter(d => d.customerId === c.id)
  }));
  res.json(withDogs);
});

/**
 * GET /api/customers/:id
 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = CUSTOMERS.find(x => x.id === id);
  if (!c) return res.status(404).json({ error: "Klant niet gevonden" });
  const dogs = DOGS.filter(d => d.customerId === id);
  res.json({ ...c, dogs });
});

/**
 * POST /api/customers
 * body: { name, email?, phone? }
 */
router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Naam is verplicht" });
  }
  const customer = {
    id: NEXT_CUSTOMER_ID++,
    name: String(name).trim(),
    email: email ? String(email).trim() : null,
    phone: phone ? String(phone).trim() : null
  };
  CUSTOMERS.push(customer);
  res.status(201).json(customer);
});

export default router;
