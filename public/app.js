// --- eenvoudige helper voor fetch ---
async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} – ${txt}`);
  }
  return res.json().catch(() => ({}));
}

// --- tabs config ---
const TABS = [
  { id: "klanten", label: "Klanten" },
  { id: "honden", label: "Honden" },
  { id: "lessen", label: "Lessen" },
  { id: "instellingen", label: "Instellingen" },
  { id: "overzicht", label: "Overzicht" },
];

const tabsEl = document.getElementById("tabs");
const viewEl = document.getElementById("view");

// UI: tabbuttons renderen
function renderTabs(activeId) {
  tabsEl.innerHTML = "";
  TABS.forEach(tab => {
    const b = document.createElement("button");
    b.className = "tab-btn" + (tab.id === activeId ? " active" : "");
    b.textContent = tab.label;
    b.onclick = () => go(tab.id);
    tabsEl.appendChild(b);
  });
}

// Router
function go(tabId) {
  renderTabs(tabId);
  switch (tabId) {
    case "klanten": return renderKlanten();
    case "honden": return renderHonden();
    case "lessen": return renderLessen();
    case "instellingen": return renderInstellingen();
    case "overzicht": return renderOverzicht();
    default: return renderWelcome();
  }
}

// --- Views ---
function renderWelcome() {
  viewEl.innerHTML = `
    <div class="card">
      <h2>Welkom</h2>
      <p class="muted">Kies een tabblad hierboven.</p>
    </div>`;
}

async function renderKlanten() {
  viewEl.innerHTML = `
    <div class="card">
      <h2>Klanten</h2>
      <div class="row">
        <div>
          <label>Naam</label>
          <input id="c_name" placeholder="Voornaam Achternaam" />
        </div>
        <div>
          <label>E-mail</label>
          <input id="c_email" placeholder="naam@example.com" />
        </div>
        <div>
          <label>Telefoon</label>
          <input id="c_phone" placeholder="bv. 0470 00 00 00" />
        </div>
      </div>
      <div class="actions">
        <button class="primary" id="btnAddC">Klant registreren</button>
        <span id="c_msg" class="muted"></span>
      </div>
    </div>
    <div class="card">
      <h3>Bestaande klanten</h3>
      <div id="c_list" class="list"><div class="empty">Laden…</div></div>
    </div>
  `;

  document.getElementById("btnAddC").onclick = async () => {
    const body = {
      name: document.getElementById("c_name").value.trim(),
      email: document.getElementById("c_email").value.trim(),
      phone: document.getElementById("c_phone").value.trim(),
    };
    const msg = document.getElementById("c_msg");
    try {
      await api("/api/customers", { method: "POST", body: JSON.stringify(body) });
      msg.textContent = "Klant toegevoegd.";
      await loadCustomers();
    } catch (e) {
      msg.textContent = "Fout: " + e.message;
    }
  };

  await loadCustomers();

  async function loadCustomers() {
    const list = document.getElementById("c_list");
    try {
      const data = await api("/api/customers");
      if (!data || !data.length) {
        list.innerHTML = `<div class="empty">Geen klanten gevonden.</div>`;
        return;
      }
      list.innerHTML = data.map(c =>
        `<div class="list-item">
           <strong>${escapeHtml(c.name || "-")}</strong>
           <span class="badge">${escapeHtml(c.email || "")}</span>
           <div class="muted">Tel: ${escapeHtml(c.phone || "-")}</div>
         </div>`
      ).join("");
    } catch (e) {
      list.innerHTML = `<div class="empty">Kon klanten niet laden: ${escapeHtml(e.message)}</div>`;
    }
  }
}

async function renderHonden() {
  viewEl.innerHTML = `
    <div class="card">
      <h2>Honden</h2>
      <div class="row">
        <div>
          <label>Naam hond</label>
          <input id="d_name" placeholder="bv. Rex" />
        </div>
        <div>
          <label>Ras</label>
          <input id="d_breed" placeholder="bv. Border Collie" />
        </div>
        <div>
          <label>Geboortedatum</label>
          <input id="d_dob" type="date" />
        </div>
        <div>
          <label>Geslacht</label>
          <select id="d_gender">
            <option value="">-</option>
            <option>Reu</option>
            <option>Teef</option>
          </select>
        </div>
        <div>
          <label>Klant (e-mail)</label>
          <input id="d_owner" placeholder="email van eigenaar" />
        </div>
      </div>
      <div class="actions">
        <button class="primary" id="btnAddD">Hond registreren</button>
        <span id="d_msg" class="muted"></span>
      </div>
    </div>
    <div class="card">
      <h3>Bestaande honden</h3>
      <div id="d_list" class="list"><div class="empty">Laden…</div></div>
    </div>
  `;

  document.getElementById("btnAddD").onclick = async () => {
    const body = {
      name: document.getElementById("d_name").value.trim(),
      breed: document.getElementById("d_breed").value.trim(),
      dob: document.getElementById("d_dob").value || null,
      gender: document.getElementById("d_gender").value || null,
      ownerEmail: document.getElementById("d_owner").value.trim() || null,
    };
    const msg = document.getElementById("d_msg");
    try {
      await api("/api/dogs", { method: "POST", body: JSON.stringify(body) });
      msg.textContent = "Hond toegevoegd.";
      await loadDogs();
    } catch (e) {
      msg.textContent = "Fout: " + e.message;
    }
  };

  await loadDogs();

  async function loadDogs() {
    const list = document.getElementById("d_list");
    try {
      const data = await api("/api/dogs");
      if (!data || !data.length) {
        list.innerHTML = `<div class="empty">Geen honden gevonden.</div>`;
        return;
      }
      list.innerHTML = data.map(d =>
        `<div class="list-item">
           <strong>${escapeHtml(d.name || "-")}</strong>
           <span class="badge">${escapeHtml(d.breed || "")}</span>
           <div class="muted">
             Geboorte: ${escapeHtml(d.dob || "-")} • Geslacht: ${escapeHtml(d.gender || "-")}
             ${d.ownerEmail ? `• Eigenaar: ${escapeHtml(d.ownerEmail)}` : ""}
           </div>
         </div>`
      ).join("");
    } catch (e) {
      list.innerHTML = `<div class="empty">Kon honden niet laden: ${escapeHtml(e.message)}</div>`;
    }
  }
}

async function renderLessen() {
  viewEl.innerHTML = `
    <div class="card">
      <h2>Lessen</h2>
      <div class="row">
        <div>
          <label>Lesnaam</label>
          <input id="l_name" placeholder="bv. Puppy Pack" />
        </div>
        <div>
          <label>Strippen (aantal)</label>
          <input id="l_credits" type="number" min="1" value="9" />
        </div>
      </div>
      <div class="actions">
        <button class="primary" id="btnAddL">Lestype toevoegen</button>
        <span id="l_msg" class="muted"></span>
      </div>
    </div>
    <div class="card">
      <h3>Beschikbare lestypes</h3>
      <div id="l_list" class="list"><div class="empty">Laden…</div></div>
    </div>
  `;

  document.getElementById("btnAddL").onclick = async () => {
    const body = {
      name: document.getElementById("l_name").value.trim(),
      credits: Number(document.getElementById("l_credits").value || 0),
    };
    const msg = document.getElementById("l_msg");
    try {
      await api("/api/lessontypes", { method: "POST", body: JSON.stringify(body) });
      msg.textContent = "Lestype toegevoegd.";
      await loadLessonTypes();
    } catch (e) {
      msg.textContent = "Fout: " + e.message;
    }
  };

  await loadLessonTypes();

  async function loadLessonTypes() {
    const list = document.getElementById("l_list");
    try {
      const data = await api("/api/lessontypes");
      if (!data || !data.length) {
        list.innerHTML = `<div class="empty">Nog geen lestypes.</div>`;
        return;
      }
      list.innerHTML = data.map(t =>
        `<div class="list-item">
           <strong>${escapeHtml(t.name || "-")}</strong>
           <span class="badge">${Number(t.credits) || 0} strippen</span>
         </div>`
      ).join("");
    } catch (e) {
      list.innerHTML = `<div class="empty">Kon lestypes niet laden: ${escapeHtml(e.message)}</div>`;
    }
  }
}

async function renderInstellingen() {
  viewEl.innerHTML = `
    <div class="card">
      <h2>Instellingen</h2>
      <div id="s_wrap" class="muted">Laden…</div>
    </div>
  `;
  const wrap = document.getElementById("s_wrap");
  try {
    const s = await api("/api/settings");
    wrap.innerHTML = `
      <div class="row">
        <div>
          <label>Organisatie</label>
          <input id="s_org" value="${escapeAttr(s?.org?.name || "Superhond")}" />
        </div>
        <div>
          <label>E-mail</label>
          <input id="s_email" value="${escapeAttr(s?.org?.email || "info@superhond.be")}" />
        </div>
      </div>
      <div class="actions">
        <button class="primary" id="btnSaveS">Opslaan</button>
        <span id="s_msg" class="muted"></span>
      </div>
    `;
    document.getElementById("btnSaveS").onclick = async () => {
      const body = {
        org: {
          name: document.getElementById("s_org").value.trim(),
          email: document.getElementById("s_email").value.trim(),
        }
      };
      const msg = document.getElementById("s_msg");
      try {
        await api("/api/settings", { method: "PUT", body: JSON.stringify(body) });
        msg.textContent = "Instellingen opgeslagen.";
      } catch (e) {
        msg.textContent = "Fout: " + e.message;
      }
    };
  } catch (e) {
    wrap.textContent = "Kon instellingen niet laden: " + e.message;
  }
}

async function renderOverzicht() {
  viewEl.innerHTML = `
    <div class="card">
      <h2>Overzicht</h2>
      <div class="muted">Snelle samenvatting van klanten, honden en lestypes.</div>
      <div id="ov"></div>
    </div>
  `;
  const el = document.getElementById("ov");
  try {
    const [customers, dogs, types] = await Promise.all([
      api("/api/customers").catch(() => []),
      api("/api/dogs").catch(() => []),
      api("/api/lessontypes").catch(() => []),
    ]);
    el.innerHTML = `
      <p>Klanten: <strong>${customers.length}</strong></p>
      <p>Honden: <strong>${dogs.length}</strong></p>
      <p>Lestypes: <strong>${types.length}</strong></p>
    `;
  } catch (e) {
    el.textContent = "Kon overzicht niet laden: " + e.message;
  }
}

// utilities
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]))}
function escapeAttr(s=""){return escapeHtml(s).replace(/"/g,"&quot;")}

// start
renderTabs("klanten");
go("klanten");
