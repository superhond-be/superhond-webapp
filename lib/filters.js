function csv(v) {
  return String(v || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

const PAID_TAGS = csv(process.env.PAID_TAGS);
const ALLOWED_TAGS = csv(process.env.SUPERHOND_ALLOWED_TAGS || "");

function anyMatch(arr = [], wanted = []) {
  const norm = (s) => String(s || "").toLowerCase();
  const set = new Set(arr.map(norm));
  return wanted.some(w => set.has(norm(w)));
}

function tagsFromPayload(payload = {}) {
  const top = Array.isArray(payload.tags) ? payload.tags : [];
  const contact = Array.isArray(payload?.contact?.tags) ? payload.contact.tags : [];
  return [...top, ...contact];
}

export function isPaidEvent(payload = {}) {
  if (!PAID_TAGS.length) return { isPaid: false, via: null, reason: "no paid tags configured" };
  const tags = tagsFromPayload(payload);
  if (anyMatch(tags, PAID_TAGS)) {
    return { isPaid: true, via: "tag", reason: "match in tags" };
  }
  return { isPaid: false, via: null, reason: "no paid indicators found" };
}

export function isAllowedForSuperhond(payload = {}) {
  if (!ALLOWED_TAGS.length) {
    return { allowed: true, tagMatched: null, reason: "no allowed tags configured (pass-through)" };
  }
  const tags = tagsFromPayload(payload);
  const ok = anyMatch(tags, ALLOWED_TAGS);
  const matched = ok ? ALLOWED_TAGS.find(t => tags.map(String).map(s=>s.toLowerCase()).includes(String(t).toLowerCase())) : null;
  return ok
    ? { allowed: true, tagMatched: matched, reason: "matched allowed tag" }
    : { allowed: false, tagMatched: null, reason: "no allowed tags present" };
}
