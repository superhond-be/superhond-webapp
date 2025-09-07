const express = require("express");
const session = require("express-session");
const path = require("path");

const adminUsers = require("./routes/admin-users");
const app = express();

// basis security
app.disable("x-powered-by");

// body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sessions (simpel)
app.use(session({
  secret: process.env.SESSION_SECRET || "dev_secret",
  saveUninitialized: true,
  resave: false,
  cookie: { sameSite: "lax" }
}));

// static files
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// API routes
app.use("/api/admin/users", adminUsers);

// healthcheck (optioneel)
app.get("/health", (req, res) => res.json({ ok: true }));

// start (Render leest PORT uit env)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Superhond server luistert op", PORT);
});
