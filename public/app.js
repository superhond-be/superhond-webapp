// public/app.js
(function () {
  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const escapeHtml = (s = "") =>
    String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) {
      for (const k of Object.keys(attrs)) {
        if (k === "style" && typeof attrs[k] === "object") Object.assign(n.style, attrs[k]);
        else if (k in n) n[k] = attrs[k];
        else n.setAttribute(k, attrs[k]);
      }
    }
    if (children !== undefined) {
      (Array.isArray(children) ? children : [children]).forEach((c) =>
        n.appendChild(typeof c === "string" ? document.createTextNode(c) : c)
      );
    }
    return n;
  }

  // ---------- Tab switch ----------
  (function initTabs() {
    const tabs = $$(".tab");
    function show(id) {
      $$("#view-register, #view-search").forEach((v) => (v.hidden = true));
      const section = document.getElementById(`view-${id}`);
      if (section) section.hidden = false;
      tabs.forEach((t) => t.classList.toggle("active", t.dataset.view === id));
      if (id === "search") $("#ov-q")?.focus();
    }
    tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.view)));
    show("register"); // default
  })();

  // =========================================================
  // 1) REGISTRATIE (klant + hond + foto)
  // =========================================================
  (function initRegistration() {
    const formEl = $("#register-form");
    const dogFileEl = $("#dog-photo");
    const previewBox = $("#dog-preview");
    const resultBox = $("#result");
    const resetBtn = $("#btn-reset");

    if (!formEl) return;

    // foto preview
    dogFileEl?.addEventListener("change", () => {
      previewBox.innerHTML = "";
      const f = dogFileEl.files?.[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      previewBox.appendChild(
        el("img", {
          src: url,
          alt: "Voorbeeld hond",
          style: { maxWidth: "160px", maxHeight: "160px", objectFit: "cover", borderRadius: "8px", border: "1px solid #2d3340" }
        })
      );
    });

    resetBtn?.addEventListener("click", () => {
      formEl.reset();
      previewBox.innerHTML = "";
      resultBox.innerHTML = "";
    });

    formEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      resultBox.textContent = "Versturen…";
      const submitBtn = formEl.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset._t = submitBtn.textContent;
        submitBtn.textContent = "Versturen…";
      }

      const fd = new FormData(formEl);
      if (dogFileEl?.files?.[0]) fd.set("dogPhoto", dogFileEl.files[0]);

      const need = ["customerName", "customerEmail", "dogName"];
      for (const k of need) {
        if (!String(fd.get(k) || "").trim()) {
          resultBox.innerHTML = `<span style="color:#b3261e">✖ Vul ${k} in.</span>`;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset._t || "Registreren";
          }
          return;
        }
      }

      try {
        const res = await fetch("/api/customers/register", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Registratie mislukt.");

        const { customer, dog } = data;
        const photoHtml = dog?.photoUrl
          ? `<img src="${dog.photoUrl}" alt="hond" style="max-width:120px;display:block;margin:10px 0;border-radius:8px;border:1px solid #2d3340;">`
          : "<em>geen foto</em>";

        resultBox.innerHTML = `
          <div style="color:#1f8b4c"><strong>✔ Geregistreerd!</strong></div>
          ${photoHtml}
          <div><strong>Klant:</strong> ${escapeHtml(customer.name)} (${escapeHtml(customer.email)})</div>
          <div><strong>Telefoon:</strong> ${escapeHtml(customer.phone || "-")}</div>
          <div><strong>Lestype:</strong> ${escapeHtml(customer.lessonType || "-")}</div>
          <div style="margin-top:8px"><strong>Hond:</strong> ${escapeHtml(dog.name)} (${escapeHtml(dog.breed || "-")})</div>
        `;
        formEl.reset();
        previewBox.innerHTML = "";
      } catch (err) {
        resultBox.innerHTML = `<span style="color:#b3261e">✖ ${escapeHtml(err.message)}</span>`;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset._t || "Registreren";
        }
      }
    });
  })();

  // =========================================================
  // 2) ZOEKEN → OVERZICHT → STRIPPENKAARTEN
  // =========================================================
  let currentCustomerId = null;
  let currentDogId = null;

  (function initSearch() {
    const qInput = $("#ov-q");
    const btn = $("#ov-search");
    const pickBox = $("#ov-pick");
    const pickList = $("#ov-pick-list");
    const results = $("#ov-results");

    if (!qInput || !btn || !pickBox || !pickList || !results) return;

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
        const r = await fetch(`/api/customers/search?q=${encodeURIComponent(term)}`);
        const matches = await r.json();
        if (!Array.isArray(matches) || matches.length === 0) {
          results.innerHTML = `<div class="muted">Geen resultaat voor <b>${escapeHtml(term)}</b>.</div>`;
          return;
        }
        if (matches.length === 1) {
          await loadOverview(matches[0].customer.id);
          return;
        }
        results.innerHTML = `<div class="muted">Kies een klant uit de lijst hieronder.</div>`;
        showPickList(matches);
      } catch (e) {
        results.innerHTML = `<div style="color:#b3261e">Fout bij zoeken: ${escapeHtml(e.message)}</div>`;
      }
    }

    function showPickList(matches) {
      pickBox.style.display = "block";
      pickList.innerHTML = matches
        .map((m) => {
          const c = m.customer || {};
          const tag = m.match === "dog" ? "Hond" : "Klant";
          const sub = [c.email, c.phone].filter(Boolean).join(" • ");
          return `
            <div class="pick-item">
              <div>
                <div><strong>${escapeHtml(c.name || "-")}</strong><span class="badge">${tag}</span></div>
                <div class="muted">ID: ${escapeHtml(c.id)} ${sub ? " • " + escapeHtml(sub) : ""}</div>
              </div>
              <div><button class="tab pick-btn" data-id="${c.id}">Kies</button></div>
            </div>`;
        })
        .join("");

      $$(".pick-btn", pickList).forEach((b) =>
        b.addEventListener("click", () => loadOverview(Number(b.dataset.id)))
      );
    }

    async function loadOverview(customerId) {
      try {
        results.style.display = "block";
        results.innerHTML = `Laden…`;
        pickBox.style.display = "none";

        const r2 = await fetch(`/api/customers/overview/${encodeURIComponent(customerId)}`);
        if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
        const ov = await r2.json();

        results.innerHTML = renderOverviewCard(ov);
        currentCustomerId = ov.customer?.id || null;
        currentDogId = null;

        // events
        $$(".dog-row", results).forEach((row) => {
          row.addEventListener("click", () => {
            $$(".dog-row", results).forEach((x) => x.classList.remove("active"));
            row.classList.add("active");
            currentDogId = Number(row.dataset.dogId);
            renderPasses();
            $("#passesBox")?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        });

        $("#newSearch")?.addEventListener("click", () => {
          pickBox.style.display = "none";
          results.style.display = "none";
          qInput.value = "";
          qInput.focus();
        });
      } catch (e) {
        results.innerHTML = `<div style="color:#b3261e">Fout bij laden: ${escapeHtml(e.message)}</div>`;
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
          ? dogs
              .map(
                (d) => `
          <div class="dog-row" data-dog-id="${d.id}">
            ${d.photoUrl ? `<img src="${escapeHtml(d.photoUrl)}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid #0002" />` : ""}
            <div>
              <div><b>${escapeHtml(d.name)}</b>${d.breed ? ` — ${escapeHtml(d.breed)}` : ""}</div>
              <div class="muted">${[d.birthdate && `Geboren: ${escapeHtml(d.birthdate)}`, d.gender, d.vaccinationStatus && `Vacc.: ${escapeHtml(d.vaccinationStatus)}`].filter(Boolean).join(" • ")}</div>
            </div>
          </div>`
              )
              .join("")
          : `<div class="muted">Geen honden geregistreerd.</div>`;

      const passesSummary =
        passes.length > 0
          ? `<ul style="padding-left:18px;margin:0">${passes
              .map((p) => {
                const rest = Math.max(0, Number(p.total) - Number(p.used || 0));
                return `<li>${escapeHtml(p.typeCode || p.type || "-")} — totaal: ${p.total ?? p.totalStrips ?? "-"}, gebruikt: ${p.used ?? p.usedStrips ?? 0}, resterend: ${rest}</li>`;
              })
              .join("")}</ul>`
          : `<div class="muted">Nog geen strippenkaarten.</div>`;

      const list = (arr) =>
        arr.length
          ? `<ul style="padding-left:18px;margin:0">${arr
              .map((l) => `<li>${escapeHtml(l.date || "-")} ${l.startTime ? escapeHtml(l.startTime) : ""} — ${escapeHtml(l.classType || "-")} @ ${escapeHtml(l.location || "-")}</li>`)
              .join("")}</ul>`
          : `<div class="muted">Geen items.</div>`;

      return `
        <div style="display:flex; gap:10px; margin-bottom:12px;">
          <button id="newSearch" class="secondary">🔍 Nieuwe zoekopdracht</button>
        </div>

        <h3>Klant</h3>
        <div class="card" style="margin-bottom:12px">
          <div><b>${escapeHtml(c.name || "-")}</b></div>
          <div class="muted">${escapeHtml(c.email || "-")} • ${escapeHtml(c.phone || "-")}</div>
          <div class="muted">ID: ${escapeHtml(c.id)}</div>
        </div>

        <h3>Honden (klik om strippenkaarten te beheren)</h3>
        <div class="list" style="margin-bottom:12px">${dogsHtml}</div>

        <h3>Strippenkaarten (samenvatting)</h3>
        <div class="card" style="margin-bottom:12px">${passesSummary}</div>

        <h3>Reservaties</h3>
        <div class="card" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><h4>Toekomstig (${ov.counters?.futureCount ?? 0})</h4>${list(future)}</div>
          <div><h4>Verleden (${ov.counters?.pastCount ?? 0})</h4>${list(past)}</div>
        </div>
      `;
    }

    // -------- Strippenkaarten paneel --------
    const passesList = $("#passesList");
    const addPassBtn = $("#addPassBtn");

    async function fetchPasses(customerId, dogId) {
      const r = await fetch(`/api/passes?customerId=${encodeURIComponent(customerId)}&dogId=${encodeURIComponent(dogId)}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }

    async function renderPasses() {
      if (!currentCustomerId || !currentDogId) {
        passesList.innerHTML = `<p class="muted">Kies eerst een hond hierboven.</p>`;
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
          <div class="card" style="display:flex;align-items:center;justify-content:space-between;gap:10px">
            <div><b>${escapeHtml(p.type)}</b> — ${escapeHtml(String(p.usedStrips))}/${escapeHtml(String(p.totalStrips))} gebruikt</div>
            <div>
              <button class="secondary consume-btn" data-id="${p.id}">➖ 1 strip</button>
            </div>
          </div>`
          )
          .join("");

        $$(".consume-btn", passesList).forEach((btn) =>
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const r = await fetch(`/api/passes/${encodeURIComponent(id)}/use`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ count: 1 })
            });
            if (r.ok) {
              renderPasses();
            } else {
              const err = await r.json().catch(() => ({}));
              alert("Fout: " + (err.message || `HTTP ${r.status}`));
            }
          })
        );
      } catch (e) {
        passesList.innerHTML = `<div style="color:#b3261e">Fout bij laden: ${escapeHtml(e.message)}</div>`;
      }
    }
    window.renderPasses = renderPasses; // optioneel extern oproepbaar

    addPassBtn?.addEventListener("click", async () => {
      if (!currentCustomerId || !currentDogId) {
        alert("Kies eerst een hond in het overzicht.");
        return;
      }
      const type = prompt("Type (bv. PUPPY / PUBER / GEV):");
      if (!type) return;
      const totalStrips = Number(prompt("Aantal strips (bv. 9):") || "0");
      if (!totalStrips || totalStrips <= 0) return;

      const r = await fetch("/api/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: currentCustomerId, dogId: currentDogId, type: String(type).toUpperCase(), totalStrips })
      });
      if (r.ok) renderPasses();
      else {
        const err = await r.json().catch(() => ({}));
        alert("Fout: " + (err.message || `HTTP ${r.status}`));
      }
    });
  })();
})();
