import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Root route (coach portaal placeholder)
app.get("/", (req, res) => {
  res.send("<h1>Superhond Coach Portaal draait!</h1>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});
