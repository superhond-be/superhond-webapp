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
