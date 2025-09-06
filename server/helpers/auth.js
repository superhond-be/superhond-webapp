// server/helpers/auth.js
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

/** ---- Data helpers (admins.json) ---- */
const ADMINS_FILE = path.join(process.cwd(), "data", "admins.json");

function readAdmins() {
  try {
    const raw = fs.readFileSync(ADMINS_FILE, "utf8");
    const obj = JSON.parse(raw || "[]");
    return Array.isArray(obj) ? obj : obj.admins || [];
  } catch {
    return [];
  }
}

function findAdminByEmail(email) {
  const em = String(email || "").trim().toLowerCase();
  return readAdmins().find(a => String(a.email || "").toLowerCase() === em);
}

/** ---- Password helpers ---- */
async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

async function verifyPassword(plain, user) {
  const pwd = String(plain || "");
  // legacy fallback: some records may have `password` (plain) instead of `passwordHash`
  if (user.passwordHash) return bcrypt.compare(pwd, user.passwordHash);
  if (user.password)    return pwd === user.password;
  return false;
}

/** ---- Session helpers / middlewares ---- */
function getUserFromSession(req) {
  return req.session && req.session.user ? req.session.user : null;
}

function requireAuth(req, res, next) {
  if (getUserFromSession(req)) return next();
  res.status(401).json({ ok: false, error: "unauthenticated" });
}

function requireRole(...roles) {
  // supports: requireRole('admin') or requireRole('admin','superadmin')
  const allow = roles.flat().map(r => String(r).toLowerCase());
  return (req, res, next) => {
    const u = getUserFromSession(req);
    if (!u) return res.status(401).json({ ok: false, error: "unauthenticated" });
    if (allow.length === 0 || allow.includes(String(u.role || "").toLowerCase())) return next();
    return res.status(403).json({ ok: false, error: "forbidden" });
  };
}

module.exports = {
  readAdmins,
  findAdminByEmail,
  hashPassword,
  verifyPassword,
  getUserFromSession,
  requireAuth,
  requireRole
};
