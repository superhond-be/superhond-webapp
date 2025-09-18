
const byId=(arr,id)=>arr.find(x=>x.id===id)||{};
const nameOf=(arr,id)=> (byId(arr,id).naam || byId(arr,id).type || '');
const state = { fKlas:'all', fTrainer:'all', fMonth:'all', fYear:'all' };

function sortLesdagen(lesdagen){ return lesdagen.sort((a,b)=> (a.datum+a.start).localeCompare(b.datum+b.start)); }
function mapsUrl(loc){ return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([loc.adres,loc.plaats,loc.land].filter(Boolean).join(', ')); }

function populateSelectors(){
  const db=SHDB.loadDB();
  // planner selects
  const fill=(el, list, label='naam')=> el.innerHTML = list.map(x=>`<option value="${x.id}">${x[label]||x.type||x.naam}</option>`).join('');
  const names = db.klassen.map(k=>({id:k.id, naam: nameOf(db.namen,k.naamId)+' — '+nameOf(db.themas,k.themaId)}));
  fill(document.querySelector('#form-reeks [name="klasId"]'), names, 'naam');
  fill(document.querySelector('#form-reeks [name="locatieId"]'), db.locaties, 'naam');
  document.querySelector('#form-reeks [name="trainerIds"]').innerHTML = db.trainers.map(t=>`<option value="${t.id}">${t.naam}</option>`).join('');
  fill(document.querySelector('#form-les [name="klasId"]'), names, 'naam');
  fill(document.querySelector('#form-les [name="locatieId"]'), db.locaties, 'naam');
  document.querySelector('#form-les [name="trainerIds"]').innerHTML = db.trainers.map(t=>`<option value="${t.id}">${t.naam}</option>`).join('');

  // filters
  const fk=document.getElementById('filter-klas');
  fk.innerHTML = `<option value="all">Alle klassen</option>` + db.klassen.map(k=>`<option value="${k.id}">${nameOf(db.namen,k.naamId)} — ${nameOf(db.themas,k.themaId)}</option>`).join('');
  const ft=document.getElementById('filter-trainer');
  ft.innerHTML = `<option value="all">Alle trainers</option>` + db.trainers.map(t=>`<option value="${t.id}">${t.naam}</option>`).join('');

  // month/year from data
  const months=new Set(), years=new Set();
  (db.lesdagen||[]).forEach(l=>{ const [y,m]=l.datum.split('-'); years.add(y); months.add(m); });
  const mSel=document.getElementById('filter-month'); const ySel=document.getElementById('filter-year');
  mSel.innerHTML = `<option value="all">Maand</option>` + [...months].sort().map(m=>`<option value="${m}">${m}</option>`).join('');
  ySel.innerHTML = `<option value="all">Jaar</option>` + [...years].sort().map(y=>`<option value="${y}">${y}</option>`).join('');
}

function applyFilters(rows){
  return rows.filter(l=>{
    if(state.fKlas!=='all' && l.klasId!==state.fKlas) return false;
    if(state.fTrainer!=='all' && !(l.trainerIds||[]).includes(state.fTrainer)) return false;
    if(state.fMonth!=='all' && l.datum.split('-')[1]!==state.fMonth) return false;
    if(state.fYear!=='all' && l.datum.split('-')[0]!==state.fYear) return false;
    return true;
  });
}

function renderTable(){
  const db=SHDB.loadDB();
  db.lesdagen = sortLesdagen(db.lesdagen||[]);
  SHDB.saveDB(db);
  const tbody=document.getElementById('tbl-lesdagen');
  const rows=applyFilters(db.lesdagen);
  document.getElementById('count-lessen').textContent = rows.length;
  tbody.innerHTML=rows.map(l=>{
    const klas=byId(db.klassen,l.klasId);
    const naam=nameOf(db.namen,klas.naamId);
    const loc=byId(db.locaties,l.locatieId)||{};
    const statusClass = l.status==='cancelled' ? 'status cancelled' : 'status active';
    const statusText = l.status==='cancelled' ? 'Geannuleerd' : 'Actief';
    const locOpts=db.locaties.map(x=>`<option value="${x.id}" ${x.id===l.locatieId?'selected':''}>${x.naam}</option>`).join('');
    const trOpts=db.trainers.map(t=>`<option value="${t.id}" ${l.trainerIds?.includes(t.id)?'selected':''}>${t.naam}</option>`).join('');
    const trainersText = formatTrainerNames(l.trainerIds, db.trainers);
    return `<tr data-id="${l.id}">
      <td><span class="${statusClass}">${statusText}</span></td>
      <td>${naam} <span class="badge-mini">${byId(db.themas,klas.themaId).naam}</span> <span class="badge-mini">${byId(db.types,klas.typeId).type}</span> <span class="badge-mini">${klas.capaciteit} cap</span></td>
      <td><input type="date" name="datum" value="${l.datum}"></td>
      <td><input type="time" name="start" value="${l.start}"></td>
      <td class="mono">${l.einde}</td>
      <td><select name="locatieId">${locOpts}</select><br><a class="small" href="${mapsUrl(loc)}" target="_blank">Maps</a></td>
      <td><select name="trainerIds" multiple size="2">${trOpts}</select><span class="trainer-names">${trainersText}</span></td>
      <td>
        <button class="btn muted act-save">💾 Bewaren</button>
        <button class="btn warn act-del">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

function attachTableHandlers(){
  document.getElementById('tbl-lesdagen').addEventListener('click',(e)=>{
    const tr=e.target.closest('tr'); if(!tr) return;
    const db=SHDB.loadDB(); const id=tr.dataset.id; const idx=db.lesdagen.findIndex(x=>x.id===id); if(idx<0) return;
    if(e.target.closest('.act-del')){ if(confirm('Les verwijderen?')){ db.lesdagen.splice(idx,1); SHDB.saveDB(db); renderTable(); } return; }
    if(e.target.closest('.act-save')){
      const l=db.lesdagen[idx];
      l.datum = tr.querySelector('input[name="datum"]').value;
      l.start = tr.querySelector('input[name="start"]').value;
      const klas=byId(db.klassen,l.klasId); const nm=byId(db.namen,klas.naamId);
      l.einde = SHDB.addMinutesToTime(l.start, nm.lesduur||60);
      l.locatieId = tr.querySelector('select[name="locatieId"]').value;
      l.trainerIds = Array.from(tr.querySelector('select[name="trainerIds"]').selectedOptions).map(o=>o.value);
      db.lesdagen[idx]=l; SHDB.saveDB(db); renderTable();
    }
  });

  // live trainer names under multi-select
  document.getElementById('tbl-lesdagen').addEventListener('change',(e)=>{
    const sel=e.target.closest('select[name="trainerIds"]'); if(!sel) return;
    const tr=sel.closest('tr'); const db=SHDB.loadDB();
    const ids=Array.from(sel.selectedOptions).map(o=>o.value);
    tr.querySelector('.trainer-names').textContent = formatTrainerNames(ids, db.trainers);
  });
}

function attachPlanner(){
  // Reeks
  document.getElementById('form-reeks').addEventListener('submit',(e)=>{
    e.preventDefault();
    const db=SHDB.loadDB(); const f=e.target;
    const klas=byId(db.klassen, f.klasId.value); const nm=byId(db.namen, klas.naamId);
    const from=new Date(f.from.value); const to=new Date(f.to.value); const start=f.start.value;
    const loc=f.locatieId.value; const trainerIds=Array.from(f.trainerIds.selectedOptions).map(o=>o.value);
    const picks=Array.from(f.querySelectorAll('input[name="dow"]:checked')).map(i=>parseInt(i.value));
    for(let d=new Date(from); d<=to; d.setDate(d.getDate()+1)){
      if(picks.includes(d.getDay())){
        const iso=d.toISOString().slice(0,10);
        const einde=SHDB.addMinutesToTime(start, nm.lesduur||60);
        db.lesdagen.push({id:SHDB.uid('ld'), klasId:klas.id, datum:iso, start, einde, locatieId:loc, trainerIds, status:'active'});
      }
    }
    SHDB.saveDB(db); populateSelectors(); renderTable(); f.reset();
  });

  // Enkele les
  document.getElementById('form-les').addEventListener('submit',(e)=>{
    e.preventDefault();
    const db=SHDB.loadDB(); const f=e.target;
    const klas=byId(db.klassen, f.klasId.value); const nm=byId(db.namen, klas.naamId);
    const start=f.start.value; const einde=SHDB.addMinutesToTime(start, nm.lesduur||60);
    const trainerIds=Array.from(f.trainerIds.selectedOptions).map(o=>o.value);
    db.lesdagen.push({id:SHDB.uid('ld'), klasId:f.klasId.value, datum:f.datum.value, start, einde, locatieId:f.locatieId.value, trainerIds, status:'active'});
    SHDB.saveDB(db); populateSelectors(); renderTable(); f.reset();
  });
}

function attachFilters(){
  const onChange=(id, key)=> document.getElementById(id).addEventListener('change',(e)=>{ state[key]=e.target.value; renderTable(); });
  onChange('filter-klas','fKlas'); onChange('filter-trainer','fTrainer'); onChange('filter-month','fMonth'); onChange('filter-year','fYear');
  document.getElementById('btn-reset-filters').addEventListener('click',()=>{
    state.fKlas=state.fTrainer=state.fMonth=state.fYear='all';
    document.getElementById('filter-klas').value='all';
    document.getElementById('filter-trainer').value='all';
    document.getElementById('filter-month').value='all';
    document.getElementById('filter-year').value='all';
    renderTable();
  });
}

function exportCSV(){
  const db=SHDB.loadDB();
  const rows=applyFilters(sortLesdagen(db.lesdagen||[]));
  // Excel BE/NL friendly => semicolon separator
  const sep=';';
  const esc=s=>(''+(s??'')).replaceAll('"','""');
  const header=['Datum','Start','Einde','Klas','Thema','Type','Locatie','Trainers','Status'];
  const lines=[header.join(sep)];
  rows.forEach(l=>{
    const klas=byId(db.klassen,l.klasId);
    const naam=nameOf(db.namen,klas.naamId);
    const thema=byId(db.themas,klas.themaId).naam;
    const type=byId(db.types,klas.typeId).type;
    const loc=byId(db.locaties,l.locatieId).naam;
    const trainers = formatTrainerNames(l.trainerIds, db.trainers);
    const status = l.status==='cancelled' ? 'Geannuleerd' : 'Actief';
    const row=[l.datum,l.start,l.einde,naam,thema,type,loc,trainers,status].map(v=>`"${esc(v)}"`).join(sep);
    lines.push(row);
  });
  const csv=lines.join("\n");
  saveFile('lessen_export.csv', csv);
}

function attachExport(){ document.getElementById('btn-export').addEventListener('click', exportCSV); }

window.addEventListener('DOMContentLoaded', ()=>{
  populateSelectors();
  attachPlanner();
  attachFilters();
  attachTableHandlers();
  attachExport();
  renderTable();
});
