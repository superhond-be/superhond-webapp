// ===== Helpers =====
async function fetchJSON(url, opts = {}) {
  const r = await fetch(url, opts);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]
  ));
}
function stamp() {
  return new Date().toLocaleString("nl-BE");
}
function showSection(id) {
  document.querySelectorAll("main > section").forEach(sec => sec.hidden = true);
  document.getElementById(id).hidden = false;
}

// ===== Tabs =====
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    showSection(btn.dataset.target);
  });
});

// ===== Klanten-tab =====
const cust = {
  section:        document.getElementById("section-customers"),
  btnTab:         document.getElementById("tab-customers"),
  btnSeed:        document.getElementById("seed-btn"),
  btnReload:      document.getElementById("customers-reload"),
  search:         document.getElementById("customers-search"),
  tableBody:      document.querySelector("#customers-table tbody"),
  updated:        document.getElementById("customers-updated"),
};

let _customersList = [];

function renderCustomersTable(list) {
  if (!cust.tableBody) return;
  if (!list || !list.length) {
    cust.tableBody.innerHTML = `<tr><td colspan="6" class="muted">(geen resultaten)</td></tr>`;
    return;
  }

  const rows = list.map(c => {
    const dogsTxt = (c.dogs && c.dogs.length) ? c.dogs.map(d => escapeHtml(d.name)).join(", ") : "—";
    const passesTxt = (c.passes && c.passes.length)
      ? c.passes.map(p => `${escapeHtml(p.type)} → ${Number(p.remaining ?? (p.totalStrips - (p.usedStrips||0)) || 0)}`).join("<br>")
      : "—";
    return `
      <tr data-customer-id="${c.id}">
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.email || "-")}</td>
        <td>${escapeHtml(c.phone || "-")}</td>
        <td>${dogsTxt}</td>
        <td>${passesTxt}</td>
        <td>
          <button class="tiny view-customer" data-id="${c.id}">Bekijken</button>
          <button class="tiny primary book-customer" data-id="${c.id}">Boek les</button>
        </td>
      </tr>`;
  });

  cust.tableBody.innerHTML = rows.join("");
  if (cust.updated) cust.updated.textContent = `Laatst bijgewerkt: ${stamp()}`;

  cust.tableBody.querySelectorAll(".view-customer").forEach(btn => {
    btn.addEventListener("click", () => openCustomerDetail(Number(btn.dataset.id)));
  });
  cust.tableBody.querySelectorAll(".book-customer").forEach(btn => {
    btn.addEventListener("click", () => openCustomerDetail(Number(btn.dataset.id), { focusForm:true }));
  });
}

async function loadCustomers(q = "") {
  const url = q ? `/api/customers?q=${encodeURIComponent(q)}` : "/api/customers";
  const list = await fetchJSON(url);
  _customersList = Array.isArray(list) ? list : [];
  renderCustomersTable(_customersList);
}

function wireCustomersTab() {
  if (!cust.section) return;

  cust.search?.addEventListener("input", (e) => {
    const val = (e.target.value || "").trim().toLowerCase();
    if (!val) return renderCustomersTable(_customersList);
    const filtered = _customersList.filter(c =>
      [c.name, c.email, c.phone].filter(Boolean)
        .some(v => String(v).toLowerCase().includes(val))
    );
    renderCustomersTable(filtered);
  });

  cust.btnReload?.addEventListener("click", async () => {
    cust.btnReload.disabled = true;
    try { await loadCustomers(); } finally { cust.btnReload.disabled = false; }
  });

  cust.btnSeed?.addEventListener("click", async () => {
    if (!confirm("Demo-gegevens opnieuw laden?")) return;
    cust.btnSeed.disabled = true;
    try {
      await fetch("/api/customers/dev/seed", { method:"POST" });
      await loadCustomers();
      alert("✅ Demo gevuld.");
    } catch (e) {
      console.error(e);
      alert("❌ Seed mislukt.");
    } finally {
      cust.btnSeed.disabled = false;
    }
  });

  loadCustomers().catch(console.error);
}
cust.btnTab?.addEventListener("click", () => {
  showSection("section-customers");
  wireCustomersTab();
});

// ===== Detailpaneel =====
async function openCustomerDetail(customerId, opts = {}) {
  const panel = document.getElementById("customer-detail");
  const title = document.getElementById("cd-title");
  const dogsUl = document.getElementById("cd-dogs");
  const passesTbody = document.querySelector("#cd-passes tbody");
  const lessonsTbody = document.querySelector("#cd-lessons tbody");
  const dogSelect = document.getElementById("cd-dog");
  const status = document.getElementById("cd-status");
  const form = document.getElementById("cd-lesson-form");

  if (!panel) return;
  panel.style.display = "block";
  status.textContent = "Laden…";

  try {
    const summary = await fetchJSON(`/api/customers/${customerId}/summary`);
    const { customer, dogs, passes, lessons } = summary;

    title.textContent = `Klantdetail — ${customer.name}`;

    dogsUl.innerHTML = dogs.length
      ? dogs.map(d => `<li>${escapeHtml(d.name)}</li>`).join("")
      : "<li>— geen honden —</li>";

    dogSelect.innerHTML = dogs.length
      ? dogs.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join("")
      : `<option value="">(geen honden)</option>`;

    passesTbody.innerHTML = passes.length
      ? passes.map(p => `<tr><td>${escapeHtml(p.type)}</td><td>${Number(p.remaining)}</td></tr>`).join("")
      : `<tr><td colspan="2">— geen strippenkaarten —</td></tr>`;

    lessonsTbody.innerHTML = lessons.length
      ? lessons.map(l => `
        <tr>
          <td>${escapeHtml(l.date)}</td>
          <td>${escapeHtml(l.startTime)}-${escapeHtml(l.endTime||"")}</td>
          <td>${escapeHtml(l.classType)}</td>
          <td>${escapeHtml(dogs.find(d => d.id===l.dogId)?.name || "-" )}</td>
          <td>${escapeHtml(l.location||"-")}</td>
          <td><button class="tiny danger cancel-lesson" data-id="${l.id}">Annuleer</button></td>
        </tr>`).join("")
      : `<tr><td colspan="6">— geen lessen —</td></tr>`;

    lessonsTbody.querySelectorAll(".cancel-lesson").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm("Les annuleren?")) return;
        await fetch(`/api/lessons/${id}`, { method:"DELETE" });
        openCustomerDetail(customerId);
      });
    });

    form.dataset.customerId = customer.id;
    status.textContent = "—";
    if (opts.focusForm) document.getElementById("cd-class")?.focus();
  } catch (e) {
    status.textContent = "❌ Laden mislukt.";
  }
}

document.getElementById("cd-lesson-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const status = document.getElementById("cd-status");
  const customerId = Number(form.dataset.customerId || 0);
  const data = Object.fromEntries(new FormData(form).entries());

  const payload = {
    customerId,
    dogId: data.dogId ? Number(data.dogId) : null,
    classType: data.classType,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    location: data.location
  };

  status.textContent = "Boeken…";
  try {
    await fetchJSON("/api/lessons", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    status.textContent = "✅ Les geboekt.";
    openCustomerDetail(customerId);
  } catch (e2) {
    status.textContent = "❌ " + e2.message;
  }
});
