// ============================
// public/app.js (VOLLEDIG)
// ============================

// ---------- Kleine utils ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const escapeHtml = (s = "") =>
  String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

// ---------- Tab router ----------
(function initTabs() {
  const tabs = $$(".tab");
  const views = $$(".view");
  function show(viewId) {
    views.forEach((v) => (v.hidden = true));
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.hidden = false;
  }
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => show(btn.dataset.view));
  });

  // Toon eerste zichtbare view als default
  const first = tabs[0]?.dataset?.view;
  if (first) show(first);
})();

// ====================================================
// 1) REGISTRATIE: Klant + hond + foto-upload (preview)
// ====================================================
(function initRegistration() {
  const formEl = $("#register-form");
  const dogFileEl = $("#dogPhoto");
  const previewBox = $("#dog-preview");
  const resultBox = $("#result");
  const reloadBtn = $("#reloadBtn");

  if (!formEl || !dogFileEl || !previewBox || !resultBox) return; // sectie bestaat niet op deze pagina

  // Preview van de gekozen foto
  dogFileEl.addEventListener("change", () => {
    const file = dogFileEl.files?.[0];
    if (!file) {
      previewBox.innerHTML = "Nog geen foto geselecteerd.";
      return;
    }
    const url = URL.createObjectURL(file);
    previewBox.innerHTML = `<img src="${url}" alt="Voorbeeld hond" />`;
  });

  // Herladen knop
  reloadBtn?.addEventListener("click", () => location.reload());

  // Form submit met FormData (multipart)
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    resultBox.textContent = "Versturen…";

    const fd = new FormData(formEl);
    if (dogFileEl.files?.[0]) fd.set("dogPhoto", dogFileEl.files[0]);

    try {
      const res = await fetch("/api/customers/register", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Onbekende fout");

      const { customer, dog } = data;
      const photo = dog?.photoUrl
        ? `<img src="${dog.photoUrl}" alt="hond" style="max-width:120px;border-radius:8px;border:1px solid #334155" />`
        : "<em>geen foto</em>";

      resultBox.innerHTML = `
        <div style="color:#22c55e"><strong>✔ Geregistreerd!</strong></div>
        <div style="display:flex; gap:16px; align-items:flex-start; margin-top:8px">
          <div>${photo}</div>
          <div>
            <div><strong>Klant:</strong> ${escapeHtml(customer.name)} (${escapeHtml(customer.email)})</div>
            <div><strong>Telefoon:</strong> ${escapeHtml(customer.phone || "-")}</div>
            <div><strong>Lestype:</strong> ${escapeHtml(customer.lessonType || "-")}</div>
            <div style="margin-top:8px"><strong>Hond:</strong> ${escapeHtml(dog.name)} (${escapeHtml(dog.breed || "-")})</div>
          </div>
        </div>
      `;

      formEl.reset();
    } catch (err) {
      resultBox.innerHTML = `<div style="color:#ef4444">✖ ${escapeHtml(err.message)}</div>`;
    }
  });
})();

// ====================================================
// 2) OVERZICHT: zoeken → kiezen → totaaloverzicht klant
// ====================================================

// Gedeelde staat met Strippenkaarten-paneel
let currentCustomerId = null;
let currentDogId = null;

(function initOverview() {
  const qInput = $("#ov-q");
  const btn = $("#ov-search");
  const pickBox = $("#ov-pick");
  const pickList = $("#ov-pick-list");
  const results = $("#ov-results");
  const section = $("#view-overview");

  if (!qInput || !btn || !pickBox || !pickList || !results || !section) return;

  // Tab open → focus in zoekveld
  const tabBtn = $('.tab[data-view="overview"]');
  tabBtn?.addEventListener("click", () => {
    qInput.focus();
  });

  btn.addEventListener("click", search);
  qInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      search();
    }
  });

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
        await loadOverview(matches[0].customer.id);
        return;
      }
      results.innerHTML = `<div class="muted">Kies een klant uit de lijst hieronder.</div>`;
      showPickList(matches);
    } catch (e) {
      results.innerHTML = `<div class="error">Fout bij zoeken: ${escapeHtml(e.message)}</div>`;
    }
  }

  function showPickList(matches) {
    if (!matches?.length) {
      pickBox.style.display = "none";
      return;
    }
    pickBox.style.display = "block";
    pickList.innerHTML = matches
      .map((m) => {
        const c = m.customer || {};
        const tag = m.match === "dog" ? "Hond" : "Klant";
        const sub = [c.email, c.phone].filter(Boolean).join(" • ");
        return `
          <div class="pick-item" style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:.6rem .7rem;border-bottom:1px solid var(--line,#223);">
            <div>
              <div><strong>${escapeHtml(c.name || "-")}</strong> <span class="badge" style="display:inline-block;padding:.15rem .5rem;border-radius:999px;background:#1c4a6b;color:#d7efff;font-size:.8rem;margin-left:.4rem">${tag}</span></div>
              <div class="muted">ID: ${escapeHtml(c.id)} ${sub ? " • " + escapeHtml(sub) : ""}</div>
            </div>
            <div>
              <button class="primary pick-btn" data-id="${c.id}">Kies</button>
            </div>
          </div>
        `;
      })
      .join("");

    // Koppelen
    $$(".pick-btn", pickList).forEach((b) => {
      b.addEventListener("click", () => {
        const id = Number(b.dataset.id);
        loadOverview(id);
      });
    });
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

      // Zet huidige context voor strippenkaarten
      currentCustomerId = ov.customer?.id || null;
      currentDogId = null; // reset; gebruiker kiest zo een hond in de lijst

      // Buttons
      const backBtn = $("#backToMatches");
      backBtn?.addEventListener("click", () => {
        pickBox.style.display = "block";
        results.innerHTML = `<div class="muted">Kies opnieuw een klant.</div>`;
      });

      const newSearchBtn = $("#newSearch");
      newSearchBtn?.addEventListener("click", () => {
        pickBox.style.display = "none";
        results.style.display = "none";
        qInput.value = "";
        qInput.focus();
      });

      // Hondselectie voor strippenkaarten
      $$(".ov-dog-item").forEach((row) => {
        row.addEventListener("click", () => {
          currentDogId = Number(row.dataset.dogId);
          // Visueel markeren
          $$(".ov-dog-item").forEach((r) => (r.style.outline = "none"));
          row.style.outline = "2px solid #0ea5e9";
          // Strippenkaarten laden
          loadPasses();
          // Scroll naar passes
          $("#passesBox")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
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

    const dogsHtml =
      dogs.length > 0
        ? `<ul style="padding-left:0;list-style:none;margin:0;display:grid;gap:8px;">
            ${dogs
              .map(
                (d) => `
              <li class="ov-dog-item" data-dog-id="${d.id}" style="display:flex;align-items:center;gap:10px;padding:8px;border:1px solid #223;border-radius:8px;cursor:pointer;">
                ${d.photoUrl ? `<img src="${escapeHtml(d.photoUrl)}" alt="hond" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid #0002;" />` : ""}
                <div>
                  <div><b>${escapeHtml(d.name)}</b>${d.breed ? ` — ${escapeHtml(d.breed)}` : ""}</div>
                  <div class="muted">
                    ${d.birthdate ? `Geboren: ${escapeHtml(d.birthdate)} • ` : ""}
                    ${d.gender ? `Geslacht: ${escapeHtml(d.gender)} • ` : ""}
                    ${d.vaccinationStatus ? `Vacc.: ${escapeHtml(d.vaccinationStatus)} ` : ""}
                  </div>
                </div>
              </li>`
              )
              .join("")}
          </ul>`
        : `<div class="muted">Geen honden geregistreerd.</div>`;

    const passesHtml =
      passes.length > 0
        ? `<ul class="bullets" style="padding-left:18px;margin:0;">
            ${passes
              .map((p) => {
                const rest = Math.max(0, Number(p.total) - Number(p.used || 0));
                return `<li>${escapeHtml(p.lessonType || p.typeCode || "-")} — totaal: ${p.total ?? p.totalStrips ?? "-"}, gebruikt: ${p.used ?? p.usedStrips ?? 0}, resterend: ${rest}</li>`;
              })
              .join("")}
           </ul>`
        : `<div class="muted">Geen strippenkaarten gevonden (kies een hond hieronder om te beheren).</div>`;

    const lessonsHtml = (arr) =>
      arr.length
        ? `<ul class="bullets" style="padding-left:18px;margin:0;">
            ${arr
              .map(
                (l) => `
              <li>${escapeHtml(l.date)} ${l.startTime ? escapeHtml(l.startTime) : ""} — ${escapeHtml(l.classType || "-")} @ ${escapeHtml(l.location || "-")}</li>`
              )
              .join("")}
           </ul>`
        : `<div class="muted">Geen items.</div>`;

    return `
      <div style="margin-bottom:12px; display:flex; gap:10px;">
        <button id="backToMatches" class="btn">← Terug naar resultaten</button>
        <button id="newSearch" class="btn secondary">🔍 Nieuwe zoekopdracht</button>
      </div>

      <h3>Klant</h3>
      <div class="card" style="margin-bottom:12px;">
        <div><b>${escapeHtml(c.name || "-")}</b></div>
        <div class="muted">${escapeHtml(c.email || "-")} • ${escapeHtml(c.phone || "-")}</div>
        <div class="muted">ID: ${escapeHtml(c.id)}</div>
      </div>

      <h3>Honden</h3>
      <div class="card" style="margin-bottom:12px;">
        ${dogsHtml}
        <div class="muted" style="margin-top:6px;">Tip: klik een hond om strippenkaarten te beheren.</div>
      </div>

      <h3>Strippenkaarten (samenvatting)</h3>
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
})();

// ====================================================
// 3) STRIPPENKAARTEN-paneel (koppelt op geselecteerde hond)
// ====================================================
(function initPassesPanel() {
  const passesBox = $("#passesBox");
  const passesList = $("#passesList");
  const addPassBtn = $("#addPassBtn");
  if (!passesBox || !passesList || !addPassBtn) return;

  async function fetchPasses(customerId, dogId) {
    const r = await fetch(`/api/passes?customerId=${encodeURIComponent(customerId)}&dogId=${encodeURIComponent(dogId)}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  async function renderPasses() {
    if (!currentCustomerId || !currentDogId) {
      passesList.innerHTML = `<p class="muted">⚠️ Kies eerst een hond in het Overzicht (klik op een hondkaart).</p>`;
      return;
    }
    try {
      const data = await fetchPasses(currentCustomerId, currentDogId);
      if (!Array.isArray(data) || data.length === 0) {
        passesList.innerHTML = `<p>Geen strippenkaarten gevonden voor deze hond.</p>`;
        return;
      }
      passesList.innerHTML = data
        .map(
          (p) => `
        <div class="card" style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div><b>${escapeHtml(p.typeCode)}</b> — ${escapeHtml(String(p.usedStrips))}/${escapeHtml(String(p.totalStrips))} gebruikt</div>
          <div>
            <button class="btn consume-btn" data-id="${p.id}">➖ 1 strip</button>
          </div>
        </div>
      `
        )
        .join("");

      // Koppelen
      $$(".consume-btn", passesList).forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          const r = await fetch(`/api/passes/${encodeURIComponent(id)}/consume`, { method: "POST" });
          if (r.ok) {
            renderPasses();
          } else {
            const err = await r.json().catch(() => ({}));
            alert("Fout: " + (err.error || `HTTP ${r.status}`));
          }
        });
      });
    } catch (e) {
      passesList.innerHTML = `<div class="error">Fout bij laden: ${escapeHtml(e.message)}</div>`;
    }
  }

  // Nieuwe strippenkaart toevoegen
  addPassBtn.addEventListener("click", async () => {
    if (!currentCustomerId || !currentDogId) {
      alert("⚠️ Kies eerst een hond in het Overzicht.");
      return;
    }
    const typeCode = prompt("Geef het type in (PUPPY / PUBER / GEV):");
    if (!typeCode) return;

    const r = await fetch("/api/passes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: currentCustomerId, dogId: currentDogId, typeCode: typeCode.trim().toUpperCase() })
    });
    if (r.ok) {
      renderPasses();
    } else {
      const err = await r.json().catch(() => ({}));
      alert("Fout: " + (err.error || `HTTP ${r.status}`));
    }
  });

  // publiek maken voor Overview-module
  window.loadPasses = renderPasses;
})();

// Einde bestand
