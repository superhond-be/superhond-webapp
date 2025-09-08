// Superhond Endpoint Mapper
// Plaats dit bestand in je Superhond API project (bijv. in services/mapper.js)

/**
 * Map incoming payloads van de forwarder naar interne velden
 * voor Puppy / Puber / Basis groepen.
 *
 * @param {object} data - inkomende payload van de forwarder
 * @returns {object} - genormaliseerd object
 */
function mapPayload(data = {}) {
  const topic = (data.topic || data.Topic || "").toLowerCase();
  let group = "Onbekend";

  if (topic.includes("puppy")) group = "Puppy";
  else if (topic.includes("puber")) group = "Puber";
  else if (topic.includes("basis")) group = "Basis";

  return {
    group,
    name: data.name || data.fullname || "",
    email: data.email || data.mail || "",
    phone: data.phone || data.telephone || "",
    dogName: data.dogName || data.hond || "",
    dogAge: data.dogAge || data.leeftijd || "",
    source: data.source || data["X-Source"] || "forwarder",
    raw: data
  };
}

module.exports = { mapPayload };
