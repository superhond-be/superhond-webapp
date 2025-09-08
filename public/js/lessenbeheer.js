// Lessenbeheer CRUD
document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#lessons-table tbody');
  const form = document.getElementById('lesson-form');
  const btnRefresh = document.getElementById('btn-refresh');
  const btnReset = document.getElementById('btn-reset');
  const fLoc = document.getElementById('filter-locatie');
  const fType = document.getElementById('filter-type');

  function formToJSON(formEl){
    const data = new FormData(formEl);
    const obj = Object.fromEntries(data.entries());
    if(obj.id === '') delete obj.id;
    if(obj.credits) obj.credits = Number(obj.credits);
    return obj;
  }

  function fillForm(item){
    form.reset();
    for(const k of ['id','type','thema','locatie','trainer','datum','tijd','credits']){
      const el = document.getElementById('lf-' + k);
      if(el) el.value = item[k] ?? '';
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  function rowActions(item){
    return `<div class="btn-row">
      <button class="btn btn-xs" data-act="edit" data-id="${item.id}">Wijzig</button>
      <button class="btn btn-xs btn-danger" data-act="del" data-id="${item.id}">Verwijder</button>
    </div>`;
  }

  async function loadLessons(){
    const q = new URLSearchParams();
    if(fLoc.value) q.set('locatie', fLoc.value);
    if(fType.value) q.set('type', fType.value);
    tbody.innerHTML = '<tr><td colspan="9">Laden…</td></tr>';
    try{
      const res = await fetch('/api/lessons' + (q.toString() ? ('?' + q.toString()) : ''));
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const list = await res.json();
      if(!Array.isArray(list) || list.length === 0){
        tbody.innerHTML = '<tr><td colspan="9">Geen sessies gevonden.</td></tr>';
        return;
      }
      tbody.innerHTML = list.map(l => `<tr>
        <td>${l.id}</td>
        <td>${l.datum || ''}</td>
        <td>${l.tijd || ''}</td>
        <td>${l.type}</td>
        <td>${l.thema}</td>
        <td>${l.locatie}</td>
        <td>${l.trainer}</td>
        <td>${l.credits ?? 1}</td>
        <td>${rowActions(l)}</td>
      </tr>`).join('');
    } catch(e){
      tbody.innerHTML = `<tr><td colspan="9">Fout bij laden: ${e.message}</td></tr>`;
    }
  }

  // Table actions
  document.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button[data-act]');
    if(!btn) return;
    const id = btn.getAttribute('data-id');
    if(btn.dataset.act === 'edit'){
      // fetch single item and fill form
      try{
        const res = await fetch('/api/lessons/' + id);
        const item = await res.json();
        fillForm(item);
      }catch(e){ alert('Kon item niet ophalen'); }
    }
    if(btn.dataset.act === 'del'){
      if(!confirm('Verwijderen?')) return;
      try{
        const res = await fetch('/api/lessons/' + id, { method: 'DELETE' });
        if(!res.ok && res.status !== 204) throw new Error('HTTP ' + res.status);
        await loadLessons();
      }catch(e){ alert('Verwijderen mislukt: ' + e.message); }
    }
  });

  // Filters
  btnRefresh.addEventListener('click', loadLessons);

  // Form submit (create/update)
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const data = formToJSON(form);
    const isUpdate = !!data.id;
    const url = isUpdate ? '/api/lessons/' + data.id : '/api/lessons';
    const method = isUpdate ? 'PUT' : 'POST';
    try{
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if(!res.ok) throw new Error('HTTP ' + res.status);
      form.reset();
      await loadLessons();
    }catch(e){
      alert('Opslaan mislukt: ' + e.message);
    }
  });

  btnReset.addEventListener('click', () => form.reset());

  // initial load
  loadLessons();
});
