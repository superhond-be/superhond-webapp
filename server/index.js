import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Health check route
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});
import classesRouter from "./routes/classes.js";
app.use("/api/classes", classesRouter);
