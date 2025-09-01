import express from "express";
import { store, addCustomer, addDog, addPass, useStrip } from "../store.js";

const router = express.Router();

// voorbeeldroute klant
router.post("/add-customer", (req, res) => {
  const result = addCustomer(req.body);
  res.json({ success: true, customer: result });
});

// voorbeeldroute hond
router.post("/add-dog", (req, res) => {
  const result = addDog(req.body);
  res.json({ success: true, dog: result });
});

export default router;
