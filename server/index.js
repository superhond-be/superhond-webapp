import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import classesRouter from "./routes/classes.js";
import sessionsRouter from "./routes/sessions.js";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Routes
app.use("/api/classes", classesRouter);
app.use("/api/sessions", sessionsRouter);

app.listen(PORT, () => {
  console.log(`Superhond server draait op http://localhost:${PORT}`);
});
