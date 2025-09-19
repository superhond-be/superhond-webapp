
// v0.16.0 — Classes + Sessions + Enrollments + Attendance + Credits + Mail log
const KEY_CLASSES   = 'SH_CLASSES';   // [{id, naam, type, start, cap, sessions:[{id,date,time,loc}]}]
const KEY_ENROLL    = 'SH_ENROLL';    // [{id, hondId, klantId, classId, start, status}]
const KEY_CUSTOMERS = 'SH_CUSTOMERS'; // customers with honden[] (each with credits)
const KEY_MAILLOG   = 'SH_MAILLOG';   // [{ts,type,klantNaam,hondNaam,classNaam,details}]
const KEY_ATTEND    = 'SH_ATTEND';    // { [classId]: { [sessionId]: { [enrollId]: 'aanwezig'|'afwezig' } } }
const TMP_SELECTED_DOG = 'SH_SELECTED_DOG';

const $ = s => document.querySelector(s);
function load(k, d){ try{return JSON.parse(localStorage.getItem(k))||d}catch(_){return d} }
function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
function uid(p='C'){ return p + Math.random().toString(36).slice(2,10); }

let classes = load(KEY_CLASSES, []);
let enrolls = load(KEY_ENROLL, []);
let customers = load(KEY_CUSTOMERS, []);
let attend = load(KEY_ATTEND, {});

document.addEventListener('DOMContentLoaded', () => {
  const sel = localStorage.getItem(TMP_SELECTED_DOG);
  if(sel){
    try{ openEnrollModal(JSON.parse(sel)); }catch{}
    localStorage.removeItem(TMP_SELECTED_DOG);
  }
  renderClasses(); renderEnrolls(); refillFilters();

  // Wire
  $('#btnAddClass').onclick = () => openClassModal();
  $('#btnCancelClass').onclick = () => $('#modalClass').classList.remove('active');
  $('#btnSaveClass').onclick = saveClass;
  $('#btnAddSess').onclick = addSessionRow;

  $('#btnCancelEnroll').onclick = () => $('#modalEnroll').classList.remove('active');
  $('#btnSaveEnroll').onclick = saveEnroll;
  $('#btnExportEnroll').onclick = exportEnrollCSV;

  $('#btnCloseAttend').onclick = () => $('#modalAttend').classList.remove('active');

  $('#tblClasses').onclick = e => {
    const btn = e.target.closest('button'); if(!btn) return;
    const id = btn.dataset.id;
    if(btn.classList.contains('edit')){
      const c = classes.find(x=>x.id===id); openClassModal(c);
    }else if(btn.classList.contains('del')){
      if(confirm('Klas verwijderen?')){ classes = classes.filter(x=>x.id!==id); save(KEY_CLASSES, classes); renderClasses(); refillFilters(); }
    }else if(btn.classList.contains('enroll')){
      openEnrollModal({}, id);
    }else if(btn.classList.contains('attend')){
      openAttendModal(id);
    }
  };

  $('#tblEnroll').onclick = e => {
    const btn = e.target.closest('button'); if(!btn) return;
    const id = btn.dataset.id;
    if(btn.classList.contains('del')){
      if(confirm('Inschrijving verwijderen?')){
        // if was active, optionally refund? we won't adjust credits on delete, only on status change
        enrolls = enrolls.filter(x=>x.id!==id); save(KEY_ENROLL, enrolls); renderEnrolls();
      }
    }else if(btn.classList.contains('cancel')){
      changeEnrollStatus(id, 'geannuleerd', true);
    }
  };

  $('#filterClass').onchange = renderEnrolls;
  $('#filterText').oninput = renderEnrolls;
});

function renderClasses(){
  const tb = $('#tblClasses tbody'); tb.innerHTML='';
  for(const c of classes){
    const sessCount = (c.sessions||[]).length;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.naam}</td>
      <td>${c.type||''}</td>
      <td>${c.start||''}</td>
      <td>${c.cap||''}</td>
      <td>${sessCount} sessie(s)</td>
      <td>
        <button class="attend" data-id="${c.id}">✔️ Aanwezigheden</button>
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
    .map(e => ({...e,
      hondNaam: findDogName(e.klantId,e.hondId),
      klantNaam: findCustomerName(e.klantId),
      classNaam: classes.find(c=>c.id===e.classId)?.naam || '(verwijderd)'
    }))
    .filter(r => `${r.hondNaam} ${r.klantNaam} ${r.classNaam}`.toLowerCase().includes(q));
  for(const r of rows){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.hondNaam||'?'}</td><td>${r.klantNaam||'?'}</td>
      <td>${r.classNaam}</td><td>${r.start||''}</td><td>${r.status}</td>
      <td>
        <button class="cancel" data-id="${r.id}">❌ Annuleren</button>
        <button class="del" data-id="${r.id}">🗑️</button>
      </td>`;
    tb.appendChild(tr);
  }
}
function refillFilters(){
  const sel = $('#filterClass');
  sel.innerHTML = '<option value=\"\">Filter: alle klassen</option>' + classes.map(c=>`<option value="${c.id}">${c.naam}</option>`).join('');
}

/* Classes + Sessions */
function openClassModal(c={id:uid('C'), naam:'', type:'', start:'', cap:8, sessions:[]}){
  $('#modalClass').classList.add('active');
  $('#classTitle').textContent = classes.find(x=>x.id===c.id) ? 'Klas bewerken' : 'Nieuwe klas';
  $('#clsNaam').value = c.naam||''; $('#clsType').value = c.type||''; $('#clsStart').value = c.start||''; $('#clsCap').value = c.cap||8;
  $('#btnSaveClass').dataset.id = c.id;
  // render sessions
  const tb = document.querySelector('#sessTbl tbody'); tb.innerHTML='';
  (c.sessions||[]).forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input type="date" value="${s.date||''}" data-sid="${s.id}" data-field="date"></td>
      <td><input type="time" value="${s.time||''}" data-sid="${s.id}" data-field="time"></td>
      <td><input value="${s.loc||''}" data-sid="${s.id}" data-field="loc"></td>
      <td><button onclick="delSess('${s.id}')">🗑️</button></td>`;
    tb.appendChild(tr);
  });
}
function addSessionRow(){
  const sid = uid('S');
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input type="date" data-sid="${sid}" data-field="date"></td>
    <td><input type="time" data-sid="${sid}" data-field="time"></td>
    <td><input data-sid="${sid}" data-field="loc"></td>
    <td><button onclick="delSess('${sid}')">🗑️</button></td>`;
  document.querySelector('#sessTbl tbody').appendChild(tr);
}
function delSess(sid){
  const row = document.querySelector(`#sessTbl [data-sid='${sid}']`)?.closest('tr');
  if(row) row.remove();
}
function collectSessions(){
  const rows = document.querySelectorAll('#sessTbl tbody tr');
  const out=[];
  rows.forEach(r=>{
    const o={id:null};
    r.querySelectorAll('input').forEach(inp=>{
      if(!o.id) o.id = inp.dataset.sid;
      o[inp.dataset.field] = inp.value;
    });
    if(o.date) out.push(o); // keep only dated
  });
  return out;
}
function saveClass(){
  const id = $('#btnSaveClass').dataset.id;
  const c = { id,
    naam:$('#clsNaam').value.trim(), type:$('#clsType').value.trim(), start:$('#clsStart').value, cap:parseInt($('#clsCap').value||'8',10),
    sessions:collectSessions()
  };
  if(!c.naam){ alert('Naam is verplicht'); return; }
  const idx = classes.findIndex(x=>x.id===id);
  if(idx>-1) classes[idx]=c; else classes.push(c);
  save(KEY_CLASSES, classes); $('#modalClass').classList.remove('active');
  renderClasses(); refillFilters();
}

/* Enrollments + Credits + Mail log */
function openEnrollModal(pre={}, fixedClassId=null){
  $('#modalEnroll').classList.add('active');
  $('#enHond').value  = pre.hondNaam || '';
  $('#enKlant').value = pre.klantNaam || '';
  $('#enClass').innerHTML = classes.map(c=>`<option value="${c.id}">${c.naam}</option>`).join('');
  if(fixedClassId) $('#enClass').value = fixedClassId;
  $('#enStart').value = todayISO();
  $('#enStatus').value = 'ingeschreven';
  $('#btnSaveEnroll').dataset.klantId = pre.klantId || '';
  $('#btnSaveEnroll').dataset.hondId  = pre.hondId || '';
}
function saveEnroll(){
  const klantId = $('#btnSaveEnroll').dataset.klantId;
  const hondId  = $('#btnSaveEnroll').dataset.hondId;
  const classId = $('#enClass').value;
  const start   = $('#enStart').value;
  const status  = $('#enStatus').value;
  if(!klantId || !hondId){ alert('Geen hond/klant geselecteerd.'); return; }
  if(!classId){ alert('Kies een klas.'); return; }
  if(!start){ alert('Aanvangsdatum is verplicht.'); return; }

  const cls = classes.find(c=>c.id===classId);
  const used = enrolls.filter(e=>e.classId===classId && e.status!=='geannuleerd').length;
  if(cls && cls.cap && used >= cls.cap && status==='ingeschreven'){
    if(!confirm(`Capaciteit bereikt (${cls.cap}). Wachtlijst gebruiken?`)){ return; }
    else { $('#enStatus').value = 'wachtlijst'; }
  }

  // one active per dog per class
  if(enrolls.find(e=>e.classId===classId && e.hondId===hondId && e.status!=='geannuleerd')){
    alert('Deze hond staat al ingeschreven voor deze klas.'); return;
  }

  // credits gating for "ingeschreven"
  if(status==='ingeschreven'){
    const dog = findDog(klantId, hondId);
    if(!dog){ alert('Hond niet gevonden.'); return; }
    if((dog.credits||0) < 1){
      alert('Onvoldoende credits. Zet status op wachtlijst of voeg credits toe bij de hond.');
      return;
    }
    // decrement credit on commit
  }

  const rec = { id: uid('E'), klantId, hondId, classId, start, status };
  enrolls.push(rec); save(KEY_ENROLL, enrolls);
  if(status==='ingeschreven'){
    adjustDogCredits(klantId, hondId, -1);
  }
  logMail('inschrijving', klantId, hondId, classId, `Status: ${status}, start: ${start}`);
  $('#modalEnroll').classList.remove('active'); renderEnrolls();
}
function changeEnrollStatus(enrollId, newStatus, refund=false){
  const e = enrolls.find(x=>x.id===enrollId); if(!e) return;
  const old = e.status; e.status = newStatus; save(KEY_ENROLL, enrolls); renderEnrolls();
  if(refund && old==='ingeschreven' && newStatus==='geannuleerd'){
    adjustDogCredits(e.klantId, e.hondId, +1);
  }
  logMail('status-wijziging', e.klantId, e.hondId, e.classId, `Van: ${old} → ${newStatus}`);
}
function adjustDogCredits(klantId, hondId, delta){
  const c = customers.find(x=>x.id===klantId); if(!c) return;
  const h = (c.honden||[]).find(x=>x.id===hondId); if(!h) return;
  h.credits = (h.credits||0) + delta; if(h.credits<0) h.credits = 0;
  save(KEY_CUSTOMERS, customers);
}
function logMail(type, klantId, hondId, classId, details){
  const log = load(KEY_MAILLOG, []);
  const item = {
    ts: new Date().toISOString(),
    type,
    klantNaam: findCustomerName(klantId),
    hondNaam: findDogName(klantId,hondId),
    classNaam: classes.find(c=>c.id===classId)?.naam || ''
  };
  if(details) item.details = details;
  log.push(item); save(KEY_MAILLOG, log);
}

/* Attendance */
function openAttendModal(classId){
  const cls = classes.find(c=>c.id===classId); if(!cls) return;
  const roster = enrolls.filter(e=>e.classId===classId && e.status==='ingeschreven');
  $('#attendTitle').textContent = `Aanwezigheden • ${cls.naam}`;
  const body = [];
  body.push('<div class="small">Klik om aan-/afwezig te togglen. Opslaan gaat automatisch.</div>');
  body.push('<table class="subtable"><thead><tr><th>Sessie</th>'+roster.map(r=>`<th>${escapeHtml(findDogName(r.klantId,r.hondId))}</th>`).join('')+'</tr></thead><tbody>');
  (cls.sessions||[]).forEach(s => {
    body.push('<tr><td>'+escapeHtml(s.date+' '+(s.time||''))+'</td>');
    roster.forEach(r => {
      const st = (attend[classId]?.[s.id]?.[r.id]) || '';
      body.push(`<td><button class="btn" data-class="${classId}" data-sid="${s.id}" data-enr="${r.id}">${st==='aanwezig'?'✔️':'—'}</button></td>`);
    });
    body.push('</tr>');
  });
  body.push('</tbody></table>');
  const el = document.getElementById('attendBody'); el.innerHTML = body.join('');
  $('#modalAttend').classList.add('active');

  el.onclick = e => {
    const b = e.target.closest('button'); if(!b) return;
    const cid = b.dataset.class, sid = b.dataset.sid, enr = b.dataset.enr;
    const cur = (((attend[cid]||={})[sid]||={})[enr]) || '';
    const nxt = cur==='aanwezig' ? '' : 'aanwezig';
    ((attend[cid]||={})[sid]||={})[enr] = nxt;
    b.textContent = nxt==='aanwezig' ? '✔️' : '—';
    save(KEY_ATTEND, attend);
  };
}

/* Helpers */
function findCustomerName(id){
  const c = customers.find(x=>x.id===id); return c ? `${c.voornaam||''} ${c.achternaam||''}`.trim() : '';
}
function findDogName(cid, hid){
  const c = customers.find(x=>x.id===cid); const h = c?.honden?.find(x=>x.id===hid);
  return h?.naam || '';
}
function findDog(cid, hid){
  const c = customers.find(x=>x.id===cid); return c?.honden?.find(x=>x.id===hid);
}
function todayISO(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function escapeHtml(s){return (s||'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}

/* Export */
function exportEnrollCSV(){
  const headers = ['id','klantNaam','hondNaam','classNaam','start','status'];
  const rows = [headers.join(',')];
  for(const e of enrolls){
    const r = {klantNaam:findCustomerName(e.klantId), hondNaam:findDogName(e.klantId,e.hondId), classNaam: classes.find(c=>c.id===e.classId)?.naam||'', start:e.start, status:e.status, id:e.id};
    rows.push(headers.map(h=>csvEsc(r[h]||'')).join(','));
  }
  const blob = new Blob([rows.join('\\n')], {type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=`inschrijvingen-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`; a.click();
  URL.revokeObjectURL(url);
}
function csvEsc(v){ v=(''+v).replace(/\\r?\\n/g,' '); return (v.includes(',')||v.includes('\"'))? '\"'+v.replace(/\"/g,'\"\"')+'\"' : v; }
