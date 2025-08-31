import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// importeer je routes hier
import passesRoutes from "./routes/passes.js";

// Express setup
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/passes", passesRoutes); // alle passes-routes beginnen met /api/passes

// Serve static files (frontend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
