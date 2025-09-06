// server/index.js
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();

// --- core middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- sessions (MemoryStore is ok voor ontwikkel/test) ---
const SESSION_SECRET = process.env.SESSION_SECRET || "dev_session_secret_change_me";
app.use(session({
  name: "sh.sid",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    // secure: true  // <— zet aan als je een custom https domein gebruikt
  }
}));

// --- static files ---
app.use(express.static(path.join(process.cwd(), "public")));

// --- routes ---
app.use("/api/auth", require("./routes/auth"));         // << nieuw
app.use("/api/admin", require("./routes/admin-users")); // je bestaande admin-user routes
// ... laat overige routes die je al had gewoon staan

// --- server listen (Render gebruikt PORT env) ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Superhond server luistert op ${PORT}`);
});
