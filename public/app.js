// Helpers voor element-ophalen
const $ = (sel) => document.querySelector(sel);

const elStatus   = $("#searchStatus");
const elInput    = $("#searchBox");
const elBtn      = $("#searchBtn");
const secCust    = $("#secCustomers");
const secDogs    = $("#secDogs");
const secPass    = $("#secPasses");
const cardsCust  = $("#cardsCustomers");
const cardsDogs  = $("#cardsDogs");
const cardsPass  = $("#cardsPasses");

// Kaart-templates
function cardCustomer(c){
  const init = (c.name || "?").trim().slice(0,1).toUpperCase();
  return `
    <div class="card">
      <div class="card-head">
        <div class="avatar customer">${init}</div>
        <div>
          <h3>${c.name || "Onbekende klant"}</h3>
          <div class="meta">${c.email || ""}${c.email && c.phone ? " • " : ""}${c.phone || ""}</div>
        </div>
      </div>
      ${c.address ? `<div class="kv"><b>Adres:</b> ${c.address}</div>` : ""}
    </div>
  `;
}

function cardDog(d){
  const init = (d.name || "?").trim().slice(0,1).toUpperCase();
  return `
    <div class="card">
      <div class="card-head">
        <div class="avatar dog">${init}</div>
        <div>
          <h3>${d.name || "Hond"}</h3>
          <div class="meta">${d.breed || "-"}${d.birthdate ? " • " + d.birthdate : ""}</div>
        </div>
      </div>
      ${d.ownerId ? `<div class="kv"><b>Eigenaar ID:</b> ${d.ownerId}</div>` : ""}
    </div>
  `;
}

function cardPass(p){
  const init = "SP";
  return `
    <div class="card">
      <div class="card-head">
        <div class="avatar pass">${init}</div>
        <div>
          <h3>${p.type || "Strippenkaart"}</h3>
          <div class="meta">Hond ID: ${p.dogId ?? "-"}</div>
        </div>
      </div>
      <div class="row">
        <span class="badge">Totaal: ${p.total ?? "-"}</span>
        <span class="badge">Resterend: ${p.remaining ?? "-"}</span>
      </div>
      ${p.validUntil ? `<div class="kv" style="margin-top:8px;"><b>Geldig tot:</b> ${p.validUntil}</div>` : ""}
    </div>
  `;
}

// Renderfunctie voor resultaten
function renderResults(payload, q){
  const r = payload?.results || {};
  const customers = r.customers || [];
  const dogs      = r.dogs || [];
  const passes    = r.passes || [];

  // status
  const any = customers.length + dogs.length + passes.length > 0;
  elStatus.textContent = any ? `Resultaten voor “${q}”` : `Geen resultaten voor “${q}”`;

  // Secties tonen/verbergen
  secCust.hidden = customers.length === 0;
  secDogs.hidden = dogs.length === 0;
  secPass.hidden = passes.length === 0;

  // Kaarten vullen
  cardsCust.innerHTML = customers.map(cardCustomer).join("");
  cardsDogs.innerHTML = dogs.map(cardDog).join("");
  cardsPass.innerHTML = passes.map(cardPass).join("");
}

// Zoeken
async function performSearch(){
  const q = (elInput?.value || "").trim();
  if (!q) { elStatus.textContent = "Typ eerst een zoekterm."; return; }

  elStatus.textContent = "Zoeken…";
  secCust.hidden = secDogs.hidden = secPass.hidden = true;
  cardsCust.innerHTML = cardsDogs.innerHTML = cardsPass.innerHTML = "";

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Onbekende fout");
    renderResults(data, q);
  } catch (err) {
    console.error(err);
    elStatus.textContent = "Zoeken mislukt. Controleer /api/search en de server logs.";
  }
}

// Events
if (elBtn) elBtn.addEventListener("click", performSearch);
if (elInput) elInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); performSearch(); }
});
