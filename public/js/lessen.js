
// Lessenbeheer v0.17.2 — classes + lessons + enrollments + fases + reservations + credits
const KEY_CLASSES='SH_CLASSES';    // [{id,naam,type,themas,cap,lessen:[{id,date,time,loc,strippen}], startAuto (derived)}]
const KEY_ENROLL='SH_ENROLL';      // [{id,klantId,hondId,classId,start,validMonths,phase}]
const KEY_RES='SH_RES';            // { [enrollId]: { [lesId]: 'pending'|'confirmed' } }
const KEY_CUSTOMERS='SH_CUSTOMERS';
const TMP='SH_SELECTED_DOG';

const $=s=>document.querySelector(s); function load(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(_){return d}} function save(k,v){localStorage.setItem(k,JSON.stringify(v))} function uid(p='C'){return p+Math.random().toString(36).slice(2,10)}

let classes=load(KEY_CLASSES,[]), enrolls=load(KEY_ENROLL,[]), customers=load(KEY_CUSTOMERS,[]), res=load(KEY_RES,{});

document.addEventListener('DOMContentLoaded',()=>{
  const sel=localStorage.getItem(TMP); if(sel){ try{openEnrollModal(JSON.parse(sel))}catch{} localStorage.removeItem(TMP); }
  renderClasses(); renderEnrolls(); refillFilters();
  // wire
  $('#btnAddClass').onclick=()=>openClassModal();
  $('#btnCancelClass').onclick=()=>$('#modalClass').classList.remove('active');
  $('#btnSaveClass').onclick=saveClass;
  $('#btnAddLess').onclick=addLesRow;
  $('#btnCancelEnroll').onclick=()=>$('#modalEnroll').classList.remove('active');
  $('#btnSaveEnroll').onclick=saveEnroll;
  $('#btnCloseRes').onclick=()=>$('#modalRes').classList.remove('active');
  $('#btnExportEnroll').onclick=exportEnrollCSV;

  $('#tblClasses').onclick=e=>{
    const b=e.target.closest('button'); if(!b) return; const id=b.dataset.id;
    if(b.classList.contains('enroll')) openEnrollModal({}, id);
    else if(b.classList.contains('edit')) openClassModal(classes.find(x=>x.id===id));
    else if(b.classList.contains('del')){ if(confirm('Klas verwijderen?')){ classes=classes.filter(x=>x.id!==id); save(KEY_CLASSES,classes); renderClasses(); refillFilters(); } }
  };
  $('#tblEnroll').onclick=e=>{
    const b=e.target.closest('button'); if(!b) return; const id=b.dataset.id;
    if(b.classList.contains('approve')) approveEnroll(id);
    else if(b.classList.contains('manage')) openResModal(id);
    else if(b.classList.contains('cancel')){ const eobj=enrolls.find(x=>x.id===id); if(eobj){ eobj.phase='geannuleerd'; save(KEY_ENROLL,enrolls); renderEnrolls(); } }
  };
  $('#filterClass').onchange=renderEnrolls; $('#filterText').oninput=renderEnrolls;
});

/* Helpers */
function custName(id){const c=customers.find(x=>x.id===id);return c?`${c.voornaam||''} ${c.achternaam||''}`.trim():''}
function dogName(cid,hid){const c=customers.find(x=>x.id===cid);const h=c?.honden?.find(x=>x.id===hid);return h?.naam||''}
function findDog(cid,hid){const c=customers.find(x=>x.id===cid);return c?.honden?.find(x=>x.id===hid)}
function todayISO(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function csvEsc(v){v=(''+v).replace(/\r?\n/g,' ');return(v.includes(',')||v.includes('"'))?'"'+v.replace(/"/g,'""')+'"':v}

/* Klassen */
function renderClasses(){
  const tb=$('#tblClasses tbody'); tb.innerHTML='';
  for(const c of classes){
    const sc=(c.lessen||[]).length;
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${c.naam}</td><td>${c.type||''}</td><td>${c.themas||''}</td><td>${c.startAuto||''}</td><td>${c.cap||''}</td><td>${sc}</td>
      <td><button class="btn enroll" data-id="${c.id}">➕ Inschrijven</button> <button class="btn edit" data-id="${c.id}">✏️</button> <button class="btn del" data-id="${c.id}">🗑️</button></td>`;
    tb.appendChild(tr);
  }
}
function openClassModal(c={id:uid('C'),naam:'',type:'',themas:'',cap:8,lessen:[],startAuto:''}){
  $('#modalClass').classList.add('active');
  $('#classTitle').textContent = classes.find(x=>x.id===c.id)?'Klas bewerken':'Nieuwe klas';
  document.getElementById('clsNaam').value=c.naam||'';
  document.getElementById('clsType').value=c.type||'';
  document.getElementById('clsThemas').value=c.themas||'';
  document.getElementById('clsCap').value=c.cap||8;
  document.getElementById('btnSaveClass').dataset.id=c.id;
  const tb=document.querySelector('#lessTbl tbody'); tb.innerHTML='';
  (c.lessen||[]).forEach(s=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><input type="date" value="${s.date||''}" data-lid="${s.id}" data-field="date"></td>
      <td><input type="time" value="${s.time||''}" data-lid="${s.id}" data-field="time"></td>
      <td><input value="${s.loc||''}" data-lid="${s.id}" data-field="loc"></td>
      <td><input type="number" min="0" value="${s.strippen||1}" data-lid="${s.id}" data-field="strippen"></td>
      <td><button onclick="delLes('${s.id}')">🗑️</button></td>`;
    tb.appendChild(tr);
  });
}
function addLesRow(){
  const lid=uid('L');
  const tr=document.createElement('tr');
  tr.innerHTML=`<td><input type="date" data-lid="${lid}" data-field="date"></td>
    <td><input type="time" data-lid="${lid}" data-field="time"></td>
    <td><input data-lid="${lid}" data-field="loc"></td>
    <td><input type="number" min="0" value="1" data-lid="${lid}" data-field="strippen"></td>
    <td><button onclick="delLes('${lid}')">🗑️</button></td>`;
  document.querySelector('#lessTbl tbody').appendChild(tr);
}
function delLes(lid){const row=document.querySelector(`#lessTbl [data-lid='${lid}']`)?.closest('tr'); if(row) row.remove();}
function collectLessen(){
  const rows=document.querySelectorAll('#lessTbl tbody tr'); const out=[];
  rows.forEach(r=>{const o={id:null}; r.querySelectorAll('input').forEach(i=>{if(!o.id)o.id=i.dataset.lid; const f=i.dataset.field; o[f]= (f==='strippen')?parseInt(i.value||'1',10):i.value;}); if(o.date) out.push(o);});
  return out.sort((a,b)=> (a.date||'').localeCompare(b.date||''));
}
function saveClass(){
  const id=document.getElementById('btnSaveClass').dataset.id;
  const lessen=collectLessen();
  const startAuto = lessen.length? lessen[0].date : '';
  const c={ id,
    naam:document.getElementById('clsNaam').value.trim(),
    type:document.getElementById('clsType').value.trim(),
    themas:document.getElementById('clsThemas').value.trim(),
    cap:parseInt(document.getElementById('clsCap').value||'8',10),
    lessen, startAuto
  };
  if(!c.naam){ alert('Naam is verplicht'); return; }
  const idx=classes.findIndex(x=>x.id===id); if(idx>-1) classes[idx]=c; else classes.push(c);
  save(KEY_CLASSES, classes); $('#modalClass').classList.remove('active'); renderClasses(); refillFilters();
}

/* Inschrijvingen */
function renderEnrolls(){
  const tb=$('#tblEnroll tbody'); tb.innerHTML='';
  const f=$('#filterClass').value; const q=$('#filterText').value.toLowerCase();
  const rows=enrolls
    .filter(e=>!f || e.classId===f)
    .map(e=>({...e, hondNaam:dogName(e.klantId,e.hondId), klantNaam:custName(e.klantId), classNaam:(classes.find(c=>c.id===e.classId)?.naam||'')}))
    .filter(r => `${r.hondNaam} ${r.klantNaam} ${r.classNaam}`.toLowerCase().includes(q));
  for(const r of rows){
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${r.hondNaam}</td><td>${r.klantNaam}</td><td>${r.classNaam}</td><td>${r.start||''}</td><td>${r.validMonths} mnd</td><td>${r.phase}</td>
      <td>${buttons(r)}</td>`;
    tb.appendChild(tr);
  }
}
function buttons(r){
  const manage=`<button class="btn manage" data-id="${r.id}">📅 Lessen</button>`;
  if(r.phase==='aanvraag') return `<button class="btn approve" data-id="${r.id}">✅ Goedkeuren</button> ${manage} <button class="btn cancel" data-id="${r.id}">❌</button>`;
  if(r.phase==='goedgekeurd'||r.phase==='actief') return `${manage} <button class="btn cancel" data-id="${r.id}">❌</button>`;
  return '';
}
function refillFilters(){
  const sel=$('#filterClass'); sel.innerHTML='<option value=\"\">Filter: alle klassen</option>'+classes.map(c=>`<option value="${c.id}">${c.naam}</option>`).join('');
}
function openEnrollModal(pre={}, fixedId=null){
  $('#modalEnroll').classList.add('active');
  $('#enHond').value=pre.hondNaam||''; $('#enKlant').value=pre.klantNaam||'';
  const sel=document.getElementById('enClass'); sel.innerHTML=classes.map(c=>`<option value="${c.id}">${c.naam}</option>`).join('');
  if(fixedId) sel.value=fixedId;
  // start = start van eerste les (administratief)
  const cid=sel.value; const cls=classes.find(x=>x.id===cid); const start=cls?.startAuto||'';
  // geldigheid vanuit hond-instelling (default 5)
  const dog = pre.hondId ? findDog(pre.klantId, pre.hondId) : null;
  const validMonths = dog?.geldigheid || 5;
  // stash on save
  document.getElementById('btnSaveEnroll').dataset.klantId=pre.klantId||'';
  document.getElementById('btnSaveEnroll').dataset.hondId=pre.hondId||'';
  document.getElementById('btnSaveEnroll').dataset.classStart=start||'';
  document.getElementById('btnSaveEnroll').dataset.valid=validMonths;
}
function saveEnroll(){
  const klantId=document.getElementById('btnSaveEnroll').dataset.klantId;
  const hondId=document.getElementById('btnSaveEnroll').dataset.hondId;
  const classId=document.getElementById('enClass').value;
  const cls=classes.find(c=>c.id===classId);
  if(!klantId||!hondId){alert('Geen hond/klant geselecteerd.');return}
  if(!classId){alert('Kies een klas.');return}
  const start = cls?.startAuto || '';
  const dog = findDog(klantId, hondId);
  const validMonths = dog?.geldigheid || 5;
  const rec={id:uid('E'), klantId, hondId, classId, start, validMonths, phase:'aanvraag'};
  enrolls.push(rec); save(KEY_ENROLL, enrolls); $('#modalEnroll').classList.remove('active'); renderEnrolls();
}

function approveEnroll(id){
  const e=enrolls.find(x=>x.id===id); if(!e) return; e.phase='goedgekeurd';
  // bevestig pending lessen en trek credits af per les (volgens strippen)
  const cls=classes.find(c=>c.id===e.classId);
  const dog=findDog(e.klantId,e.hondId);
  const bookings=res[e.id]||{};
  for(const [lid,st] of Object.entries(bookings)){
    if(st==='pending'){
      const les = (cls?.lessen||[]).find(s=>s.id===lid);
      const kost = les?.strippen ?? 1;
      if(dog && (dog.credits||0) >= kost){
        bookings[lid]='confirmed'; dog.credits -= kost;
      }
    }
  }
  res[e.id]=bookings; save(KEY_RES,res); save(KEY_ENROLL,enrolls);
  if(dog) save(KEY_CUSTOMERS, customers);
  renderEnrolls();
}

/* Les-reservaties */
function openResModal(enrollId){
  const e=enrolls.find(x=>x.id===enrollId); if(!e) return;
  const cls=classes.find(c=>c.id===e.classId);
  $('#modalRes').classList.add('active');
  $('#resTitle').textContent = `Lessen • ${cls?.naam||''}`;
  document.getElementById('resInfo').textContent = `Fase: ${e.phase} • Start: ${e.start||'-'} • Hond: ${dogName(e.klantId,e.hondId)} • Eigenaar: ${custName(e.klantId)}`;
  const tb=document.querySelector('#resTbl tbody'); tb.innerHTML='';
  (cls?.lessen||[]).forEach(s=>{
    const st=(res[e.id]||{})[s.id]||'';
    const label = st==='confirmed' ? '✔️ bevestigd' : (st==='pending' ? '⏳ in aanvraag' : '—');
    const btn = `<button class="btn toggle" data-e="${e.id}" data-l="${s.id}">${st? 'Annuleer' : 'Reserveer'}</button>`;
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${s.date} ${s.time||''}${s.loc?(' • '+s.loc):''} — ${s.strippen||1} strip(pen)</td><td>${label}</td><td>${btn}</td>`;
    tb.appendChild(tr);
  });
  tb.onclick = ev => {
    const b=ev.target.closest('button'); if(!b) return; toggleReservation(b.dataset.e, b.dataset.l);
  };
}
function toggleReservation(enrollId, lesId){
  const e=enrolls.find(x=>x.id===enrollId); if(!e) return;
  const cls=classes.find(c=>c.id===e.classId);
  const dog=findDog(e.klantId,e.hondId);
  res[enrollId]=res[enrollId]||{};
  const cur=res[enrollId][lesId]||'';
  if(cur){ // annuleren -> refund indien confirmed
    if(cur==='confirmed'){
      const les=(cls?.lessen||[]).find(s=>s.id===lesId); const kost=les?.strippen ?? 1;
      if(dog){ dog.credits=(dog.credits||0)+kost; save(KEY_CUSTOMERS, customers); }
    }
    delete res[enrollId][lesId];
  } else {
    if(e.phase==='aanvraag'){
      res[enrollId][lesId]='pending'; // geen creditverbruik
    } else {
      const les=(cls?.lessen||[]).find(s=>s.id===lesId); const kost=les?.strippen ?? 1;
      if((dog?.credits||0) < kost){ alert('Onvoldoende credits'); return; }
      res[enrollId][lesId]='confirmed'; dog.credits -= kost; save(KEY_CUSTOMERS, customers);
    }
  }
  save(KEY_RES,res); openResModal(enrollId);
}

/* Export inschrijvingen */
function exportEnrollCSV(){
  const headers=['id','klant','hond','klas','aanvang','geldigheid_maanden','fase'];
  const rows=[headers.join(',')];
  for(const e of enrolls){
    const r=[e.id,custName(e.klantId),dogName(e.klantId,e.hondId),(classes.find(c=>c.id===e.classId)?.naam||''),e.start||'',e.validMonths,e.phase];
    rows.push(r.map(csvEsc).join(','));
  }
  const blob=new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a');
  a.href=url; a.download=`inschrijvingen-v0172-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`; a.click(); URL.revokeObjectURL(url);
}
