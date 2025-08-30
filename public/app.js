/* ===========================
   Superhond - public/app.js
   =========================== */

/* ---- helpers ---- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ===== Instellingen (organisatie, branding, locaties, meta) =====
async function ViewSettings() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <h2>Instellingen</h2>

    <div class="card">
      <h3>Organisatie</h3>
      <form id="orgForm" class="row">
        <label>Naam<input name="name" /></label>
        <label>E-mail<input name="email" type="email" /></label>
        <label>Telefoon<input name="phone" /></label>
        <label>Website<input name="website" /></label>
        <button type="submit">Opslaan</button>
      </form>
      <div id="orgMsg" class="muted"></div>
    </div>

    <div class="card">
      <h3>Branding</h3>
      <form id="brandingForm" class="row">
        <label>Logo URL<input name="logoUrl" placeholder="/logo.png of https://..." /></label>
        <label>Primaire kleur<input name="primaryColor" type="text" placeholder="#0a7a3a" /></label>
        <label>Accentkleur<input name="accentColor" type="text" placeholder="#e6f5ec" /></label>
        <button type="submit">Opslaan</button>
      </form>
      <div id="brandingMsg" class="muted"></div>
    </div>

    <div class="card">
      <h3>Locaties</h3>
      <form id="locForm" class="row">
        <label>Naam<input name="name" required /></label>
        <label>Adres<input name="address" /></label>
        <label>Notitie<input name="notes" /></label>
        <button type="submit">Toevoegen</button>
      </form>
      <div id="locMsg" class="muted"></div>
      <div id="locList" style="margin-top:8px;">Laden…</div>
    </div>

    <div class="card">
      <h3>Lestypes & Thema’s</h3>
      <div class="row" style="gap:24px;">
        <div style="flex:1; min-width:260px;">
          <h4>Lestypes</h4>
          <textarea id="lessonTypes" rows="6" style="width:100%;"></textarea>
          <div class="muted">Één item per regel.</div>
          <button id="saveLessonTypes" style="margin-top:8px;">Opslaan</button>
          <div id="ltMsg" class="muted" style="margin-top:6px;"></div>
        </div>
        <div style="flex:1; min-width:260px;">
          <h4>Thema’s</h4>
          <textarea id="themes" rows="6" style="width:100%;"></textarea>
          <div class="muted">Één item per regel.</div>
          <button id="saveThemes" style="margin-top:8px;">Opslaan</button>
          <div id="thMsg" class="muted" style="margin-top:6px;"></div>
        </div>
      </div>
    </div>
  `;

  const orgForm = wrap.querySelector("#orgForm");
  const orgMsg  = wrap.querySelector("#orgMsg");
  const brandingForm = wrap.querySelector("#brandingForm");
  const brandingMsg  = wrap.querySelector("#brandingMsg");
  const locForm = wrap.querySelector("#locForm");
  const locMsg  = wrap.querySelector("#locMsg");
  const locList = wrap.querySelector("#locList");

  const taLessonTypes = wrap.querySelector("#lessonTypes");
  const taThemes      = wrap.querySelector("#themes");
  const ltMsg = wrap.querySelector("#ltMsg");
  const thMsg = wrap.querySelector("#thMsg");

  // helpers
  const get = (u) => fetch(u).then(r => r.json());
  const put = (u, b) => fetch(u, { method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(b) }).then(r => r.json());
  const post = (u, b) => fetch(u, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(b) }).then(r => r.json());
  const del = (u) => fetch(u, { method:"DELETE" });

  async function loadAll() {
    try {
      const data = await get("/api/settings");
      // organisatie
      orgForm.name.value = data.org?.name || "";
      orgForm.email.value = data.org?.email || "";
      orgForm.phone.value = data.org?.phone || "";
      orgForm.website.value = data.org?.website || "";
      // branding
      brandingForm.logoUrl.value = data.branding?.logoUrl || "";
      brandingForm.primaryColor.value = data.branding?.primaryColor || "";
      brandingForm.accentColor.value = data.branding?.accentColor || "";
    } catch (e) {
      orgMsg.textContent = "Kon instellingen niet laden.";
      brandingMsg.textContent = "Kon instellingen niet laden.";
      console.error(e);
    }
    await loadLocations();
    await loadMeta();
  }

  async function loadLocations() {
    try {
      const arr = await get("/api/settings/locations");
      if (!arr.length) {
        locList.innerHTML = `<p class="muted">Nog geen locaties.</p>`;
        return;
      }
      locList.innerHTML = arr.map(l => `
        <div class="row" style="align-items:center; justify-content:space-between; border-bottom:1px dashed #eee; padding:8px 0;">
          <div>
            <strong>#${l.id}</strong> ${l.name} ${l.address ? `— ${l.address}` : ""} 
            ${l.notes ? `<div class="muted">${l.notes}</div>` : ""}
          </div>
          <div class="row" style="gap:8px;">
            <button data-edit="${l.id}">Bewerk</button>
            <button data-del="${l.id}">Verwijder</button>
          </div>
        </div>
      `).join("");
    } catch (e) {
      locList.textContent = "Kon locaties niet laden.";
      console.error(e);
    }
  }

  async function loadMeta() {
    try {
      const lessonTypes = await get("/api/settings/lesson-types");
      const themes = await get("/api/settings/themes");
      taLessonTypes.value = (lessonTypes || []).join("\n");
      taThemes.value = (themes || []).join("\n");
    } catch (e) {
      ltMsg.textContent = "Kon lestypes niet laden.";
      thMsg.textContent = "Kon thema’s niet laden.";
      console.error(e);
    }
  }

  // events
  orgForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    orgMsg.textContent = "";
    try {
      const body = {
        name: orgForm.name.value.trim(),
        email: orgForm.email.value.trim(),
        phone: orgForm.phone.value.trim(),
        website: orgForm.website.value.trim()
      };
      const saved = await put("/api/settings/org", body);
      orgMsg.style.color = "#2a7";
      orgMsg.textContent = "Organisatie opgeslagen.";
    } catch (err) {
      orgMsg.style.color = "#c00";
      orgMsg.textContent = "Fout bij opslaan.";
    }
  });

  brandingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    brandingMsg.textContent = "";
    try {
      const body = {
        logoUrl: brandingForm.logoUrl.value.trim(),
        primaryColor: brandingForm.primaryColor.value.trim(),
        accentColor: brandingForm.accentColor.value.trim()
      };
      await put("/api/settings/branding", body);
      brandingMsg.style.color = "#2a7";
      brandingMsg.textContent = "Branding opgeslagen.";
      // optioneel: kleuren live toepassen
      if (body.primaryColor) document.documentElement.style.setProperty("--primary", body.primaryColor);
      if (body.accentColor) document.documentElement.style.setProperty("--accent", body.accentColor);
    } catch (err) {
      brandingMsg.style.color = "#c00";
      brandingMsg.textContent = "Fout bij opslaan.";
    }
  });

  locForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    locMsg.textContent = "";
    const f = e.currentTarget;
    try {
      await post("/api/settings/locations", {
        name: f.name.value.trim(),
        address: f.address.value.trim(),
        notes: f.notes.value.trim()
      });
      f.reset();
      locMsg.style.color = "#2a7";
      locMsg.textContent = "Locatie toegevoegd.";
      await loadLocations();
    } catch (err) {
      locMsg.style.color = "#c00";
      locMsg.textContent = "Fout bij toevoegen.";
    }
  });

  locList.addEventListener("click", async (e) => {
    const btnEdit = e.target.closest("button[data-edit]");
    const btnDel  = e.target.closest("button[data-del]");
    if (btnEdit) {
      const id = Number(btnEdit.getAttribute("data-edit"));
      const row = btnEdit.closest(".row").parentElement; // container
      // simpele inline-edit
      const name = prompt("Nieuwe naam:");
      const address = prompt("Nieuw adres (leeg laten om te behouden):");
      const notes = prompt("Nieuwe notitie (leeg laten om te behouden):");
      const body = {};
      if (name !== null && name !== "") body.name = name;
      if (address !== null) body.address = address;
      if (notes !== null) body.notes = notes;
      try {
        await put(`/api/settings/locations/${id}`, body);
        await loadLocations();
      } catch {
        alert("Kon locatie niet bijwerken.");
      }
    }
    if (btnDel) {
      const id = Number(btnDel.getAttribute("data-del"));
      if (!confirm(`Locatie #${id} verwijderen?`)) return;
      try {
        await del(`/api/settings/locations/${id}`);
        await loadLocations();
      } catch {
        alert("Kon locatie niet verwijderen.");
      }
    }
  });

  wrap.querySelector("#saveLessonTypes").addEventListener("click", async () => {
    ltMsg.textContent = "";
    const arr = taLessonTypes.value.split("\n").map(s => s.trim()).filter(Boolean);
    try {
      await put("/api/settings/lesson-types", { lessonTypes: arr });
      ltMsg.style.color = "#2a7";
      ltMsg.textContent = "Lestypes opgeslagen.";
    } catch {
      ltMsg.style.color = "#c00";
      ltMsg.textContent = "Fout bij opslaan.";
    }
  });

  wrap.querySelector("#saveThemes").addEventListener("click", async () => {
    thMsg.textContent = "";
    const arr = taThemes.value.split("\n").map(s => s.trim()).filter(Boolean);
    try {
      await put("/api/settings/themes", { themes: arr });
      thMsg.style.color = "#2a7";
      thMsg.textContent = "Thema’s opgeslagen.";
    } catch {
      thMsg.style.color = "#c00";
      thMsg.textContent = "Fout bij opslaan.";
    }
  });

  await loadAll();
  return wrap;
}

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function postJSON(url, data) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data ?? {})
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso ?? "";
  return d.toLocaleString("nl-BE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

/* =========================================
   VIEWS
   ========================================= */

// Dashboard
function ViewDashboard() {
  const el = document.createElement("div");
  el.innerHTML = `
    <h2>Dashboard</h2>
    <div class="card">
      <p>Welkom! Gebruik het menu om onderdelen te beheren.</p>
      <ul class="muted">
        <li><strong>Klanten:</strong> aanmaken en overzicht</li>
        <li><strong>Honden:</strong> hond koppelen aan klant</li>
        <li><strong>Pakketten:</strong> strippenkaarten/credits</li>
        <li><strong>Lessen:</strong> losse & terugkerende sessies</li>
        <li><strong>Boekingen:</strong> reserveren / aanwezigheid / annuleren</li>
      </ul>
    </div>
  `;
  return el;
}

// Klanten
async function ViewCustomers() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <h2>Klanten</h2>
    <div class="card">
      <form id="newCustomerForm">
        <label>Naam<input name="name" required/></label>
        <label>E-mail<input name="email" type="email"/></label>
        <label>Telefoon<input name="phone"/></label>
        <button type="submit">Klant toevoegen</button>
      </form>
      <div id="cMsg" class="muted"></div>
    </div>
    <div class="card">
      <h3>Overzicht</h3>
      <div id="customersList">Laden…</div>
    </div>
  `;

  const list = $("#customersList", wrap);
  const msg = $("#cMsg", wrap);

  async function loadCustomers() {
    try {
      const customers = await getJSON("/api/customers");
      if (!customers.length) {
        list.innerHTML = `<p class="muted">Nog geen klanten.</p>`;
        return;
      }
      list.innerHTML = customers.map(c => `
        <div class="row" style="align-items:center; justify-content:space-between; border-bottom:1px dashed #eee; padding:8px 0;">
          <div>
            <strong>#${c.id}</strong> ${c.name || "-"}<br/>
            <span class="muted">${c.email || ""} ${c.phone ? " · "+c.phone : ""}</span>
          </div>
          <div>
            <a href="#/customer/${c.id}">Open klantkaart</a>
          </div>
        </div>
      `).join("");
    } catch (e) {
      list.textContent = "Kon klanten niet laden.";
      console.error(e);
    }
  }

  $("#newCustomerForm", wrap).addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    msg.textContent = "";
    const body = {
      name: f.name.value.trim(),
      email: f.email.value.trim(),
      phone: f.phone.value.trim()
    };
    if (!body.name) { msg.textContent = "Naam is verplicht"; return; }
    try {
      await postJSON("/api/customers", body);
      f.reset();
      msg.style.color = "#2a7";
      msg.textContent = "Klant toegevoegd.";
      await loadCustomers();
    } catch (err) {
      msg.style.color = "#c00";
      msg.textContent = "Fout: " + err.message;
    }
  });

  await loadCustomers();
  return wrap;
}

// Honden
async function ViewDogs() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <h2>Honden</h2>
    <div class="card">
      <form id="newDogForm">
        <label>Klant
          <select name="customerId" id="customerSelect" required></select>
        </label>
        <label>Naam hond<input name="name" required/></label>
        <label>Ras<input name="breed"/></label>
        <button type="submit">Hond toevoegen</button>
      </form>
      <div id="dMsg" class="muted"></div>
    </div>
    <div class="card">
      <h3>Honden van geselecteerde klant</h3>
      <div id="dogsList" class="muted">Kies eerst een klant.</div>
    </div>
  `;

  const sel = $("#customerSelect", wrap);
  const dogsList = $("#dogsList", wrap);
  const msg = $("#dMsg", wrap);

  async function loadCustomersIntoSelect() {
    const customers = await getJSON("/api/customers");
    sel.innerHTML = customers.map(c => `<option value="${c.id}">#${c.id} — ${c.name || "-"}</option>`).join("");
  }
  async function loadDogsForSelected() {
    const cid = sel.value;
    if (!cid) { dogsList.textContent = "Geen klant geselecteerd."; return; }
    dogsList.textContent = "Laden…";
    try {
      const dogs = await getJSON(`/api/dogs?customerId=${encodeURIComponent(cid)}`);
      if (!dogs.length) { dogsList.textContent = "Geen honden voor deze klant."; return; }
      dogsList.innerHTML = dogs.map(d => `
        <div class="row" style="align-items:center; justify-content:space-between; border-bottom:1px dashed #eee; padding:8px 0;">
          <div><strong>#${d.id}</strong> ${d.name} ${d.breed ? "("+d.breed+")" : ""}</div>
          <div class="muted">eigenaar: #${d.ownerId}</div>
        </div>
      `).join("");
    } catch (e) {
      dogsList.textContent = "Kon honden niet laden.";
      console.error(e);
    }
  }
  $("#newDogForm", wrap).addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    const f = e.currentTarget;
    const body = { name: f.name.value.trim(), breed: f.breed.value.trim() };
    const customerId = f.customerId.value;
    if (!body.name) { msg.textContent = "Naam hond is verplicht"; msg.style.color="#c00"; return; }
    try {
      await postJSON(`/api/dogs/${encodeURIComponent(customerId)}`, body);
      f.name.value = ""; f.breed.value = "";
      msg.style.color = "#2a7";
      msg.textContent = "Hond toegevoegd.";
      await loadDogsForSelected();
    } catch (err) {
      msg.style.color = "#c00";
      msg.textContent = "Fout: " + err.message;
    }
  });

  await loadCustomersIntoSelect();
  sel.addEventListener("change", loadDogsForSelected);
  await loadDogsForSelected();
  return wrap;
}

// Pakketten (credits)
async function ViewPacks() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <h2>Pakketten (credits)</h2>
    <div class="card">
      <form id="newPackForm">
        <label>Klant ID<input name="customerId" type="number" required/></label>
        <label>Aantal lessen<input name="size" type="number" required/></label>
        <label>Geldig tot<input name="expiresAt" type="date"/></label>
        <button type="submit">Pakket toevoegen</button>
      </form>
      <div id="pMsg" class="muted"></div>
    </div>
    <div class="card">
      <h3>Overzicht</h3>
      <div id="packsList">Laden…</div>
    </div>
  `;

  const list = $("#packsList", wrap);
  const msg = $("#pMsg", wrap);

  async function loadPacks() {
    try {
      const packs = await getJSON("/api/packs");
      if (!packs.length) { list.innerHTML = `<p class="muted">Nog geen pakketten.</p>`; return; }
      list.innerHTML = packs.map(p => `
        <div style="border-bottom:1px dashed #eee; padding:8px 0;">
          <strong>#${p.id}</strong> klant #${p.customerId} – ${p.size} credits
          <br><span class="muted">gebruikt: ${p.used}, gereserveerd: ${p.reserved}, resterend: ${p.size - (p.used + p.reserved)}</span>
          ${p.expiresAt ? `<br><span class="muted">geldig tot: ${p.expiresAt}</span>` : ""}
        </div>
      `).join("");
    } catch (e) {
      list.textContent = "Kon pakketten niet laden.";
      console.error(e);
    }
  }

  $("#newPackForm", wrap).addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    const f = e.target;
    try {
      await postJSON("/api/packs", {
        customerId: Number(f.customerId.value),
        size: Number(f.size.value),
        expiresAt: f.expiresAt.value || null
      });
      msg.textContent = "✅ Pakket toegevoegd.";
      f.reset();
      await loadPacks();
    } catch (err) {
      msg.textContent = "❌ Fout: " + err.message;
    }
  });

  await loadPacks();
  return wrap;
}

// Boekingen
async function ViewBookings() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <h2>Boekingen</h2>
    <div class="card">
      <form id="newBookingForm">
        <label>Sessie ID<input name="sessionId" type="number" required/></label>
        <label>Klant ID<input name="customerId" type="number" required/></label>
        <label>Hond ID<input name="dogId" type="number" required/></label>
        <button type="submit">Boek les</button>
      </form>
      <div id="bMsg" class="muted"></div>
    </div>
    <div class="card">
      <h3>Overzicht</h3>
      <div id="bookingsList">Laden…</div>
    </div>
  `;

  const list = $("#bookingsList", wrap);
  const msg = $("#bMsg", wrap);

  async function loadBookings() {
    try {
      const bookings = await getJSON("/api/bookings");
      if (!bookings.length) { list.innerHTML = `<p class="muted">Nog geen boekingen.</p>`; return; }
      list.innerHTML = bookings.map(b => `
        <div class="row" style="align-items:center; justify-content:space-between; border-bottom:1px dashed #eee; padding:8px 0;">
          <div>
            <strong>#${b.id}</strong> sessie #${b.sessionId}, klant #${b.customerId}, hond #${b.dogId}
            <span class="muted"> · status: ${b.status}</span>
          </div>
          <div>
            ${b.status === "reserved" ? `
              <button data-act="attend" data-id="${b.id}">Deelname bevestigen</button>
              <button data-act="cancel" data-id="${b.id}">Annuleer</button>
            ` : ""}
          </div>
        </div>
      `).join("");
    } catch (e) {
      list.textContent = "Kon boekingen niet laden.";
      console.error(e);
    }
  }

  $("#bookingsList", wrap).addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const act = btn.getAttribute("data-act");
    try {
      const url = act === "attend" ? `/api/bookings/${id}/attend` : `/api/bookings/${id}/cancel`;
      await postJSON(url, {});
      await loadBookings();
    } catch (err) {
      alert("Fout: " + err.message);
    }
  });

  $("#newBookingForm", wrap).addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target; msg.textContent = "";
    try {
      await postJSON("/api/bookings", {
        sessionId: Number(f.sessionId.value),
        customerId: Number(f.customerId.value),
        dogId: Number(f.dogId.value)
      });
      msg.textContent = "✅ Boeking gemaakt.";
      f.reset();
      await loadBookings();
    } catch (err) {
      msg.textContent = "❌ Fout: " + err.message;
    }
  });

  await loadBookings();
  return wrap;
}

// Lessen (Sessies)
async function ViewSessions() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <h2>Lessen (Sessies)</h2>

    <div class="card">
      <h3>Nieuwe les</h3>
      <form id="newSessionForm">
        <label>Klas-ID (classId)<input name="classId" type="number" required /></label>
        <label>Datum & tijd<input name="date" type="datetime-local" required /></label>
        <label>Locatie<input name="location" required /></label>
        <label>Capaciteit (optioneel)<input name="capacity" type="number" min="1" /></label>
        <button type="submit">Opslaan</button>
      </form>
      <div id="sMsg" class="muted"></div>
    </div>

    <div class="card">
      <h3>Terugkerende lessen</h3>
      <form id="recurringForm">
        <label>Klas-ID<input name="classId" type="number" required /></label>
        <label>Locatie<input name="location" required /></label>
        <label>Capaciteit<input name="capacity" type="number" min="1" /></label>
        <label>Startdatum<input name="startDate" type="date" required /></label>
        <label>Einddatum<input name="endDate" type="date" required /></label>
        <label>Weekdag
          <select name="weekday" required>
            <option value="0">Zondag</option><option value="1">Maandag</option><option value="2">Dinsdag</option>
            <option value="3">Woensdag</option><option value="4">Donderdag</option><option value="5">Vrijdag</option><option value="6">Zaterdag</option>
          </select>
        </label>
        <label>Uur<input name="hour" type="number" min="0" max="23" value="9" /></label>
        <label>Minuut<input name="minute" type="number" min="0" max="59" value="0" /></label>
        <button type="submit">Reeks aanmaken</button>
      </form>
      <div id="rMsg" class="muted"></div>
    </div>

    <div class="card">
      <h3>Overzicht lessen</h3>
      <div id="sessionsList">Laden…</div>
    </div>
  `;

  const sMsg = $("#sMsg", wrap);
  const rMsg = $("#rMsg", wrap);
  const list = $("#sessionsList", wrap);

  async function loadSessions() {
    try {
      const data = await getJSON("/api/sessions");
      if (!data.length) { list.innerHTML = `<p class="muted">Nog geen lessen.</p>`; return; }
      list.innerHTML = data.map(s => `
        <div style="border-bottom:1px dashed #eee; padding:8px 0;">
          <strong>#${s.id}</strong> klas #${s.classId} – ${fmtDate(s.date)} – ${s.location}
          ${s.capacity ? `<span class="muted"> · capaciteit: ${s.capacity}</span>` : ""}
        </div>
      `).join("");
    } catch (e) {
      console.error(e);
      list.textContent = "Kon lessen niet laden.";
    }
  }

  $("#newSessionForm", wrap).addEventListener("submit", async (e) => {
    e.preventDefault();
    sMsg.textContent = "";
    const f = e.currentTarget;
    const body = {
      classId: Number(f.classId.value),
      date: f.date.value,
      location: f.location.value.trim(),
      capacity: f.capacity.value ? Number(f.capacity.value) : null
    };
    if (!body.classId || !body.date || !body.location) {
      sMsg.style.color="#c00"; sMsg.textContent="Vul alle verplichte velden in."; return;
    }
    try {
      await postJSON("/api/sessions", body);
      sMsg.style.color="#2a7"; sMsg.textContent="Les aangemaakt.";
      f.reset();
      await loadSessions();
    } catch (err) {
      sMsg.style.color="#c00"; sMsg.textContent = "Fout: " + err.message;
    }
  });

  $("#recurringForm", wrap).addEventListener("submit", async (e) => {
    e.preventDefault();
    rMsg.textContent = "";
    const f = e.currentTarget;
    const body = {
      classId: Number(f.classId.value),
      location: f.location.value.trim(),
      capacity: f.capacity.value ? Number(f.capacity.value) : null,
      startDate: f.startDate.value,
      endDate: f.endDate.value,
      weekday: Number(f.weekday.value),
      hour: Number(f.hour.value || 9),
      minute: Number(f.minute.value || 0)
    };
    if (!body.classId || !body.location || !body.startDate || !body.endDate) {
      rMsg.style.color="#c00"; rMsg.textContent="Vul alle verplichte velden in."; return;
    }
    try {
      const res = await postJSON("/api/sessions/recurring", body);
      rMsg.style.color="#2a7"; rMsg.textContent = `Aangemaakt: ${res.count} lessen.`;
      f.reset();
      await loadSessions();
    } catch (err) {
      rMsg.style.color="#c00"; rMsg.textContent = "Fout: " + err.message;
    }
  });

  await loadSessions();
  return wrap;
}

// Klantkaart (detail)
async function ViewCustomerDetail(id) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <h2>Klantkaart</h2>
    <div id="cardCustomer" class="card">Laden…</div>
    <div class="card">
      <h3>Honden</h3>
      <div id="cardDogs" class="muted">Laden…</div>
    </div>
    <div class="card">
      <h3>Pakketten / Credits</h3>
      <div id="cardPacks" class="muted">Laden…</div>
    </div>
    <div class="card">
      <h3>Boekingen</h3>
      <div id="cardBookings" class="muted">Laden…</div>
    </div>
  `;

  const $c = sel => wrap.querySelector(sel);

  // klant + basis
  try {
    const customer = await getJSON(`/api/customers/${id}?withDogs=1`);
    $c("#cardCustomer").innerHTML = `
      <div class="row" style="justify-content:space-between;">
        <div>
          <strong>#${customer.id}</strong> ${customer.name || "-"}<br/>
          <span class="muted">${customer.email || ""} ${customer.phone ? " · "+customer.phone : ""}</span>
        </div>
        <div><a href="#/customers">← Terug naar klanten</a></div>
      </div>
    `;
  } catch {
    $c("#cardCustomer").innerHTML = `<span style="color:#c00">Klant niet gevonden.</span>`;
  }

  // honden
  try {
    const dogs = await getJSON(`/api/dogs?customerId=${encodeURIComponent(id)}`);
    if (!dogs.length) $c("#cardDogs").textContent = "Geen honden.";
    else $c("#cardDogs").innerHTML = dogs.map(d =>
      `<div style="border-bottom:1px dashed #eee; padding:8px 0;">
         <strong>#${d.id}</strong> ${d.name} ${d.breed ? "("+d.breed+")" : ""}
       </div>`
    ).join("");
  } catch {
    $c("#cardDogs").innerHTML = `<span style="color:#c00">Kon honden niet laden.</span>`;
  }

  // pakketten
  try {
    const packs = await getJSON(`/api/packs?customerId=${encodeURIComponent(id)}`);
    if (!packs.length) $c("#cardPacks").textContent = "Geen pakketten.";
    else $c("#cardPacks").innerHTML = packs.map(p => {
      const remaining = p.size - (p.used + p.reserved);
      return `<div style="border-bottom:1px dashed #eee; padding:8px 0;">
        <strong>#${p.id}</strong> ${p.size} credits
        <span class="muted"> · gebruikt: ${p.used}, gereserveerd: ${p.reserved}, resterend: ${remaining}</span>
        ${p.expiresAt ? `<br/><span class="muted">geldig tot: ${p.expiresAt}</span>` : ""}
      </div>`;
    }).join("");
  } catch {
    $c("#cardPacks").innerHTML = `<span style="color:#c00">Kon pakketten niet laden.</span>`;
  }

  // boekingen
  try {
    const bookings = await getJSON(`/api/bookings?customerId=${encodeURIComponent(id)}`);
    if (!bookings.length) $c("#cardBookings").textContent = "Geen boekingen.";
    else {
      $c("#cardBookings").innerHTML = bookings.map(b => `
        <div class="row" style="align-items:center; justify-content:space-between; border-bottom:1px dashed #eee; padding:8px 0;">
          <div>
            <strong>#${b.id}</strong> sessie #${b.sessionId}, hond #${b.dogId}
            <span class="muted"> · status: ${b.status}</span>
          </div>
          <div>
            ${b.status === "reserved" ? `
              <button data-act="attend" data-id="${b.id}">Deelname bevestigen</button>
              <button data-act="cancel" data-id="${b.id}">Annuleer</button>
            ` : ""}
          </div>
        </div>
      `).join("");

      $c("#cardBookings").addEventListener("click", async (e) => {
        const btn = e.target.closest("button[data-act]");
        if (!btn) return;
        const bid = btn.getAttribute("data-id");
        const act = btn.getAttribute("data-act");
        try {
          const url = act === "attend" ? `/api/bookings/${bid}/attend` : `/api/bookings/${bid}/cancel`;
          await postJSON(url, {});
          // herladen van enkel bookings-blok
          const refreshed = await getJSON(`/api/bookings?customerId=${encodeURIComponent(id)}`);
          $c("#cardBookings").innerHTML = refreshed.map(b => `
            <div class="row" style="align-items:center; justify-content:space-between; border-bottom:1px dashed #eee; padding:8px 0;">
              <div>
                <strong>#${b.id}</strong> sessie #${b.sessionId}, hond #${b.dogId}
                <span class="muted"> · status: ${b.status}</span>
              </div>
              <div>
                ${b.status === "reserved" ? `
                  <button data-act="attend" data-id="${b.id}">Deelname bevestigen</button>
                  <button data-act="cancel" data-id="${b.id}">Annuleer</button>
                ` : ""}
              </div>
            </div>
          `).join("");
        } catch (err) {
          alert("Fout: " + err.message);
        }
      });
    }
  } catch {
    $c("#cardBookings").innerHTML = `<span style="color:#c00">Kon boekingen niet laden.</span>`;
  }

  return wrap;
}

/* =========================================
   ROUTER
   ========================================= */

const routes = {
  "#/dashboard": ViewDashboard,
  "#/customers": ViewCustomers,
  "#/dogs": ViewDogs,
  "#/packs": ViewPacks,
  "#/bookings": ViewBookings,
  "#/sessions": ViewSessions
};

async function renderRoute() {
  const mount = $("#view") || document.body;
  const hash = location.hash || "#/dashboard";
  mount.innerHTML = "";

  if (hash.startsWith("#/customer/")) {
    const id = Number(hash.replace("#/customer/", ""));
    const el = await ViewCustomerDetail(id);
    mount.appendChild(el);
    // active tab highlight → klanten
    $$("nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#/customers"));
    return;
  }

  const View = routes[hash] || ViewDashboard;
  const el = await View();
  mount.appendChild(el);

  // active tab highlight
  $$("nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === hash));
}

window.addEventListener("hashchange", renderRoute);
window.addEventListener("DOMContentLoaded", renderRoute);
