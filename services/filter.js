const crypto = require('crypto');
const logger = require('./logger');

function parseList(val) {
  if (!val) return [];
  return String(val).split(',').map(s => s.trim()).filter(Boolean);
}

function verifySignature(req, bodyString) {
  const required = (process.env.REQUIRE_SIGNATURE || "false").toLowerCase() === "true";
  if (!required) return true;
  const algo = process.env.SIGNATURE_ALGO || 'sha256';
  const header = process.env.SIGNATURE_HEADER || 'X-Signature';
  const shared = process.env.SH_SHARED_SECRET || '';
  const provided = req.get(header) || '';
  if (!shared) {
    logger.warn("Signature required but SH_SHARED_SECRET is empty");
    return false;
  }
  const hmac = crypto.createHmac(algo, shared).update(bodyString).digest('hex');
  const ok = crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(provided));
  if (!ok) logger.warn("Bad signature", { expected: hmac, provided });
  return ok;
}

function checkSharedSecret(req) {
  const incoming = req.get('X-Shared-Secret') || '';
  const shared = process.env.SH_SHARED_SECRET || '';
  if (!shared) return true; // allow if not configured
  return crypto.timingSafeEqual(Buffer.from(shared), Buffer.from(incoming));
}

function passesFilters(req, payload) {
  const allowedSources = parseList(process.env.ALLOWED_SOURCES);
  const topics = parseList(process.env.FILTER_TOPICS);
  const emails = parseList(process.env.FILTER_EMAILS);
  const src = (req.get('X-Source') || '').toLowerCase();

  if (allowedSources.length && !allowedSources.includes(src)) {
    logger.info("Blocked: source not allowed", src);
    return false;
  }
  const topic = (req.get('X-Topic') || payload?.topic || '').toString();
  if (topics.length && topic && !topics.includes(topic)) {
    logger.info("Blocked: topic not allowed", topic);
    return false;
  }
  const email = (payload?.email || '').toLowerCase();
  if (emails.length && email && !emails.includes(email)) {
    logger.info("Blocked: email not on allowlist");
    return false;
  }
  return true;
}

module.exports = { parseList, verifySignature, checkSharedSecret, passesFilters };
