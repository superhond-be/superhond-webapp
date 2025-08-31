/* =========================================================================
   HONDEN TAB – foto upload + preview + lijst met thumbnails
   Vereist server endpoints: 
     - POST /api/dogs/upload-photo (FormData 'dogPhoto') => { photoUrl }
     - GET  /api/dogs?customerId=...
     - POST /api/dogs (JSON)
   ======================================================================= */

const DogsUI = (() => {
  // ------- DOM refs (pas selectors aan als jouw HTML anders is) ----------
  const refs = {
    // Form velden
    customerId: document.getElementById("dogCustomerId") || document.getElementById("customerId"),
    name:       document.getElementById("dogName")       || document.getElementById("nameDog"),
    breed:      document.getElementById("breed"),
    birthdate:  document.getElementById("birthdate"),
    gender:     document.getElementById("gender"),
    vacc:       document.getElementById("vaccinationStatus") || document.getElementById("vacc"),
    bookletRef: document.getElementById("bookletRef"),
    vetName:    document.getElementById("vetName"),
    vetPhone:   document.getElementById("vetPhone"),
    emergency:  document.getElementById("emergency"),
    // Foto
    photoInput:  document.getElementById("dogPhoto"),
    photoPrev:   document.getElementById("dogPhotoPreview"),
    photoInfo:   document.getElementById("dogPhotoInfo"),
    // Acties/lijsten
    createBtn:   document.getElementById("dogCreateBtn") || document.querySelector("[data-action='dog-create']"),
    reloadBtn:   document.getElementById("dogsReloadBtn")|| document.querySelector("[data-action='dogs-reload']"),
    listBody:    document.getElementById("dogsListBody") || document.querySelector("#dogsTable tbody"),
    // (optioneel) filter
    filterCustomerId: document.getElementById("dogsFilterCustomerId")
  };

// ============== OVERZICHT (zoeken + klantfiche) =================
(() => {
  const qInput  = document.getElementById("ov-q");
  const btn     = document.getElementById("ov-search");
  const results = document.getElementById("ov-results");
  const section = document.getElementById("view-overview");

  if (!qInput || !btn || !results || !section) return;

  const escapeHtml = (s="") => String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));

  async function search() {
    const term = (qInput.value || "").trim();
    if (term.length < 2) {
      results.style.display = "block";
      results.innerHTML = `<div class="muted">Geef min. 2 tekens in.</div>`;
      return;
    }

    try {
      results.style.display = "block";
      results.innerHTML = `Zoeken…`;

      const base = location.origin; // werkt lokaal/render
      const r1 = await fetch(`${base}/api/customers/search?q=${encodeURIComponent(term)}`);
      const matches = await r1.json();
      if (!Array.isArray(matches) || matches.length === 0) {
        results.innerHTML = `<div class="muted">Geen klant of hond gevonden voor <b>${escapeHtml(term)}</b>.</div>`;
        return;
      }

      // Neem de eerste match; eventueel lijst tonen met keuze (kan later)
      const picked = matches[0].customer;
      const r2 = await fetch(`${base}/api/customers/overview/${picked.id}`);
      if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
      const ov = await r2.json();

      // Build UI
      results.innerHTML = renderOverviewCard(ov);
    } catch (e) {
      results.innerHTML = `<div class="error">Fout bij zoeken: ${escapeHtml(e.message)}</div>`;
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

  // maak zichtbaar via jouw tab-router (voorbeeld):
  const tabBtn = document.querySelector('.tab[data-view="overview"]');
  tabBtn?.addEventListener("click", () => {
    // verberg andere views en toon deze (pas aan naar jouw tab-systeem)
    document.querySelectorAll(".view").forEach(v => v.hidden = true);
    section.hidden = false;
    qInput.focus();
  });
})();
   
  // ------- Staat -------
  let currentFilterCustomerId = "";

  // ------- Helpers -------
  function toast(msg, type="info") {
    console.log(`[${type}]`, msg);
    // voeg gerust je eigen toast popup in
  }

  function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async function uploadPhoto(file) {
    const fd = new FormData();
    fd.append("dogPhoto", file);
    const res = await fetch("/api/dogs/upload-photo", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload mislukt");
    return res.json(); // { photoUrl }
  }

  async function fetchDogs(customerId) {
    const url = customerId ? `/api/dogs?customerId=${encodeURIComponent(customerId)}` : "/api/dogs";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Kon honden niet laden");
    return res.json();
  }

  function row(d) {
    return `
      <tr>
        <td>${d.id}</td>
        <td>${d.photoUrl ? `<img src="${d.photoUrl}" class="dogs-thumb" alt="hond">` : ""}</td>
        <td>${escapeHtml(d.name)}</td>
        <td>${escapeHtml(d.breed || "")}</td>
        <td>${escapeHtml(d.gender || "")}</td>
        <td>${escapeHtml(d.birthdate || "")}</td>
        <td>${escapeHtml(String(d.customerId))}</td>
      </tr>
    `;
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#39;");
  }

  async function renderList() {
    const list = await fetchDogs(currentFilterCustomerId);
    refs.listBody.innerHTML = list.map(row).join("") || `<tr><td colspan="7" class="muted">Nog geen honden</td></tr>`;
  }

  // ------- Event handlers -------
  async function onCreateDog() {
    try {
      // 1) eventueel foto uploaden
      let photoUrl = "";
      const file = refs.photoInput?.files?.[0];
      if (file) {
        const up = await uploadPhoto(file);
        photoUrl = up.photoUrl;
      }

      // 2) payload opbouwen
      const payload = {
        customerId: refs.customerId?.value || currentFilterCustomerId,
        name:       refs.name?.value?.trim(),
        breed:      refs.breed?.value || "",
        birthdate:  refs.birthdate?.value || "",
        gender:     refs.gender?.value || "",
        vaccinationStatus: refs.vacc?.value || "",
        bookletRef: refs.bookletRef?.value || "",
        vetName:    refs.vetName?.value || "",
        vetPhone:   refs.vetPhone?.value || "",
        emergencyNumber: refs.emergency?.value || "",
        photoUrl
      };

      // mini-validatie
      if (!payload.customerId) throw new Error("customerId ontbreekt");
      if (!payload.name)       throw new Error("Naam hond is verplicht");

      // 3) hond aanmaken
      const res = await fetch("/api/dogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.join(", ") || data?.error || "Aanmaken mislukt");

      toast("Hond geregistreerd", "success");

      // 4) form reset + preview reset
      if (refs.photoInput) refs.photoInput.value = "";
      if (refs.photoPrev)  { refs.photoPrev.src = ""; refs.photoPrev.style.display = "none"; }
      if (refs.photoInfo)  refs.photoInfo.textContent = "Geen bestand gekozen";

      // Naam/velden leegmaken naar wens
      if (refs.name) refs.name.value = "";
      if (refs.breed) refs.breed.value = "";
      if (refs.birthdate) refs.birthdate.value = "";
      if (refs.gender) refs.gender.value = "";
      if (refs.vacc) refs.vacc.value = "";
      if (refs.bookletRef) refs.bookletRef.value = "";
      if (refs.vetName) refs.vetName.value = "";
      if (refs.vetPhone) refs.vetPhone.value = "";
      if (refs.emergency) refs.emergency.value = "";

      // 5) lijst verversen
      await renderList();
    } catch (err) {
      console.error(err);
      toast(err.message || "Er ging iets mis", "error");
    }
  }

  async function onPhotoChange() {
    const file = refs.photoInput?.files?.[0];
    if (!file) {
      if (refs.photoPrev)  { refs.photoPrev.src = ""; refs.photoPrev.style.display = "none"; }
      if (refs.photoInfo)  refs.photoInfo.textContent = "Geen bestand gekozen";
      return;
    }
    // Preview tonen
    const dataUrl = await readAsDataURL(file);
    if (refs.photoPrev)  { refs.photoPrev.src = dataUrl; refs.photoPrev.style.display = "block"; }
    if (refs.photoInfo)  refs.photoInfo.textContent = `${file.name} (${Math.round(file.size/1024)} KB)`;
  }

  async function onFilterChange() {
    currentFilterCustomerId = refs.filterCustomerId?.value?.trim() || "";
    await renderList();
  }

  // ------- Init -------
  async function initDogsTab({ defaultCustomerId = "" } = {}) {
    currentFilterCustomerId = defaultCustomerId;

    // events
    refs.createBtn?.addEventListener("click", (e) => { e.preventDefault(); onCreateDog(); });
    refs.reloadBtn?.addEventListener("click", (e) => { e.preventDefault(); renderList(); });
    refs.photoInput?.addEventListener("change", onPhotoChange);
    refs.filterCustomerId?.addEventListener("change", onFilterChange);

    // lijst laden
    await renderList();
  }

  return { initDogsTab };
})();

// Roep dit aan wanneer je Honden-tab opent of bij app start:
DogsUI.initDogsTab({ defaultCustomerId: "" }); // of bv. geselecteerde klant-id
