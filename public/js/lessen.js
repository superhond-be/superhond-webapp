
// v0.15.0 — Classes + Enrollments with start date and capacity checks
const KEY_CLASSES = 'SH_CLASSES';   // [{id, naam, type, start, cap}]
const KEY_ENROLL  = 'SH_ENROLL';    // [{id, hondId, klantId, classId, start, status}]
const KEY_CUSTOMERS = 'SH_CUSTOMERS';
const TMP_SELECTED_DOG = 'SH_SELECTED_DOG';

const $ = s => document.querySelector(s);

function load(k, d){ try{return JSON.parse(localStorage.getItem(k))||d}catch(_){return d} }
function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
function uid(p='C'){ return p + Math.random().toString(36).slice(2,10); }

let classes = load(KEY_CLASSES, []);
let enrolls = load(KEY_ENROLL, []);
let customers = load(KEY_CUSTOMERS, []);

document.addEventListener('DOMContentLoaded', () => {
  // Preselect from klanten
  const sel = localStorage.getItem(TMP_SELECTED_DOG);
  if(sel){
    try{
      const s = JSON.parse(sel);
      openEnrollModal(s);
      localStorage.removeItem(TMP_SELECTED_DOG);
    }catch{}
  }
  renderClasses(); renderEnrolls(); refillFilters();

  // Wire buttons
  $('#btnAddClass').onclick = () => openClassModal();
  $('#btnCancelClass').onclick = () => $('#modalClass').classList.remove('active');
  $('#btnSaveClass').onclick = saveClass;
  $('#btnExportEnroll').onclick = exportEnrollCSV;

  $('#btnCancelEnroll').onclick = () => $('#modalEnroll').classList.remove('active');
  $('#btnSaveEnroll').onclick = saveEnroll;

  // table actions
  $('#tblClasses').onclick = e => {
    const btn = e.target.closest('button'); if(!btn) return;
    const id = btn.dataset.id;
    if(btn.classList.contains('edit')){
      const c = classes.find(x=>x.id===id); openClassModal(c);
    }else if(btn.classList.contains('del')){
      if(confirm('Deze klas verwijderen? (inschrijvingen blijven bestaan, maar zonder verwijzing)')){
        classes = classes.filter(x=>x.id!==id); save(KEY_CLASSES, classes); renderClasses(); refillFilters();
      }
    }else if(btn.classList.contains('enroll')){
      openEnrollModal({}, id);
    }
  };
  $('#tblEnroll').onclick = e => {
    const btn = e.target.closest('button'); if(!btn) return;
    const id = btn.dataset.id;
    if(btn.classList.contains('del')){
      if(confirm('Inschrijving verwijderen?')){
        enrolls = enrolls.filter(x=>x.id!==id); save(KEY_ENROLL, enrolls); renderEnrolls();
      }
    }
  };

  $('#filterClass').onchange = renderEnrolls;
  $('#filterText').oninput = renderEnrolls;
});

function renderClasses(){
  const tb = $('#tblClasses tbody'); tb.innerHTML='';
  for(const c of classes){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.naam}</td>
      <td>${c.type||''}</td>
      <td>${c.start||''}</td>
      <td>${c.cap||''}</td>
      <td>
        <button class="enroll" data-id="${c.id}">➕ Inschrijven</button>
        <button class="edit" data-id="${c.id}">✏️</button>
        <button class="del" data-id="${c.id}">🗑️</button>
      </td>`;
    tb.appendChild(tr);
  }
}
function renderEnrolls(){
  const tb = $('#tblEnroll tbody'); tb.innerHTML='';
  const fClass = $('#filterClass').value;
  const q = $('#filterText').value.toLowerCase();

  const rows = enrolls
    .filter(e => !fClass || e.classId===fClass)
    .map(e => ({
      ...e,
      hondNaam: findDogName(e.klantId,e.hondId),
      klantNaam: findCustomerName(e.klantId),
      classNaam: classes.find(c=>c.id===e.classId)?.naam || '(verwijderd)'
    }))
    .filter(r => `${r.hondNaam} ${r.klantNaam} ${r.classNaam}`.toLowerCase().includes(q));

  for(const r of rows){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.hondNaam||'?'}</td><td>${r.klantNaam||'?'}</td>
      <td>${r.classNaam}</td><td>${r.start||''}</td><td>${r.status}</td>
      <td><button class="del" data-id="${r.id}">🗑️</button></td>`;
    tb.appendChild(tr);
  }
}
function refillFilters(){
  const sel = $('#filterClass');
  sel.innerHTML = '<option value=\"\">Filter: alle klassen</option>' + classes.map(c=>`<option value="${c.id}">${c.naam}</option>`).join('');
}

function openClassModal(c={id:uid('C'), naam:'', type:'', start:'', cap:8}){
  $('#modalClass').classList.add('active');
  $('#classTitle').textContent = c && c.id && classes.find(x=>x.id===c.id) ? 'Klas bewerken' : 'Nieuwe klas';
  $('#clsNaam').value = c.naam||'';
  $('#clsType').value = c.type||'';
  $('#clsStart').value = c.start||'';
  $('#clsCap').value = c.cap||8;
  $('#btnSaveClass').dataset.id = c.id;
}
function saveClass(){
  const id = $('#btnSaveClass').dataset.id;
  const c = { id, naam:$('#clsNaam').value.trim(), type:$('#clsType').value.trim(), start:$('#clsStart').value, cap:parseInt($('#clsCap').value||'8',10) };
  if(!c.naam){ alert('Naam is verplicht'); return; }
  const idx = classes.findIndex(x=>x.id===id);
  if(idx>-1) classes[idx]=c; else classes.push(c);
  save(KEY_CLASSES, classes); $('#modalClass').classList.remove('active');
  renderClasses(); refillFilters();
}

function openEnrollModal(pre={}, fixedClassId=null){
  $('#modalEnroll').classList.add('active');
  const dog = pre.hondNaam || ''; const owner = pre.klantNaam || '';
  $('#enHond').value = dog; $('#enKlant').value = owner;
  // populate class options
  $('#enClass').innerHTML = classes.map(c=>`<option value="${c.id}">${c.naam}</option>`).join('');
  if(fixedClassId) $('#enClass').value = fixedClassId;
  $('#enStart').value = todayISO();
  $('#enStatus').value = 'ingeschreven';
  // store temp
  $('#btnSaveEnroll').dataset.klantId = pre.klantId || '';
  $('#btnSaveEnroll').dataset.hondId = pre.hondId || '';
}
function saveEnroll(){
  const klantId = $('#btnSaveEnroll').dataset.klantId;
  const hondId  = $('#btnSaveEnroll').dataset.hondId;
  const classId = $('#enClass').value;
  const start   = $('#enStart').value;
  const status  = $('#enStatus').value;

  if(!klantId || !hondId){ alert('Geen hond/klant geselecteerd. Start via Klanten of kies hond.'); return; }
  if(!classId){ alert('Kies een klas.'); return; }
  if(!start){ alert('Aanvangsdatum is verplicht.'); return; }

  const cls = classes.find(c=>c.id===classId);
  // capacity check (simple: count current)
  const used = enrolls.filter(e=>e.classId===classId && e.status!=='geannuleerd').length;
  if(cls && cls.cap && used >= cls.cap && status==='ingeschreven'){
    if(!confirm(`Capaciteit bereikt (${cls.cap}). Wil je op de wachtlijst inschrijven?`)){
      return;
    } else {
      // auto set to waitlist
      document.getElementById('enStatus').value = 'wachtlijst';
    }
  }

  // One active enrollment per dog per class
  const dupe = enrolls.find(e=>e.classId===classId && e.hondId===hondId && e.status!=='geannuleerd');
  if(dupe){ alert('Deze hond staat al ingeschreven voor deze klas.'); return; }

  const rec = { id: uid('E'), klantId, hondId, classId, start, status };
  enrolls.push(rec); save(KEY_ENROLL, enrolls);
  $('#modalEnroll').classList.remove('active'); renderEnrolls();
}

function exportEnrollCSV(){
  const headers = ['id','klantId','klantNaam','hondId','hondNaam','classId','classNaam','start','status'];
  const rows = [headers.join(',')];
  for(const e of enrolls){
    const r = {
      id: e.id, klantId: e.klantId, klantNaam: findCustomerName(e.klantId),
      hondId: e.hondId, hondNaam: findDogName(e.klantId,e.hondId),
      classId: e.classId, classNaam: classes.find(c=>c.id===e.classId)?.naam || '',
      start: e.start, status: e.status
    };
    rows.push(headers.map(h=>csvEscape(r[h]||'')).join(','));
  }
  const blob = new Blob([rows.join('\\n')], {type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  a.href = url; a.download = `inschrijvingen-${ts}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function findCustomerName(id){
  const c = customers.find(x=>x.id===id); return c ? `${c.voornaam||''} ${c.achternaam||''}`.trim() : '';
}
function findDogName(cid, hid){
  const c = customers.find(x=>x.id===cid);
  const h = c?.honden?.find(x=>x.id===hid);
  return h?.naam || '';
}

function csvEscape(val){
  val = (''+val).replace(/\\r?\\n/g, ' ');
  if(val.includes(',') || val.includes('\"')){
    return '\"' + val.replace(/\"/g,'\"\"') + '\"';
  }
  return val;
}
function todayISO(){
  const d = new Date(); const m = (d.getMonth()+1).toString().padStart(2,'0'); const day = d.getDate().toString().padStart(2,'0');
  return `${d.getFullYear()}-${m}-${day}`;
}
