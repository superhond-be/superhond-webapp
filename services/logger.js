// Lightweight logger
const levels = ["error","warn","info","debug"];
const current = process.env.LOG_LEVEL || "info";
const should = lvl => levels.indexOf(lvl) <= levels.indexOf(current);

module.exports = {
  info: (...args) => should("info") && console.log("[INFO]", ...args),
  warn: (...args) => should("warn") && console.warn("[WARN]", ...args),
  error: (...args) => should("error") && console.error("[ERROR]", ...args),
  debug: (...args) => should("debug") && console.log("[DEBUG]", ...args),
};
