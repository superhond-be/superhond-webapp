function csv(v) {
  return String(v || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

const PAID_TAGS = csv(process.env.PAID_TAGS);

function anyMatch(arr = [], wanted = []) {
  const norm = (s) => String(s || "").toLowerCase();
  const set = new Set(arr.map(norm));
  return wanted.some(w => set.has(norm(w)));
}

export function isPaidEvent(payload = {}) {
  const tagsTop = Array.isArray(payload.tags) ? payload.tags : [];
  const tagsContact = Array.isArray(payload?.contact?.tags) ? payload.contact.tags : [];
  if (PAID_TAGS.length) {
    if (anyMatch(tagsTop, PAID_TAGS) || anyMatch(tagsContact, PAID_TAGS)) {
      return { isPaid: true, via: "tag", reason: "match in tags" };
    }
  }
  return { isPaid: false, via: null, reason: "no paid indicators found" };
}
