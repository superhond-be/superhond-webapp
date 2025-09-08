// services/mapper.js
/**
 * Twee identieke les-types met verschillende namen:
 *  - "Puppy Pack Online"  -> canonical: "puppy_pack", variant: "online"
 *  - "Puppy Pack Connect" -> canonical: "puppy_pack", variant: "connect"
 * Beide worden behandeld als 1 en hetzelfde type in je backend.
 */

const ALIASES = [
  { re: /puppy\s*pack\s*online/i,  canonical: "puppy_pack", variant: "online",  group: "Puppy" },
  { re: /puppy\s*pack\s*connect/i, canonical: "puppy_pack", variant: "connect", group: "Puppy" },
];

function resolveAlias(name) {
  const s = String(name || "");
  for (const a of ALIASES) if (a.re.test(s)) return a;
  // fallback: als het woord "puppy" voorkomt, behandel als puppy_pack zonder variant
  if (/\bpuppy\b/i.test(s)) return { canonical: "puppy_pack", variant: "unspecified", group: "Puppy" };
  return { canonical: "unknown", variant: "unspecified", group: "Onbekend" };
}

function mapPayload(payload = {}) {
  const rawName = payload.productName || payload.courseName || payload.topic || payload.title || "";
  const alias   = resolveAlias(rawName);

  return {
    // basis
    naam:  payload.name || payload.fullName || "",
    email: payload.email || "",
    telefoon: payload.phone || "",
    hond: payload.dog || "",
    geboortedatum_hond: payload.dogBirth || "",

    // normalisatie
    group: alias.group,                 // "Puppy"
    canonical: alias.canonical,         // "puppy_pack"
    variant: alias.variant,             // "online" | "connect" | "unspecified"

    // trace
    rawProductName: rawName,
    bron: payload.source || "onbekend",
    raw: payload
  };
}

module.exports = { mapPayload };
