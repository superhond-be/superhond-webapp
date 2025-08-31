// Kleine helper
const $ = (sel) => document.querySelector(sel);
const API = {
  customers: "/api/customers",
  passesFor: (id) => `/api/passes/${id}`,
  passUse: "/api/passes/use",
};

function switchView(view) {
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === `view-${view}`));
}

// Tabs
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    switchView(btn.dataset.view);
    if (btn.dataset.view === "customers") loadCustomers();
    if (btn.dataset.view === "passes") loadPassesOverview();
  });
});

// Registratie form
$("#registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#formMsg").textContent = "Bezig…";

  const payload = {
    customer: {
      name: $("#c_name").value.trim(),
      email: $("#c_email").value.trim(),
      phone: $("#c_phone").value.trim(),
    },
    dog: {
      name: $("#d_name").value.trim(),
      breed: $("#d_breed").value.trim(),
      birthDate: $("#d_birth").value || "",
      gender: $("#d_gender").value,
      vetPhone: $("#d_vetPhone").value.trim(),
      vetName: $("#d_vetName").value.trim(),
      vaccineStatus: $("#d_vaccine").value.trim(),
      bookletRef: $("#d_booklet").value.trim(),
      emergency: $("#d_emergency").value.trim(),
    },
    lessonType: $("#lessonType").value || undefined,
  };

  // indien geen hondnaam opgegeven, stuur geen dog object door
  if (!payload.dog.name) delete payload.dog;

  try {
    const res = await fetch(API.customers, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Registratie mislukt");

    $("#formMsg").textContent = "✅ Geregistreerd";
    e.target.reset();
    loadCustomers();
    loadPassesOverview();
  } catch (err) {
    $("#formMsg").textContent = "❌ " + err.message;
  }
});

$("#reloadBtn").addEventListener("click", () => loadCustomers());

// Laders/renderers
async function loadCustomers() {
  const box = $("#customersList");
  box.textContent = "Laden…";
  try {
    const res = await fetch(API.customers);
    const list = await res.json();
    box.innerHTML = list.length ? "" : "<p class='muted'>Geen klanten gevonden.</p>";
    list.forEach(c => {
      const dogs = (c.dogs || []).map(d => `${d.name} (${d.breed || "-"})`).join(", ") || "—";
      const passes = (c.passes || [])
        .map(p => `${p.lessonType}: ${p.used}/${p.total}`)
        .join(" • ") || "—";

      const row = document.createElement("div");
      row.className = "item";
      row.innerHTML = `
        <div>
          <div class="title">${escapeHtml(c.name)}</div>
          <div class="muted">${escapeHtml(c.email || "")} ${escapeHtml(c.phone || "")}</div>
          <div class="muted">Honden: ${escapeHtml(dogs)}</div>
          <div class="muted">Strippen: ${escapeHtml(passes)}</div>
        </div>
        <div class="actions">
          <button data-cid="${c.id}" class="use1">Gebruik 1 strip</button>
        </div>
      `;
      row.querySelector(".use1").addEventListener("click", () => useOnePass(c.id));
      box.appendChild(row);
    });
  } catch {
    box.innerHTML = "<p class='error'>Kon klanten niet laden.</p>";
  }
}

async function useOnePass(customerId) {
  try {
    const res = await fetch(API.passUse, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, count: 1 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Mislukt");
    await loadCustomers();
    await loadPassesOverview();
  } catch (e) {
    alert("Strip gebruiken: " + e.message);
  }
}

async function loadPassesOverview() {
  const box = $("#passesList");
  box.textContent = "Laden…";
  try {
    const res = await fetch(API.customers);
    const list = await res.json();
    box.innerHTML = list.length ? "" : "<p class='muted'>Geen klanten.</p>";
    list.forEach(c => {
      const passes = (c.passes || []).map(p =>
        `<span class="pill">${escapeHtml(p.lessonType)}: ${p.used}/${p.total}</span>`
      ).join(" ");
      const row = document.createElement("div");
      row.className = "item";
      row.innerHTML = `
        <div>
          <div class="title">${escapeHtml(c.name)}</div>
          <div class="muted">${passes || "—"}</div>
        </div>
      `;
      box.appendChild(row);
    });
  } catch {
    box.innerHTML = "<p class='error'>Kon strippenkaarten niet laden.</p>";
  }
}

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
}

// Init
loadCustomers();
