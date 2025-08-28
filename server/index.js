import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// importeer routes
import bookingsRoutes from "./routes/bookings.js";
import classesRoutes from "./routes/classes.js";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// gebruik routes
app.use("/api/bookings", bookingsRoutes);
app.use("/api/classes", classesRoutes);

app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});
