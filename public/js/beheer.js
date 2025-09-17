
function getSort(){ return JSON.parse(localStorage.getItem('sh_sort')||'{}'); }
function setSort(s){ localStorage.setItem('sh_sort', JSON.stringify(s)); }

function nameById(id, list, key='naam'){ return (list.find(x=>x.id===id)||{})[key] || ''; }
function locById(db, id){ return db.locaties.find(l=>l.id===id)||{}; }

function renderRows(db, rows){
  const tbody=document.getElementById('tbl-lessen');
  tbody.innerHTML = rows.map(ls=>{
    const loc = locById(db, ls.locatieId);
    const maps = 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent((loc.adres||'')+', '+(loc.plaats||'')+', '+(loc.land||''));
    return `<tr data-id="${ls.id}">
      <td><input name="naamId" value="${ls.naamId}"></td>
      <td><input name="typeId" value="${ls.typeId}"></td>
      <td><input name="locatieId" value="${ls.locatieId}"></td>
      <td>${loc.adres||''}</td><td>${loc.plaats||''}</td><td>${loc.land||''}</td>
      <td><input name="themaId" value="${ls.themaId}"></td>
      <td><input name="trainers" value="${(ls.trainerIds||[]).join(',')}"></td>
      <td><input name="datum" type="date" value="${ls.datum||''}"></td>
      <td><input name="tijd" type="time" value="${ls.tijd||''}"></td>
      <td>${ls.eindtijd||''}</td>
      <td><input name="capaciteit" type="number" value="${ls.capaciteit||''}"></td>
      <td><a href="${maps}" target="_blank">Maps</a></td>
      <td class="actions-cell">
        <div class="actions">
          <button class="iconbtn" data-act="save" data-id="${ls.id}">💾</button>
          <button class="iconbtn" data-act="del" data-id="${ls.id}">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function applyFiltersAndSort(db){
  const fName=document.getElementById('fName').value.toLowerCase();
  const fLoc=document.getElementById('fLoc').value.toLowerCase();
  const fTrainer=document.getElementById('fTrainer').value.toLowerCase();
  const fStart=document.getElementById('fStart').value;
  const fEnd=document.getElementById('fEnd').value;
  let rows=[...db.lessen];

  rows=rows.filter(ls=>{
    const naam=nameById(ls.naamId, db.namen).toLowerCase();
    const loc=(locById(db,ls.locatieId).plaats||'').toLowerCase();
    const trainers=(ls.trainerIds||[]).map(id=>nameById(id,db.trainers)).join(', ').toLowerCase();
    if(fName && !naam.includes(fName)) return false;
    if(fLoc && !loc.includes(fLoc)) return false;
    if(fTrainer && !trainers.includes(fTrainer)) return false;
    if(fStart && (ls.datum||'') < fStart) return false;
    if(fEnd && (ls.datum||'') > fEnd) return false;
    return true;
  });

  const s=getSort();
  if(s.key){
    const key=s.key, dir=s.dir==='desc'?-1:1;
    rows.sort((a,b)=>{
      const val = (ls,k)=>{
        if(k==='naam') return nameById(ls.naamId, db.namen);
        if(k==='trainer') return (ls.trainerIds||[]).map(id=>nameById(id,db.trainers)).join(', ');
        if(k==='datum') return ls.datum||'';
        if(k==='plaats') return (locById(db,ls.locatieId).plaats||'');
        return '';
      };
      const A=val(a,key), B=val(b,key);
      return A===B?0:(A>B?1:-1)*dir;
    });
  }

  renderRows(db, rows);
  // update sort indicators
  document.querySelectorAll('th.sortable .sort-ind').forEach(el=>el.textContent='');
  if(s.key){
    const th=document.querySelector(`th.sortable[data-key="${s.key}"] .sort-ind`);
    if(th) th.textContent = s.dir==='asc'?'▲':'▼';
  }
}

function setup(){
  const form=document.getElementById('form-add');
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const db=SHDB.loadDB();
    const data=new FormData(form);
    const naamId=data.get('naam'); const typeId=data.get('type'); const locId=data.get('loc'); const themaId=data.get('thema'); const trainerIds=data.getAll('trainer'); const datum=data.get('datum'); const tijd=data.get('tijd'); const cap=parseInt(data.get('cap'))||0;
    const lesduur=(db.namen.find(n=>n.id===naamId)||{}).lesduur||60; const eind=SHDB.addMinutesToTime(tijd,lesduur);
    db.lessen.push({id:SHDB.uid('ls'),naamId,typeId,locatieId:locId,themaId,trainerIds,datum,tijd,eindtijd:eind,capaciteit:cap});
    SHDB.saveDB(db); form.reset(); applyFiltersAndSort(db);
  });

  // inline save/delete
  document.body.addEventListener('click',(e)=>{
    const btn=e.target.closest('button.iconbtn'); if(!btn) return;
    const act=btn.dataset.act; const id=btn.dataset.id;
    const db=SHDB.loadDB(); const idx=db.lessen.findIndex(x=>x.id===id); if(idx<0) return;
    if(act==='del'){ if(confirm('Les verwijderen?')){ db.lessen.splice(idx,1); SHDB.saveDB(db); applyFiltersAndSort(db); } return; }
    if(act==='save'){ const tr=btn.closest('tr'); const ls=db.lessen[idx];
      tr.querySelectorAll('input').forEach(inp=>{ if(inp.name==='trainers'){ ls.trainerIds=inp.value.split(',').map(s=>s.trim()).filter(Boolean); } else { ls[inp.name]=inp.value; } });
      const lesduur=(db.namen.find(n=>n.id===ls.naamId)||{}).lesduur||60; ls.eindtijd=SHDB.addMinutesToTime(ls.tijd,lesduur);
      SHDB.saveDB(db); applyFiltersAndSort(db);
    }
  });

  // filter listeners
  document.querySelectorAll('.filterbar input,.filterbar select').forEach(el=>el.addEventListener('input',()=>applyFiltersAndSort(SHDB.loadDB())));

  // sorting
  document.querySelectorAll('th.sortable').forEach(th=> th.addEventListener('click',()=>{
    const s=getSort();
    let dir='asc'; if(s.key===th.dataset.key && s.dir==='asc') dir='desc';
    setSort({key:th.dataset.key, dir});
    applyFiltersAndSort(SHDB.loadDB());
  }));
}

window.addEventListener('DOMContentLoaded',()=>{ applyFiltersAndSort(SHDB.loadDB()); setup(); });
