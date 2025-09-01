 1 import express from "express";
 2 import cors from "cors";
 3 import path from "path";
 4 import { fileURLToPath } from "url";
 
import searchRoutes from "./routes/search.js";



 6 import customersRoutes from "./routes/customers.js";
 7 import dogsRoutes from "./routes/dogs.js";
 8 import passesRoutes from "./routes/passes.js";
 9 import lessonsRoutes from "./routes/lessons.js";
10 
11 const app = express();
12 const PORT = process.env.PORT || 10000;
13 
14 // Nodig voor __dirname in ES modules
15 const __filename = fileURLToPath(import.meta.url);
16 const __dirname = path.dirname(__filename);
17 
18 // Middleware
19 app.use(cors());
20 app.use(express.json());
21 app.use(express.static(path.join(__dirname, "../public")));
22 
23 // Routes

app.use("/api/search", searchRoutes);
24 app.use("/api/customers", customersRoutes);
25 app.use("/api/dogs", dogsRoutes);
26 app.use("/api/passes", passesRoutes);
27 app.use("/api/lessons", lessonsRoutes);
28 
29 // Root test
30 app.get("/", (req, res) => {
31   res.send("✅ Superhond backend draait!");
32 });
33 
34 // Start server
35 app.listen(PORT, () => {
36   console.log(`🚀 Server running on port ${PORT}`);
37 });
