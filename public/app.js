// ============== OVERZICHT (zoeken + keuze + klantfiche) =================
(() => {
  const qInput   = document.getElementById("ov-q");
  const btn      = document.getElementById("ov-search");
  const pickBox  = document.getElementById("ov-pick");
  const pickList = document.getElementById("ov-pick-list");
  const results  = document.getElementById("ov-results");
  const section  = document.getElementById("view-overview");

  if (!qInput || !btn || !pickBox || !pickList || !results || !section) return;
function renderOverviewCard(ov) {
  const c = ov.customer || {};
  const dogs = ov.dogs || [];
  const passes = ov.passes || [];
  const past = (ov.lessons && ov.lessons.past) || [];
  const future = (ov.lessons && ov.lessons.future) || [];

  return `
    <div style="margin-bottom:12px;">
      <button id="backToMatches" class="btn">← Terug naar resultaten</button>
    </div>

    <h3>Klant</h3>
    <div class="card" style="margin-bottom:12px;">
      <div><b>${escapeHtml(c.name || "-")}</b></div>
      <div class="muted">${escapeHtml(c.email || "-")} • ${escapeHtml(c.phone || "-")}</div>
      <div class="muted">ID: ${escapeHtml(c.id)}</div>
    </div>
    ...
  `;
}

  
  const escapeHtml = (s="") => String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));

  function showPickList(matches) {
    if (!matches?.length) { pickBox.style.display = "none"; return; }
    pickBox.style.display = "block";
    pickList.innerHTML = matches.map(m => {
      const c = m.customer || {};
      const tag = m.match === "dog" ? "Hond" : "Klant";
      const sub = [c.email, c.phone].filter(Boolean).join(" • ");
      return `
        <div class="pick-item">
          <div>
            <div><strong>${escapeHtml(c.name || "-")}</strong> <span class="badge">${tag}</span></div>
            <div class="muted">ID: ${escapeHtml(c.id)} ${sub ? " • " + escapeHtml(sub) : ""}</div>
          </div>
          <div>
            <button class="primary pick-btn" data-id="${c.id}">Kies</button>
          </div>
        </div>
      `;
    }).join("");

    // Koppelen
    pickList.querySelectorAll(".pick-btn").forEach(b => {
      b.addEventListener("click", () => {
        const id = Number(b.dataset.id);
        loadOverview(id);
      });
    });
  }

  async function search() {
    const term = (qInput.value || "").trim();
    results.style.display = "block";
    results.innerHTML = `Zoeken…`;
    pickBox.style.display = "none";
    pickList.innerHTML = "";

    if (term.length < 2) {
      results.innerHTML = `<div class="muted">Geef min. 2 tekens in.</div>`;
      return;
    }

    try {
      const base = location.origin;
      const r1 = await fetch(`${base}/api/customers/search?q=${encodeURIComponent(term)}`);
      const matches = await r1.json();

      if (!Array.isArray(matches) || matches.length === 0) {
        results.innerHTML = `<div class="muted">Geen klant of hond gevonden voor <b>${escapeHtml(term)}</b>.</div>`;
        return;
      }
      if (matches.length === 1) {
        // direct door naar overview
        await loadOverview(matches[0].customer.id);
        return;
      }
      // toon keuzelijst
      results.innerHTML = `<div class="muted">Kies een klant uit de lijst hieronder.</div>`;
      showPickList(matches);
    } catch (e) {
      results.innerHTML = `<div class="error">Fout bij zoeken: ${escapeHtml(e.message)}</div>`;
    }
  }

  async function loadOverview(customerId) {
    try {
      const base = location.origin;
      results.style.display = "block";
      results.innerHTML = `Laden…`;
      pickBox.style.display = "none";

      const r2 = await fetch(`${base}/api/customers/overview/${encodeURIComponent(customerId)}`);
      if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
      const ov = await r2.json();

      results.innerHTML = renderOverviewCard(ov);
    } catch (e) {
      results.innerHTML = `<div class="error">Fout bij laden: ${escapeHtml(e.message)}</div>`;
    }
  }

  function renderOverviewCard(ov) {
    const c = ov.customer || {};
    const dogs = ov.dogs || [];
    const passes = ov.passes || [];
    const past = (ov.lessons && ov.lessons.past) || [];
    const future = (ov.lessons && ov.lessons.future) || [];

    const dogsHtml = dogs.length
      ? dogs.map(d => `
          <li style="display:flex; align-items:center; gap:10px;">
            ${d.photoUrl ? `<img src="${escapeHtml(d.photoUrl)}" alt="hond" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid #0002;" />` : ""}
            <div>
              <div><b>${escapeHtml(d.name)}</b>${d.breed ? ` — ${escapeHtml(d.breed)}` : ""}</div>
              <div class="muted">
                ${d.birthdate ? `Geboren: ${escapeHtml(d.birthdate)} • ` : ""}
                ${d.gender ? `Geslacht: ${escapeHtml(d.gender)} • ` : ""}
                ${d.vaccinationStatus ? `Vacc.: ${escapeHtml(d.vaccinationStatus)} ` : ""}
              </div>
            </div>
          </li>
        `).join("")
      : `<li class="muted">Geen honden geregistreerd.</li>`;

    const passesHtml = passes.length
      ? `<ul class="bullets">` + passes.map(p => {
          const rest = Math.max(0, Number(p.total) - Number(p.used || 0));
          return `<li>${escapeHtml(p.lessonType)} — totaal: ${p.total}, gebruikt: ${p.used || 0}, resterend: ${rest}</li>`;
        }).join("") + `</ul>`
      : `<div class="muted">Geen strippenkaarten gevonden.</div>`;

    const lessonsHtml = (arr) => arr.length
      ? `<ul class="bullets">` + arr.map(l => `
           <li>${escapeHtml(l.date)} ${l.startTime ? escapeHtml(l.startTime) : ""} — ${escapeHtml(l.classType || "-")} @ ${escapeHtml(l.location || "-")}</li>
         `).join("") + `</ul>`
      : `<div class="muted">Geen items.</div>`;

    return `
      <h3>Klant</h3>
      <div class="card" style="margin-bottom:12px;">
        <div><b>${escapeHtml(c.name || "-")}</b></div>
        <div class="muted">${escapeHtml(c.email || "-")} • ${escapeHtml(c.phone || "-")}</div>
        <div class="muted">ID: ${escapeHtml(c.id)}</div>
      </div>

      <h3>Honden</h3>
      <div class="card" style="margin-bottom:12px;">
        <ul style="padding-left:18px; margin:0;">${dogsHtml}</ul>
      </div>

      <h3>Strippenkaarten</h3>
      <div class="card" style="margin-bottom:12px;">
        ${passesHtml}
      </div>

      <h3>Reservaties</h3>
      <div class="card">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            <h4>Toekomstig (${ov.counters?.futureCount ?? future.length})</h4>
            ${lessonsHtml(future)}
          </div>
          <div>
            <h4>Verleden (${ov.counters?.pastCount ?? past.length})</h4>
            ${lessonsHtml(past)}
          </div>
        </div>
      </div>
    `;
  }

  // events
  btn.addEventListener("click", search);
  qInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); search(); } });

  // tab zichtbaar maken via jouw tab-router (voorbeeld):
  const tabBtn = document.querySelector('.tab[data-view="overview"]');
  tabBtn?.addEventListener("click", () => {
    document.querySelectorAll(".view").forEach(v => v.hidden = true);
    section.hidden = false;
    qInput.focus();
  });
})();
