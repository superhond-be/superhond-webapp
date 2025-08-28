import express from "express";
const router = express.Router();

// Test endpoint om te zien of het werkt
router.get("/", (req, res) => {
  res.json({ message: "Bookings route werkt!" });
});

export default router;
