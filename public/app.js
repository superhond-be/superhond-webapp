// public/app.js
// Grote, duidelijke zoek-UI met resultaatkaarten

(function () {
  const q = document.getElementById("srch-q");
  const run = document.getElementById("srch-run");
  const box = document.getElementById("srch-results");

  if (run && q && box) {
    run.addEventListener("click", search);
    q.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); search(); }
    });
  }

  function escapeHtml(s = "") {
    return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  async function search() {
    const term = (q.value || "").trim();
    if (term.length < 2) {
      box.innerHTML = `<div class="muted">Geef min. 2 tekens in.</div>`;
      return;
    }
    box.innerHTML = `Zoeken…`;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        box.innerHTML = `<div class="muted">Geen resultaten voor <b>${escapeHtml(term)}</b>.</div>`;
        return;
      }

      box.innerHTML = data.map(renderCard).join("");

      // Koppel “Bekijk klant”-knoppen (koppel aan jouw bestaande detailfunctie als die er is)
      box.querySelectorAll(".btn-view").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = Number(btn.dataset.id);
          // Als je al een detailpaneel hebt: window.loadOverview?.(id);
          alert(`Klant ${id} openen (koppel hier je eigen overzichtsfunctie)`);
        });
      });
    } catch (e) {
      box.innerHTML = `<div style="color:#b3261e">Fout: ${escapeHtml(e.message)}</div>`;
    }
  }

  function renderCard(row) {
    const c = row.customer || {};
    const dogs = row.dogsMatched || [];
    const passes = row.passesSummary || [];

    const dogsHtml = dogs.length
      ? `<ul class="result-list">${dogs.map(d => `<li>${escapeHtml(d.name)}${d.breed ? " — " + escapeHtml(d.breed) : ""}</li>`).join("")}</ul>`
      : `<div class="muted">Geen honden</div>`;

    const passesHtml = passes.length
      ? `<ul class="result-list">${passes.map(p => {
          const rest = Math.max(0, (p.total||0) - (p.used||0));
          return `<li>${escapeHtml(p.lessonType)} — totaal: <b>${p.total}</b>, gebruikt: <b>${p.used}</b>, resterend: <b>${rest}</b></li>`;
        }).join("")}</ul>`
      : `<div class="muted">Geen strippenkaarten</div>`;

    return `
      <div class="result-card">
        <div class="result-head">
          <div>
            <div class="result-title">${escapeHtml(c.name || "-")} <span class="chip">Klant</span></div>
            <div class="result-sub">${escapeHtml(c.email || "-")} • ${escapeHtml(c.phone || "-")} • ID: ${escapeHtml(c.id)}</div>
          </div>
          <div>
            <button class="btn-secondary btn-view" data-id="${escapeHtml(c.id)}">Bekijk klant</button>
          </div>
        </div>

        <div class="result-section">
          <h3>Honden</h3>
          ${dogsHtml}
        </div>

        <div class="result-section">
          <h3>Strippenkaarten</h3>
          ${passesHtml}
        </div>
      </div>
    `;
  }

(function setupSearch() {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const box = document.getElementById("searchResults");
  if (!form || !input || !box) return;

  function card(html) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = html;
    return div;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) { box.innerHTML = `<p>Typ eerst een zoekterm.</p>`; return; }

    box.textContent = "Zoeken…";
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const results = data?.results ?? [];

      box.innerHTML = "";
      if (!results.length) {
        box.innerHTML = `<p>Geen resultaten voor <strong>${q}</strong>.</p>`;
        return;
      }

      results.forEach(r => {
        if (r.type === "customer") {
          const dogs = r.dogs?.length
            ? `<ul>${r.dogs.map(d => `<li>${d.name} <small>(${d.breed})</small></li>`).join("")}</ul>`
            : `<em>Geen honden gekoppeld</em>`;
          box.appendChild(card(`
            <h3>👤 Klant: ${r.title}</h3>
            <p class="muted">${r.subtitle || ""}</p>
            <div><strong>Honden:</strong> ${dogs}</div>
          `));
        } else {
          const stats = r.stats || {};
          const owner = r.owner
            ? `👤 ${r.owner.name} <small>${r.owner.email || ""}</small>`
            : `<em>Geen eigenaar gevonden</em>`;
          const photo = r.photoUrl
            ? `<img class="dogphoto" src="${r.photoUrl}" alt="Foto van ${r.title}" />`
            : "";
          box.appendChild(card(`
            <h3>🐶 Hond: ${r.title}</h3>
            <p class="muted">${r.subtitle || ""}</p>
            ${photo}
            <div>${owner}</div>
            <div class="grid">
              <div><strong>Passes:</strong> ${stats.passesCount ?? 0}</div>
              <div><strong>Strips:</strong> ${(stats.usedStrips ?? 0)} / ${(stats.totalStrips ?? 0)}</div>
              <div><strong>Toekomstige lessen:</strong> ${stats.futureLessons ?? 0}</div>
              <div><strong>Voorbije lessen:</strong> ${stats.pastLessons ?? 0}</div>
            </div>
          `));
        }
      });
    } catch (err) {
      console.error(err);
      box.innerHTML = `<p>Zoeken mislukt. Probeer later opnieuw.</p>`;
    }
  });
})();
  
  // kleine footer “laatste update” (optioneel)
  document.addEventListener("DOMContentLoaded", () => {
    const footer = document.querySelector("footer");
    if (footer) {
      const now = new Date();
      const fmt = now.toLocaleString("nl-BE", { dateStyle: "medium", timeStyle: "short" });
      footer.innerHTML = `Laatst geladen: ${fmt}`;
    }
  });
})();

(function setupSearchUI() {
  const form   = document.getElementById("searchForm");
  const input  = document.getElementById("searchInput");
  const status = document.getElementById("searchStatus");
  const box    = document.getElementById("searchResults");
  if (!form || !input || !status || !box) return;

  function htmlTable(title, rows, columns) {
    if (!rows?.length) return "";
    const thead = `<thead><tr>${columns.map(c => `<th style="text-align:left; padding:8px;">${c.label}</th>`).join("")}</tr></thead>`;
    const tbody = `<tbody>${
      rows.map(r => `<tr>${
        columns.map(c => `<td style="padding:8px; border-top:1px solid #eee;">${c.render ? c.render(r) : (r[c.key] ?? "")}</td>`).join("")
      }</tr>`).join("")
    }</tbody>`;
    return `
      <div style="margin-top:16px;">
        <h3 style="margin:0 0 8px 0;">${title}</h3>
        <div style="overflow:auto;">
          <table style="border-collapse:collapse; width:100%; font-size:16px;">${thead}${tbody}</table>
        </div>
      </div>
    `;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    box.innerHTML = "";
    if (!q) { status.textContent = "Typ eerst een zoekterm."; return; }

    status.textContent = "Zoeken…";
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();

      // De backend geeft { ok, query, results: { customers, dogs, passes } }
      const r = payload?.results || {};
      const customers = r.customers || [];
      const dogs      = r.dogs || [];
      const passes    = r.passes || [];

      const customersTable = htmlTable("Klanten", customers, [
        { key: "name",  label: "Naam" },
        { key: "email", label: "E-mail" },
        { key: "phone", label: "Telefoon" },
      ]);

      const dogsTable = htmlTable("Honden", dogs, [
        { key: "name",  label: "Naam" },
        { key: "breed", label: "Ras" },
        { key: "ownerId", label: "Eigenaar ID" },
      ]);

      const passesTable = htmlTable("Strippenkaarten", passes, [
        { key: "type",      label: "Type" },
        { key: "total",     label: "Totaal" },
        { key: "remaining", label: "Resterend" },
        { key: "dogId",     label: "Hond ID" },
      ]);

      const any = customers.length + dogs.length + passes.length > 0;
      status.textContent = any
        ? `Resultaten voor “${payload.query ?? q}”.`
        : `Geen resultaten voor “${payload.query ?? q}”.`;

      box.innerHTML = customersTable + dogsTable + passesTable;
    } catch (err) {
      console.error(err);
      status.textContent = "Zoeken mislukt. Controleer /api/search en je store-data.";
      box.innerHTML = "";
    }
  });
})();
const resultsBox = document.getElementById("search-results");

function renderCustomer(customer) {
  return `
    <div class="result-card">
      <div class="tag">Klant</div>
      <h3>${customer.name}</h3>
      <p><strong>Email:</strong> ${customer.email}</p>
      <p><strong>Telefoon:</strong> ${customer.phone}</p>
    </div>
  `;
}

function renderDog(dog) {
  return `
    <div class="result-card">
      <div class="tag" style="background-color:#27ae60;">Hond</div>
      <h3>${dog.name}</h3>
      <p><strong>Ras:</strong> ${dog.breed}</p>
      <p><strong>Geboortedatum:</strong> ${dog.birthdate || "-"}</p>
    </div>
  `;
}

function renderPass(pass) {
  return `
    <div class="result-card">
      <div class="tag" style="background-color:#e67e22;">Strippenkaart</div>
      <h3>${pass.type}</h3>
      <p><strong>Beschikbaar:</strong> ${pass.remaining} strippen</p>
      <p><strong>Geldig tot:</strong> ${pass.validUntil}</p>
    </div>
  `;
}

async function performSearch() {
  const query = document.getElementById("searchBox").value.trim();
  if (!query) return;

  resultsBox.innerHTML = `<p>Zoeken naar <strong>${query}</strong>...</p>`;

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!data.ok || data.results.length === 0) {
      resultsBox.innerHTML = `<p>Geen resultaten gevonden voor <strong>${query}</strong>.</p>`;
      return;
    }

    // Bouw de kaarten
    resultsBox.innerHTML = data.results.map(item => {
      if (item.type === "customer") return renderCustomer(item);
      if (item.type === "dog") return renderDog(item);
      if (item.type === "pass") return renderPass(item);
      return "";
    }).join("");
  } catch (err) {
    console.error("Zoekfout:", err);
    resultsBox.innerHTML = `<p style="color:red;">Er ging iets mis bij het zoeken.</p>`;
  }
}
.results-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.result-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #2c3e50;
}

.result-card p {
  margin: 4px 0;
  color: #555;
  font-size: 14px;
}

.result-card .tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  background-color: #3498db;
  margin-bottom: 8px;
}

