const API = "/api/settings";
const form = document.getElementById("settingsForm");
const msg = document.getElementById("settingsMsg");
const resetBtn = document.getElementById("resetBtn");

async function loadSettings() {
  try {
    msg.textContent = "Laden…";
    const res = await fetch(API, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error("Kan instellingen niet laden");
    const data = await res.json();

    // Veldjes invullen (fallbacks leeg)
    form.orgName.value    = data.orgName    ?? "";
    form.email.value      = data.email      ?? "";
    form.phone.value      = data.phone      ?? "";
    form.vat.value        = data.vat        ?? "";
    form.street.value     = data.street     ?? "";
    form.postalCode.value = data.postalCode ?? "";
    form.city.value       = data.city       ?? "";
    form.country.value    = data.country    ?? "";
    form.logoUrl.value    = data.logoUrl    ?? "";
    form.logoutUrl.value  = data.logoutUrl  ?? "";

    msg.textContent = "Klaar";
    setTimeout(() => (msg.textContent = ""), 1200);
  } catch (e) {
    console.error(e);
    msg.textContent = "Fout bij laden";
  }
}

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const payload = {
    orgName:    form.orgName.value.trim(),
    email:      form.email.value.trim(),
    phone:      form.phone.value.trim(),
    vat:        form.vat.value.trim(),
    street:     form.street.value.trim(),
    postalCode: form.postalCode.value.trim(),
    city:       form.city.value.trim(),
    country:    form.country.value.trim(),
    logoUrl:    form.logoUrl.value.trim(),
    logoutUrl:  form.logoutUrl.value.trim(),
  };

  // Kleine validatie
  if (!payload.orgName) {
    msg.textContent = "Naam is verplicht";
    return;
  }

  try {
    msg.textContent = "Opslaan…";
    const res = await fetch(API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Opslaan mislukt");
    msg.textContent = "Opgeslagen ✔";
    setTimeout(() => (msg.textContent = ""), 1500);
  } catch (e) {
    console.error(e);
    msg.textContent = "Fout bij opslaan";
  }
});

resetBtn.addEventListener("click", loadSettings);

// Init
document.addEventListener("DOMContentLoaded", loadSettings);
