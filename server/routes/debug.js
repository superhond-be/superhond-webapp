// routes/debug.js
import express from "express";
import { store, addCustomer, addDog, addPass, useStrip } from "../store.js";

const router = express.Router();

// Test: klant toevoegen
router.post("/add-customer", (req, res) => {
  const customer = req.body;
  const result = addCustomer(customer);
  res.json({ success: true, customer: result });
});

// Test: hond toevoegen
router.post("/add-dog", (req, res) => {
  const dog = req.body;
  const result = addDog(dog);
  res.json({ success: true, dog: result });
});

// Test: strippenkaart toevoegen
router.post("/add-pass", (req, res) => {
  const pass = req.body;
  const result = addPass(pass);
  res.json({ success: true, pass: result });
});

// Test: strip gebruiken
router.post("/use-strip/:id", (req, res) => {
  try {
    const passId = req.params.id;
    const result = useStrip(passId);
    res.json({ success: true, pass: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Debug route: volledige store tonen
router.get("/store", (req, res) => {
  res.json(store);
});

export default router;
