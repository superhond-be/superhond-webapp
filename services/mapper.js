// Eenvoudige mapper van MailBlue/ActiveCampaign payload naar ons domeinmodel.
// Past aan met eigen custom field sleutels of pipelines.

const CFG = {
  // Pas deze sleutel-namen aan op basis van je MailBlue custom fields
  fields: {
    phone: ["phone", "tel", "gsm", "phone_number"],
    dogName: ["dog_name", "hond", "hondnaam"],
    dogBreed: ["dog_breed", "ras"],
    dogBirth: ["dog_birth", "geboortedatum_hond"],
    credits: ["credits", "aantal_credits"],
    lessonType: ["lesson_type", "les_type", "lestype"],
  }
};

function pluck(any, keys) {
  if (!any || typeof any !== "object") return undefined;
  for (const k of keys) {
    if (any[k] != null) return any[k];
    // probeer nested fields
    if (any.fields && any.fields[k] != null) return any.fields[k];
    if (any.custom_fields && any.custom_fields[k] != null) return any.custom_fields[k];
  }
  return undefined;
}

export function mapMailblueToDomain(payload) {
  // Vaak zit contact info op payload.contact of direct op payload
  const contact = payload.contact || payload || {};
  const email = (contact.email || "").trim();
  const firstName = contact.first_name || contact.firstname || contact.voornaam || "";
  const lastName = contact.last_name || contact.lastname || contact.achternaam || "";
  const phone = pluck(contact, CFG.fields.phone) || "";

  const dogName = pluck(payload, CFG.fields.dogName);
  const dogBreed = pluck(payload, CFG.fields.dogBreed);
  const dogBirth = pluck(payload, CFG.fields.dogBirth);
  const credits = Number(pluck(payload, CFG.fields.credits) || 0);
  const lessonType = pluck(payload, CFG.fields.lessonType) || null;

  const domain = {
    customer: {
      email,
      firstName,
      lastName,
      phone
    }
  };

  if (dogName) {
    domain.dog = {
      name: String(dogName),
      breed: dogBreed || null,
      birthDate: dogBirth || null
    };
  }

  if (credits && credits > 0) {
    domain.credit = {
      amount: credits,
      reason: lessonType ? `Aankoop credits voor ${lessonType}` : "Aankoop credits",
      source: "mailblue"
    };
  }

  return domain;
}
