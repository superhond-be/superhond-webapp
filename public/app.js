const api = {
  list: async () => (await fetch("/api/passes")).json(),
  add: async (type, strips) => (await fetch("/api/passes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, strips: Number(strips) })
  })).json(),
  useOne: async (id) => (await fetch(`/api/passes/${id}/use`, { method: "POST" })).json()
};

const $ = (sel) => document.querySelector(sel);
const tableBody = $("#passesBody");
const statusLine = $("#statusLine");

function setStatus(msg) {
  statusLine.textContent = msg;
}

async function refresh() {
  setStatus("Vernieuwen…");
  try {
    const data = await api.list();
    renderRows(data);
    setStatus(`Laatst geladen: ${new Date().toLocaleString()}`);
  } catch (e) {
    console.error(e);
    setStatus("Fout bij laden.");
  }
}

function renderRows(passes) {
  tableBody.innerHTML = "";
  if (!passes || passes.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="muted">Geen kaarten</td></tr>`;
    return;
  }

  for (const p of passes) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.type}</td>
      <td><span class="pill">${p.strips}</span></td>
      <td><button data-id="${p.id}" class="use-btn">Gebruik 1 strip</button></td>
    `;
    tableBody.appendChild(tr);
  }

  // Koppel events
  tableBody.querySelectorAll(".use-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      setStatus(`Strip gebruiken voor kaart #${id}…`);
      const res = await api.useOne(id);
      if (res.error) {
        setStatus(`Fout: ${res.error}`);
      } else {
        setStatus(`OK: ${res.message}`);
        refresh();
      }
    });
  });
}

$("#addBtn").addEventListener("click", async () => {
  const type = $("#typeInput").value.trim();
  const strips = $("#stripsInput").value;
  if (!type || !strips) {
    setStatus("Geef type én aantal strips in.");
    return;
  }
  setStatus("Kaart toevoegen…");
  const res = await api.add(type, strips);
  if (res.error) {
    setStatus(`Fout: ${res.error}`);
  } else {
    $("#typeInput").value = "";
    $("#stripsInput").value = "";
    setStatus(`Toegevoegd: ${res.type} (${res.strips} strips)`);
    refresh();
  }
});


// ==================== Lessen & Strippenkaart Frontend ====================

const API = {
  customers: '/api/customers',
  lessons:   '/api/lessons',
  passes:    '/api/passes',
  usePass:   '/api/passes/use',
};

// Dom refs
const $ = (q) => document.querySelector(q);

// Dropdowns (lessen)
const lsCustomerSel = $('#ls-customer');
const lsDogSel      = $('#ls-dog');
const lsClassSel    = $('#ls-classType');
const lsLoc         = $('#ls-location');
const lsDate        = $('#ls-date');
const lsStart       = $('#ls-start');
const lsEnd         = $('#ls-end');
const lsBookBtn     = $('#ls-book');
const lsBookStatus  = $('#ls-book-status');

// Strippenkaart
const psCustomerSel = $('#ps-customer');
const psClassSel    = $('#ps-classType');
const psCheckBtn    = $('#ps-check');
const psRemaining   = $('#ps-remaining');
const psUseBtn      = $('#ps-use');
const psUseStatus   = $('#ps-use-status');

const lessonsLastUpdated = $('#lessons-last-updated');

let _customers = [];

// Helpers
function setBusy(el, busy) {
  if (!el) return;
  if (busy) {
    el.setAttribute('disabled', 'disabled');
    el.classList.add('is-busy');
  } else {
    el.removeAttribute('disabled');
    el.classList.remove('is-busy');
  }
}

function stamp() {
  const d = new Date();
  const pad = (n) => `${n}`.padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=>'');
    throw new Error(`HTTP ${res.status} ${txt}`);
  }
  return res.json().catch(()=> ({}));
}

// Load customers + fill selects
async function loadCustomersInto(selectA, selectB) {
  setBusy(selectA, true);
  setBusy(selectB, true);
  try {
    if (_customers.length === 0) {
      _customers = await fetchJSON(API.customers);
      // sort by name for convenience
      _customers.sort((a,b)=>a.name.localeCompare(b.name));
    }

    const opts = ['<option value="">— kies klant —</option>']
      .concat(_customers.map(c => `<option value="${c.id}">${escapeHtml(`${c.name} (${c.email||'—'})`)}</option>`));
    selectA.innerHTML = opts.join('');
    selectB.innerHTML = opts.join('');
  } catch (e) {
    console.error(e);
    selectA.innerHTML = '<option value="">(laden mislukt)</option>';
    selectB.innerHTML = '<option value="">(laden mislukt)</option>';
  } finally {
    setBusy(selectA, false);
    setBusy(selectB, false);
  }
}

// Fill dogs when a customer changes (for lesson form)
function refreshDogsForCustomer(customerId) {
  const c = _customers.find(x => String(x.id) === String(customerId));
  const dogs = c?.dogs || [];
  lsDogSel.innerHTML = dogs.length
    ? dogs.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('')
    : '<option value="">(geen honden voor klant)</option>';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// Events wiring
function wireLessonsUI() {
  // initial load
  loadCustomersInto(lsCustomerSel, psCustomerSel).then(()=>{
    // auto-select first for ease (optional)
    if (lsCustomerSel.options.length > 1) {
      lsCustomerSel.selectedIndex = 1;
      refreshDogsForCustomer(lsCustomerSel.value);
    }
    if (psCustomerSel.options.length > 1) psCustomerSel.selectedIndex = 1;
  });

  lsCustomerSel.addEventListener('change', () => {
    refreshDogsForCustomer(lsCustomerSel.value);
  });

  lsBookBtn.addEventListener('click', async () => {
    lsBookStatus.textContent = '';
    const customerId = lsCustomerSel.value;
    const dogId      = lsDogSel.value;
    const classType  = lsClassSel.value;
    const location   = lsLoc.value.trim();
    const date       = lsDate.value;
    const startTime  = lsStart.value;
    const endTime    = lsEnd.value;

    if (!customerId || !dogId || !classType || !date || !startTime || !endTime) {
      lsBookStatus.textContent = 'Gelieve alle verplichte velden in te vullen.';
      return;
    }

    setBusy(lsBookBtn, true);
    try {
      await postJSON(API.lessons, {
        customerId: Number(customerId),
        dogId: Number(dogId),
        classType, location, date, startTime, endTime
      });
      lsBookStatus.textContent = '✅ Les toegevoegd.';
      lessonsLastUpdated.textContent = `Laatste update: ${stamp()}`;
    } catch (e) {
      console.error(e);
      lsBookStatus.textContent = '❌ Fout bij les toevoegen.';
    } finally {
      setBusy(lsBookBtn, false);
    }
  });

  psCheckBtn.addEventListener('click', async () => {
    psRemaining.textContent = '…';
    const customerId = psCustomerSel.value;
    const classType  = psClassSel.value;
    if (!customerId || !classType) {
      psRemaining.textContent = '—';
      return;
    }
    try {
      const data = await fetchJSON(`${API.passes}?customerId=${encodeURIComponent(customerId)}&classType=${encodeURIComponent(classType)}`);
      psRemaining.textContent = `${data.remaining ?? 0} strips`;
      lessonsLastUpdated.textContent = `Laatste update: ${stamp()}`;
    } catch (e) {
      console.error(e);
      psRemaining.textContent = 'fout';
    }
  });

  psUseBtn.addEventListener('click', async () => {
    psUseStatus.textContent = '';
    const customerId = psCustomerSel.value;
    const classType  = psClassSel.value;
    if (!customerId || !classType) {
      psUseStatus.textContent = 'Kies klant en lestype.';
      return;
    }
    setBusy(psUseBtn, true);
    try {
      await postJSON(API.usePass, { customerId: Number(customerId), classType, count: 1 });
      psUseStatus.textContent = '✅ 1 strip gebruikt.';
      // refresh remaining right after
      psCheckBtn.click();
    } catch (e) {
      console.error(e);
      psUseStatus.textContent = '❌ Kon strip niet gebruiken.';
    } finally {
      setBusy(psUseBtn, false);
      lessonsLastUpdated.textContent = `Laatste update: ${stamp()}`;
    }
  });
}
// ==================== Strippenkaart Overzicht ====================

const psRefreshBtn = document.querySelector('#ps-refresh');
const psTableBody  = document.querySelector('#ps-table tbody');

async function loadPassesOverview() {
  psTableBody.innerHTML = `<tr><td colspan="3">Laden…</td></tr>`;
  try {
    // haal klanten op
    const customers = await fetchJSON(API.customers);

    // per klant → per lestype checken
    let rows = [];
    for (let c of customers) {
      // voorbeeld: 3 soorten pakketten (pas aan naar jouw PACKAGE_MAP)
      for (let t of ["PUPPY", "PUBER", "GEHOORZAAM"]) {
        try {
          const data = await fetchJSON(`${API.passes}?customerId=${c.id}&classType=${t}`);
          rows.push(`
            <tr>
              <td>${escapeHtml(c.name)}</td>
              <td>${escapeHtml

                    
// activeer alleen wanneer de tab zichtbaar wordt (of nu meteen als je wil)
document.addEventListener('DOMContentLoaded', () => {
  const tabBtn = document.querySelector('#tab-lessons');
  if (tabBtn) {
    tabBtn.addEventListener('click', () => {
      // als de tab geopend wordt en we hebben nog geen klanten opgehaald
      if (_customers.length === 0) wireLessonsUI();
    });
  }
  // Direct klaarzetten als sectie al zichtbaar is
  const sec = document.querySelector('#section-lessons');
  if (sec && !sec.hasAttribute('hidden') && _customers.length === 0) {
    wireLessonsUI();
  }
});

// =======================================================================


refresh();
