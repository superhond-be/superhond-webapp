const $ = (s) => document.querySelector(s);

async function fetchJSON(url, opts={}) {
  const r = await fetch(url, { headers:{'Content-Type':'application/json'}, ...opts });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function rowHTML(it) {
  return `<tr>
    <td>${it.id}</td>
    <td><span class="badge">${it.type}</span></td>
    <td>${it.theme}</td>
    <td>${it.location}</td>
    <td>${it.date}</td>
    <td>${it.time}</td>
    <td>${it.trainer}</td>
    <td>
      <button class="action-btn edit" data-id="${it.id}">Wijzig</button>
      <button class="action-btn delete" data-id="${it.id}">Verwijder</button>
    </td>
  </tr>`;
}

async function loadList() {
  const params = new URLSearchParams();
  const type = $('#filterType').value;
  const loc = $('#filterLocation').value.trim();
  const df = $('#filterFrom').value;
  const dt = $('#filterTo').value;
  if (type) params.set('type', type);
  if (loc) params.set('location', loc);
  if (df) params.set('dateFrom', df);
  if (dt) params.set('dateTo', dt);
  const data = await fetchJSON(`/lessons?${params.toString()}`);
  $('#tbl tbody').innerHTML = data.items.map(rowHTML).join('');
}

function openDialog(item) {
  const dlg = $('#dlgForm');
  $('#lessonId').value = item?.id || '';
  $('#formTitle').textContent = item ? `Les #${item.id} bewerken` : 'Nieuwe les';
  $('#type').value = item?.type || 'Puppy';
  $('#theme').value = item?.theme || '';
  $('#location').value = item?.location || '';
  $('#date').value = item?.date || '';
  $('#time').value = item?.time || '';
  $('#trainer').value = item?.trainer || '';
  dlg.showModal();
}

async function handleTableClick(e) {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.classList.contains('edit')) {
    const data = await fetchJSON(`/lessons/${id}`);
    openDialog(data.item);
  } else if (btn.classList.contains('delete')) {
    if (confirm(`Les #${id} verwijderen?`)) {
      await fetchJSON(`/lessons/${id}`, { method: 'DELETE' });
      await loadList();
    }
  }
}

async function saveForm(e) {
  e?.preventDefault?.();
  const id = $('#lessonId').value;
  const body = JSON.stringify({
    type: $('#type').value,
    theme: $('#theme').value.trim(),
    location: $('#location').value.trim(),
    date: $('#date').value,
    time: $('#time').value,
    trainer: $('#trainer').value.trim()
  });
  if (id) await fetchJSON(`/lessons/${id}`, { method: 'PUT', body });
  else await fetchJSON('/lessons', { method: 'POST', body });
  $('#dlgForm').close();
  await loadList();
}

function attachEvents() {
  $('#btnToggleFilters').addEventListener('click', () => {
    $('#filters').classList.toggle('hidden');
  });
  $('#btnNew').addEventListener('click', () => openDialog(null));
  $('#btnFilter').addEventListener('click', loadList);
  $('#btnReset').addEventListener('click', () => {
    $('#filterType').value = '';
    $('#filterLocation').value='';
    $('#filterFrom').value='';
    $('#filterTo').value='';
    loadList();
  });
  $('#tbl').addEventListener('click', handleTableClick);
  $('#btnSave').addEventListener('click', saveForm);
}

window.addEventListener('DOMContentLoaded', async () => {
  attachEvents();
  await loadList();
});
