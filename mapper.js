// Mapper voor MailBlue → Superhond domein
// Past toewijzing op basis van tags toe voor Puppy, Puber, Basis.
// Pas de TAG_NAMEN hieronder aan aan je exacte MailBlue-tags.
//
// Gebruik in superhond-api-endpoint: plaats dit bestand als
//   services/mapper.js
// en herstart de endpoint server.

const TAGS = {
  PUPPY: ["Superhond - Puppy", "Superhond - Puppy Special", "Superhond - Puppy Pack", "Puppy Pack"],
  PUBER: ["Superhond - Puber", "Puber", "Pubergroep"],
  BASIS: ["Superhond - Basis", "Basis", "Basisgroep"],
};

const DEFAULTS = {
  CREDITS: {
    PUPPY: 9,
    PUBER: 9,
    BASIS: 12,
  }
};

function hasAnyTag(contact = {}, candidateTags = []) {
  const tags = Array.isArray(contact.tags) ? contact.tags : [];
  const norm = s => String(s || "").toLowerCase().trim();
  const set = new Set(tags.map(norm));
  return candidateTags.some(t => set.has(norm(t)));
}

// Helper om waarden uit mogelijke velden te halen
function pluck(any, keys) {
  if (!any || typeof any !== "object") return undefined;
  for (const k of keys) {
    if (any[k] != null) return any[k];
    if (any.fields && any.fields[k] != null) return any.fields[k];
    if (any.custom_fields && any.custom_fields[k] != null) return any.custom_fields[k];
  }
  return undefined;
}

export function mapMailblueToDomain(payload) {
  const c = payload?.contact || {};
  const email = (c.email || "").trim();
  const firstName = c.first_name || c.firstname || c.voornaam || "";
  const lastName  = c.last_name  || c.lastname  || c.achternaam || "";
  const phone     = pluck(c, ["phone","tel","gsm","phone_number"]) || "";

  let groep = null;
  let credits = 0;

  if (hasAnyTag(c, TAGS.PUPPY)) {
    groep = "Puppy";
    credits = DEFAULTS.CREDITS.PUPPY;
  } else if (hasAnyTag(c, TAGS.PUBER)) {
    groep = "Puber";
    credits = DEFAULTS.CREDITS.PUBER;
  } else if (hasAnyTag(c, TAGS.BASIS)) {
    groep = "Basis";
    credits = DEFAULTS.CREDITS.BASIS;
  }

  // Optionele hond-gegevens uit custom fields
  const dogName  = pluck(payload, ["hond","dog_name","hondnaam"]);
  const dogBreed = pluck(payload, ["ras","dog_breed"]);
  const dogBirth = pluck(payload, ["geboortedatum_hond","dog_birth"]);

  const result = {
    customer: { email, firstName, lastName, phone },
  };

  if (groep) {
    result.group = groep;
    result.credit = {
      amount: credits,
      reason: `Aankoop credits voor ${groep}`,
      source: "mailblue"
    };
  }

  if (dogName) {
    result.dog = {
      name: String(dogName),
      breed: dogBreed || null,
      birthDate: dogBirth || null
    };
  }

  return result;
}
