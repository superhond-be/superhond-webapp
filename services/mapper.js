// Mapper voor Superhond API endpoints
// Ontvangt payloads van forwarder en zet ze om naar interne data-structuren

/**
 * Map een inkomende payload naar de juiste lesgroep (Puppy, Puber, Basis)
 * @param {Object} payload - inkomende JSON payload
 * @returns {Object} - gemapte data
 */
function mapPayload(payload) {
  if (!payload) return {};

  const topic = (payload.topic || payload.group || "").toLowerCase();
  let group = "Onbekend";

  if (topic.includes("puppy")) group = "Puppy";
  else if (topic.includes("puber")) group = "Puber";
  else if (topic.includes("basis")) group = "Basis";

  return {
    naam: payload.name || payload.fullName || "",
    email: payload.email || "",
    telefoon: payload.phone || "",
    hond: payload.dog || "",
    geboortedatum_hond: payload.dogBirth || "",
    groep: group,
    bron: payload.source || "onbekend",
    raw: payload
  };
}

module.exports = { mapPayload };
