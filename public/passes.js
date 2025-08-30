// public/passes.js
const API = {
  customers: "/api/customers",
  passTypes: "/api/passes/types",
  purchases: "/api/passes/purchases",
  buy: "/api/passes/buy",
  use: "/api/passes/use",
};

const els = {
  customer: null,
  type: null,
  btnBuy: null,
  btnAddType: null,
  newName: null,
  newStrips: null,
  list: null,
};

async function http(method, url, data) {
  const opt = { method, headers: { "Content-Type": "application/json" } };
  if (data) opt.body = JSON.stringify(data);
  const r = await fetch(url, opt);
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`${r.status} ${r.statusText} - ${t}`);
  }
  return r.json().catch(() => ({}));
}

async function loadCustomers() {
  const list = await http("GET", API.customers);
  els.customer.innerHTML = "";
  for (const c of list) {
    const o = document.createElement("option");
    o.value = c.id;
    o.textContent = `${c.name} ${c.email ? `(${c.email})` : ""}`;
    els.customer.appendChild(o);
  }
  // als er een klant is, meteen aankopen tonen
  if (list.length) loadPurchases();
  else els.list.innerHTML = `<div class="muted">Geen klanten gevonden.</div>`;
}

async function loadTypes() {
  const list = await http("GET", API.passTypes);
  els.type.innerHTML = "";
  for (const t of list) {
    const o = document.createElement("option");
    o.value = t.id;
    o.textContent = `${t.name} – ${t.strips} strips`;
    els.type.appendChild(o);
  }
  if (!list.length) {
    els.type.innerHTML = `<option value="">Nog geen types</option>`;
  }
}

async function loadPurchases() {
  const cid = els.customer.value;
  if (!cid) {
    els.list.innerHTML = `<div class="muted">Selecteer eerst een klant.</div>`;
    return;
  }
  const list = await http("GET", `${API.purchases}?customerId=${cid}`);
  if (!list.length) {
    els.list.innerHTML = `<div class="muted">Nog geen aankopen voor deze klant.</div>`;
    return;
  }
  els.list.innerHTML = "";
  for (const p of list) {
    const row = document.createElement("div");
    row.className = "row";

    const left = document.createElement("div");
    left.className = "col";
    left.textContent = `Aankoop #${p.id} – typeId: ${p.typeId} – resterend: ${p.remaining}`;

    const right = document.createElement("div");
    right.className = "col";
    const btnUse = document.createElement("button");
    btnUse.className = "btn";
    btnUse.textContent = "Gebruik 1 strip";
    btnUse.onclick = async () => {
      try {
        const updated = await http("POST", API.use, { purchaseId: p.id });
        alert(`Ok! Resterend: ${updated.remaining}`);
        loadPurchases();
      } catch (e) {
        alert(`Fout: ${e.message}`);
      }
    };
    right.appendChild(btnUse);

    row.appendChild(left);
    row.appendChild(right);
    els.list.appendChild(row);
  }
}

async function addType() {
  const name = (els.newName.value || "").trim();
  const strips = Number(els.newStrips.value);
  if (!name || !Number.isFinite(strips) || strips <= 0) {
    alert("Geef een geldige naam en aantal strips (>0).");
    return;
  }
  try {
    await http("POST", API.passTypes, { name, strips });
    els.newName.value = "";
    await loadTypes();
    alert("Type toegevoegd.");
  } catch (e) {
    alert(`Fout: ${e.message}`);
  }
}

async function buyForCustomer() {
  const cid = Number(els.customer.value);
  const typeId = Number(els.type.value);
  if (!cid || !typeId) {
    alert("Selecteer klant en type.");
    return;
  }
  try {
    await http("POST", API.buy, { customerId: cid, typeId });
    alert("Gekocht!");
    loadPurchases();
  } catch (e) {
    alert(`Fout: ${e.message}`);
  }
}

function wire() {
  els.customer = document.getElementById("passesCustomer");
  els.type = document.getElementById("passesType");
  els.btnBuy = document.getElementById("btnBuyPass");
  els.btnAddType = document.getElementById("btnAddType");
  els.newName = document.getElementById("newPassName");
  els.newStrips = document.getElementById("newPassStrips");
  els.list = document.getElementById("purchasesList");

  els.customer.addEventListener("change", loadPurchases);
  els.btnAddType.addEventListener("click", addType);
  els.btnBuy.addEventListener("click", buyForCustomer);
}

window.addEventListener("DOMContentLoaded", async () => {
  wire();
  try {
    await Promise.all([loadCustomers(), loadTypes()]);
  } catch (e) {
    console.error(e);
    alert("Kon strippenkaart-UI niet initialiseren.");
  }
});
