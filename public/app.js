/* ============================================================
   Superhond – public/app.js  (VOLLEDIG VERVANGEN)
   ============================================================ */

/* ---------- Kleine helpers ---------- */
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}
async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(body || {})
  });
  if (!res.ok) {
    const t = await res.text().catch(()=> "");
    throw new Error(`POST ${url} -> ${res.status} ${t}`);
  }
  try { return await res.json(); } catch { return {}; }
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function stamp() {
  const d=new Date(), p=n=>String(n).padStart(2,"0");
  return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function setBusy(el, busy=true) {
  if (!el) return;
  if (busy) { el.setAttribute("disabled","disabled"); el.classList.add("is-busy"); }
  else { el.removeAttribute("disabled"); el.classList.remove("is-busy"); }
}

/* ---------- Tab navigatie ---------- */
function wireTabs() {
  const btns = $$(".tab-btn");
  const sections = $$(".tab-section");
  if (!btns.length || !sections.length) return;

  function show(targetId) {
    sections.forEach(sec => sec.hidden = sec.id !== targetId);
    btns.forEach(b => b.classList.toggle("active", b.dataset.target === targetId));
  }

  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (target) show(target);
      // Event sturen zodat specifieke tab code kan initialiseren
      document.dispatchEvent(new CustomEvent("tab:open", { detail:{ id: target }}));
    });
  });

  // Eerste tab als actief markeren (als nog geen active is)
  const currentActive = btns.find(b => b.classList.contains("active")) || btns[0];
  if (currentActive) {
    const target = currentActive.dataset.target;
    show(target);
    document.dispatchEvent(new CustomEvent("tab:open", { detail:{ id: target }}));
  }
}

/* ============================================================
   LESSONS TAB (boeken + strippenkaart acties)
   Vereist in HTML:
   - Selects: #ls-customer, #ls-dog, #ls-classType
   - Inputs:  #ls-location, #ls-date, #ls-start, #ls-end
   - Buttons: #ls-book
   - Status:  #ls-book-status, #lessons-last-updated
   - Passes:  #ps-customer, #ps-classType, #ps-check, #ps-remaining, #ps-use, #ps-use-status
   Endpoints (pas aan indien nodig):
   - GET  /api/customers  (verwacht [{id,name,email,dogs:[{id,name}]}] of zonder dogs)
   - POST /api/lessons    ({customerId,dogId,classType,date,startTime,endTime,location})
   - GET  /api/passes?customerId=.. (lijst met kaarten voor klant; gebruikt in overview, optioneel hier)
   - GET  /api/passes?customerId=..&classType=.. (backend kan je uitbreiden om remaining op te leveren)
   - POST /api/passes/use ({customerId,classType,count})
   ============================================================ */
const API = {
  customers: "/api/customers",
  lessons:   "/api/lessons",
  passes:    "/api/passes",
  usePass:   "/api/passes/use"
};

const ls = {
  customerSel: $("#ls-customer"),
  dogSel:      $("#ls-dog"),
  classSel:    $("#ls-classType"),
  loc:         $("#ls-location"),
  date:        $("#ls-date"),
  start:       $("#ls-start"),
  end:         $("#ls-end"),
  bookBtn:     $("#ls-book"),
  status:      $("#ls-book-status"),
  updated:     $("#lessons-last-updated")
};
const ps = {
  customerSel: $("#ps-customer"),
  classSel:    $("#ps-classType"),
  checkBtn:    $("#ps-check"),
  remaining:   $("#ps-remaining"),
  useBtn:      $("#ps-use"),
  useStatus:   $("#ps-use-status")
};

let _customersCache = [];   // [{id,name,email,dogs:[{id,name}]}]

async function loadCustomersInto(selects = []) {
  try {
    if (!_customersCache.length) {
      _customersCache = await fetchJSON(API.customers);
      // fallback als backend geen dogs inline retourneert:
      _customersCache = _customersCache.map(c => ({ ...c, dogs: Array.isArray(c.dogs) ? c.dogs : (c.dogs ? c.dogs : []) }));
      _customersCache.sort((a,b)=> a.name.localeCompare(b.name));
    }
    const options = ['<option value="">— kies klant —</option>']
      .concat(_customersCache.map(c => `<option value="${c.id}">${escapeHtml(c.name)} (${escapeHtml(c.email||"-")})</option>`));
    selects.forEach(sel => { if (sel) sel.innerHTML = options.join(""); });
  } catch (e) {
    console.error("loadCustomersInto:", e);
    selects.forEach(sel => { if (sel) sel.innerHTML = '<option value="">(laden mislukt)</option>'; });
  }
}

function refreshDogsFor(customerId) {
  if (!ls.dogSel) return;
  const c = _customersCache.find(x => String(x.id) === String(customerId));
  const dogs = c?.dogs || [];
  ls.dogSel.innerHTML = dogs.length
    ? dogs.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join("")
    : '<option value="">(geen honden)</option>';
}

async function wireLessonsTab() {
  if (!ls.customerSel && !ps.customerSel) return; // tab niet aanwezig

  // Init dropdowns
  await loadCustomersInto([ls.customerSel, ps.customerSel].filter(Boolean));

  // Bij start: selecteer eerste klant indien beschikbaar
  if (ls.customerSel && ls.customerSel.options.length > 1) {
    ls.customerSel.selectedIndex = 1;
    refreshDogsFor(ls.customerSel.value);
  }
  if (ps.customerSel && ps.customerSel.options.length > 1) {
    ps.customerSel.selectedIndex = 1;
  }

  // Events
  ls.customerSel?.addEventListener("change", () => refreshDogsFor(ls.customerSel.value));

  ls.bookBtn?.addEventListener("click", async () => {
    if (!ls.customerSel || !ls.dogSel || !ls.classSel || !ls.date || !ls.start || !ls.end) return;
    ls.status.textContent = "";
    const payload = {
      customerId: Number(ls.customerSel.value || 0),
      dogId:      Number(ls.dogSel.value || 0),
      classType:  ls.classSel.value || "",
      location:   (ls.loc?.value || "").trim() || null,
      date:       ls.date.value || "",
      startTime:  ls.start.value || "",
      endTime:    ls.end.value || ""
    };
    if (!payload.customerId || !payload.dogId || !payload.classType || !payload.date || !payload.startTime || !payload.endTime) {
      ls.status.textContent = "Gelieve alle velden in te vullen.";
      return;
    }
    setBusy(ls.bookBtn, true);
    try {
      await postJSON(API.lessons, payload);
      ls.status.textContent = "✅ Les toegevoegd (strip afgeschreven).";
      if (ls.updated) ls.updated.textContent = `Laatste update: ${stamp()}`;
    } catch (e) {
      console.error("Les toevoegen:", e);
      ls.status.textContent = "❌ Fout bij les toevoegen (controleer strippenkaart).";
    } finally {
      setBusy(ls.bookBtn, false);
    }
  });

  ps.checkBtn?.addEventListener("click", async () => {
    if (!ps.customerSel || !ps.classSel || !ps.remaining) return;
    ps.remaining.textContent = "…";
    try {
      // Je backend mag ofwel lijst teruggeven, of enkel 1 object met remaining.
      const url = `${API.passes}?customerId=${encodeURIComponent(ps.customerSel.value)}&classType=${encodeURIComponent(ps.classSel.value)}`;
      const data = await fetchJSON(url);
      if (Array.isArray(data)) {
        // neem som van alle matching kaarten of toon eerste
        const rem = data.reduce((acc, p) => acc + Number(p.remaining ?? p.strips ?? 0), 0);
        ps.remaining.textContent = `${rem} strips`;
      } else {
        const rem = Number(data.remaining ?? data.strips ?? 0);
        ps.remaining.textContent = `${rem} strips`;
      }
      if (ls.updated) ls.updated.textContent = `Laatste update: ${stamp()}`;
    } catch (e) {
      console.error("Passes check:", e);
      ps.remaining.textContent = "fout";
    }
  });

  ps.useBtn?.addEventListener("click", async () => {
    if (!ps.customerSel || !ps.classSel || !ps.useStatus) return;
    ps.useStatus.textContent = "";
    const payload = { customerId: Number(ps.customerSel.value || 0), classType: ps.classSel.value, count: 1 };
    if (!payload.customerId || !payload.classType) {
      ps.useStatus.textContent = "Kies klant & lestype.";
      return;
    }
    setBusy(ps.useBtn, true);
    try {
      await postJSON(API.usePass, payload);
      ps.useStatus.textContent = "✅ 1 strip gebruikt.";
      ps.checkBtn?.click(); // direct bijwerken
    } catch (e) {
      console.error("Use pass:", e);
      ps.useStatus.textContent = "❌ Kon strip niet gebruiken.";
    } finally {
      setBusy(ps.useBtn, false);
      if (ls.updated) ls.updated.textContent = `Laatste update: ${stamp()}`;
    }
  });
}

/* ============================================================
   OVERZICHT STRIPPENKAARTEN (filters + sorteerbaar)
   Vereist in HTML:
   - Tabel:  #passes-table (thead th: name,email,type,remaining) + tbody
   - Knoppen: #passes-refresh
   - Filters: #filter-class, #filter-threshold, #filter-apply, #filter-reset
   - Info:    #passes-last-update, #filter-summary
   Endpoints:
   - GET /api/customers
   - GET /api/passes?customerId=ID   => lijst( type, remaining | strips )
   ============================================================ */

const passesTableBody   = $("#passes-table tbody");
const passesRefreshBtn  = $("#passes-refresh");
const passesLastUpdate  = $("#passes-last-update");
const passesTableEl     = $("#passes-table");
const filterClassSel    = $("#filter-class");
const filterThInput     = $("#filter-threshold");
const filterApplyBtn    = $("#filter-apply");
const filterResetBtn    = $("#filter-reset");
const filterSummaryEl   = $("#filter-summary");

let passesRows = [];   // ruwe data [{name,email,type,remaining}]
let filteredRows = [];
let sortState = { key: "name", dir: "asc" };

function setSortIndicators() {
  if (!passesTableEl) return;
  passesTableEl.querySelectorAll("th .sort").forEach(s => s.textContent = "");
  const th = passesTableEl.querySelector(`th[data-key="${sortState.key}"] .sort`);
  if (th) th.textContent = sortState.dir === "asc" ? "▲" : "▼";
}
function sortRows(rows) {
  const { key, dir } = sortState;
  const mul = dir === "asc" ? 1 : -1;
  return [...rows].sort((a,b) => {
    const va = (a[key] ?? "");
    const vb = (b[key] ?? "");
    if (typeof va === "number" && typeof vb === "number") return (va - vb) * mul;
    return String(va).localeCompare(String(vb)) * mul;
  });
}
function applyFilters() {
  const wantType = (filterClassSel?.value || "").trim();
  const thRaw    = (filterThInput?.value || "").trim();
  const th       = thRaw === "" ? null : Number(thRaw);

  filteredRows = passesRows.filter(r => {
    if (wantType && r.type !== wantType) return false;
    if (th !== null) {
      const rem = Number(r.remaining ?? 0);
      if (!(rem < th)) return false;
    }
    return true;
  });

  const parts = [];
  if (wantType) parts.push(`type: ${wantType}`);
  if (th !== null) parts.push(`< ${th} strips`);
  if (filterSummaryEl) filterSummaryEl.textContent = parts.length ? `Filter actief (${parts.join(", ")})` : "";
}
function renderPassesTable() {
  if (!passesTableBody) return;
  setSortIndicators();
  const list = sortRows(filteredRows.length ? filteredRows : passesRows);
  if (!list.length) {
    passesTableBody.innerHTML = `<tr><td colspan="4">(geen resultaten)</td></tr>`;
    return;
  }
  passesTableBody.innerHTML = list.map(r => `
    <tr>
      <td>${escapeHtml(r.name)}</td>
      <td>${escapeHtml(r.email || "-")}</td>
      <td>${escapeHtml(r.type)}</td>
      <td>${r.remaining ?? 0}</td>
    </tr>
  `).join("");
}
async function loadPassesOverview() {
  if (!passesTableBody) return;
  passesTableBody.innerHTML = `<tr><td colspan="4">(laden...)</td></tr>`;
  if (filterSummaryEl) filterSummaryEl.textContent = "";
  filteredRows = [];
  try {
    const customers = await fetchJSON("/api/customers");
    const acc = [];
    for (const c of customers) {
      const list = await fetchJSON(`/api/passes?customerId=${encodeURIComponent(c.id)}`);
      if (Array.isArray(list) && list.length) {
        list.forEach(p => acc.push({
          name: c.name,
          email: c.email || "",
          type: p.type,
          remaining: Number(p.remaining ?? p.strips ?? 0)
        }));
      } else {
        acc.push({ name: c.name, email: c.email || "", type: "(geen strippenkaart)", remaining: null });
      }
    }
    passesRows = acc;
    applyFilters();
    renderPassesTable();
    if (passesLastUpdate) passesLastUpdate.textContent = `Laatste update: ${stamp()}`;
  } catch (e) {
    console.error("loadPassesOverview:", e);
    passesTableBody.innerHTML = `<tr><td colspan="4">❌ Laden mislukt</td></tr>`;
  }
}
function wirePassesOverview() {
  if (!passesTableEl) return;
  // Sort headers
  const heads = passesTableEl.querySelectorAll("thead th");
  const keys = ["name","email","type","remaining"];
  heads.forEach((th, i) => {
    th.setAttribute("data-key", keys[i]);
    if (!th.querySelector(".sort")) {
      const span = document.createElement("span");
      span.className = "sort";
      th.appendChild(span);
    }
    th.addEventListener("click", () => {
      const key = th.getAttribute("data-key");
      if (sortState.key === key) sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
      else { sortState.key = key; sortState.dir = key === "remaining" ? "desc" : "asc"; }
      renderPassesTable();
    });
  });

  passesRefreshBtn?.addEventListener("click", loadPassesOverview);
  filterApplyBtn?.addEventListener("click", () => { applyFilters(); renderPassesTable(); });
  filterResetBtn?.addEventListener("click", () => {
    if (filterClassSel) filterClassSel.value = "";
    if (filterThInput) filterThInput.value = "";
    filteredRows = [];
    if (filterSummaryEl) filterSummaryEl.textContent = "";
    renderPassesTable();
  });
}

// ==================== Tab: Klanten & Honden ====================

const people = {
  formCustomer:  document.getElementById("form-customer"),
  formDog:       document.getElementById("form-dog"),
  ownerSelect:   document.getElementById("dog-owner"),
  custStatus:    document.getElementById("cust-status"),
  dogStatus:     document.getElementById("dog-status"),
  tableBody:     document.getElementById("people-table"),
  reloadBtn:     document.getElementById("people-reload"),
  updated:       document.getElementById("people-updated"),
};

let _peopleCustomers = [];

async function peopleLoadCustomers() {
  _peopleCustomers = await fetchJSON("/api/customers");
  // zorg dat er altijd een array 'dogs' is (sommige backends sturen losse ids)
  _peopleCustomers = _peopleCustomers.map(c => ({
    ...c,
    dogs: Array.isArray(c.dogs) ? c.dogs : (c.dogs ? c.dogs : [])
  })).sort((a,b)=> a.name.localeCompare(b.name));

  // owner dropdown vullen
  if (people.ownerSelect) {
    people.ownerSelect.innerHTML = ['<option value="">— kies klant —</option>']
      .concat(_peopleCustomers.map(c => `<option value="${c.id}">${escapeHtml(c.name)} (${escapeHtml(c.email||"-")})</option>`))
      .join("");
  }
}

async function peopleRenderTable() {
  if (!people.tableBody) return;
  people.tableBody.innerHTML = `<tr><td colspan="4">(laden…)</td></tr>`;

  const rows = [];
  for (const c of _peopleCustomers) {
    // indien backend geen dogs in customer stopt, haal per klant op:
    let dogsFor = c.dogs;
    if (!Array.isArray(dogsFor) || (dogsFor.length && typeof dogsFor[0] !== "object")) {
      try {
        dogsFor = await fetchJSON(`/api/dogs?ownerId=${encodeURIComponent(c.id)}`);
      } catch { dogsFor = []; }
    }
    const dogsTxt = (dogsFor && dogsFor.length)
      ? dogsFor.map(d => escapeHtml(d.name)).join(", ")
      : "—";

    rows.push(`
      <tr>
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.email || "-")}</td>
        <td>${escapeHtml(c.phone || "-")}</td>
        <td>${dogsTxt}</td>
      </tr>
    `);
  }

  people.tableBody.innerHTML = rows.join("");
  if (people.updated) people.updated.textContent = `Laatste update: ${stamp()}`;
}

async function wirePeopleTab() {
  // laad klanten + dropdown
  try { await peopleLoadCustomers(); await peopleRenderTable(); } catch (e) { console.error(e); }

  // Nieuwe klant
  people.formCustomer?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!people.formCustomer) return;
    const fd = new FormData(people.formCustomer);
    const payload = {
      name: (fd.get("name") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim(),
      phone: (fd.get("phone") || "").toString().trim(),
      emergency: (fd.get("emergency") || "").toString().trim(), // wordt door backend genegeerd als die prop niet bestaat, dat is oké
    };
    if (!payload.name) { people.custStatus.textContent = "Naam is verplicht."; return; }

    setBusy(people.formCustomer.querySelector("button[type=submit]"), true);
    people.custStatus.textContent = "";
    try {
      await postJSON("/api/customers", payload);
      people.custStatus.textContent = "✅ Klant aangemaakt.";
      people.formCustomer.reset();
      await peopleLoadCustomers();
      await peopleRenderTable();
    } catch (e2) {
      console.error(e2);
      people.custStatus.textContent = "❌ Kon klant niet aanmaken.";
    } finally {
      setBusy(people.formCustomer.querySelector("button[type=submit]"), false);
    }
  });

  // Nieuwe hond
  people.formDog?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!people.formDog) return;
    const fd = new FormData(people.formDog);
    const payload = Object.fromEntries(fd.entries());
    if (!payload.ownerId || !payload.name) {
      people.dogStatus.textContent = "Kies klant en vul naam hond in.";
      return;
    }
    // converteer numeriek veld
    payload.ownerId = Number(payload.ownerId);

    setBusy(people.formDog.querySelector("button[type=submit]"), true);
    people.dogStatus.textContent = "";
    try {
      await postJSON("/api/dogs", payload);
      people.dogStatus.textContent = "✅ Hond toegevoegd.";
      people.formDog.reset();
      // dropdown opnieuw vullen (klantenlijst blijft gelijk, maar tabel verversen)
      await peopleRenderTable();
    } catch (e2) {
      console.error(e2);
      people.dogStatus.textContent = "❌ Kon hond niet toevoegen.";
    } finally {
      setBusy(people.formDog.querySelector("button[type=submit]"), false);
    }
  });

  // Herladen
  people.reloadBtn?.addEventListener("click", async () => {
    try {
      await peopleLoadCustomers();
      await peopleRenderTable();
    } catch (e3) {
      console.error(e3);
    }
  });
}

// activeer bij openen van de tab
document.addEventListener("tab:open", (ev) => {
  if (ev.detail?.id === "section-people") wirePeopleTab();
});
// als de tab al zichtbaar is bij laden:
if (document.getElementById("section-people") && !document.getElementById("section-people").hidden) {
  wirePeopleTab();
}


/* ---------- Start-up ---------- */
document.addEventListener("DOMContentLoaded", () => {
  wireTabs();

  // Init specifieke tabs zodra ze geopend worden
  document.addEventListener("tab:open", (ev) => {
    const id = ev.detail?.id || "";
    if (id === "section-lessons") {
      wireLessonsTab();  // laadt klanten & events
    }
    if (id === "section-passes-overview") {
      wirePassesOverview();
      loadPassesOverview();
    }
  });

  // Als een tab al zichtbaar is bij laden (geen hidden)
  if ($("#section-lessons") && !$("#section-lessons").hidden) wireLessonsTab();
  if ($("#section-passes-overview") && !$("#section-passes-overview").hidden) {
    wirePassesOverview(); loadPassesOverview();
  }
});
