// server/routes/customers.js
import express from "express";
const router = express.Router();

export const CUSTOMERS = []; // in-memory
let NEXT_ID = 1;

router.get("/", (_req, res) => {
  res.json(CUSTOMERS);
});

router.post("/", (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  const c = { id: NEXT_ID++, name, email: email || "", phone: phone || "", dogs: [] };
  CUSTOMERS.push(c);
  res.status(201).json(c);
});

export default router;
