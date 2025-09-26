
const byId=(arr,id)=>arr.find(x=>x.id===id)||{};
const nameOf=(arr,id)=> (byId(arr,id).naam || byId(arr,id).type || '');
const getSort=()=> JSON.parse(localStorage.getItem('sh_sort_klassen')||'{}');
const setSort=(s)=> localStorage.setItem('sh_sort_klassen', JSON.stringify(s));

function sortRows(rows, db){
  const s=getSort(); if(!s.key) return rows;
  const dir = s.dir==='desc' ? -1 : 1;
  const valOf=(kl,key)=>{
    if(key==='naam') return nameOf(db.namen, kl.naamId);
    if(key==='type') return nameOf(db.types, kl.typeId);
    if(key==='thema') return nameOf(db.themas, kl.themaId);
    if(key==='capaciteit') return parseInt(kl.capaciteit)||0;
    return '';
  };
  return rows.slice().sort((a,b)=>{
    const A=valOf(a,s.key), B=valOf(b,s.key);
    if(A===B) return 0;
    return (A>B?1:-1)*dir;
  });
}

function renderKlassen(){
  const db=SHDB.loadDB();
  let rows = sortRows(db.klassen||[], db);
  const thead = document.querySelector('#tbl-klassen-head');
  thead.querySelectorAll('.sort-ind').forEach(el=>el.textContent='');
  const s=getSort(); if(s.key){ const th=thead.querySelector(`[data-key="${s.key}"] .sort-ind`); if(th) th.textContent = s.dir==='asc' ? '▲' : '▼'; }
  const tbody=document.getElementById('tbl-klassen');
  tbody.innerHTML=rows.map(kl=>{
    const naamOpts=db.namen.map(x=>`<option value="${x.id}" ${x.id===kl.naamId?'selected':''}>${x.naam}</option>`).join('');
    const typeOpts=db.types.map(x=>`<option value="${x.id}" ${x.id===kl.typeId?'selected':''}>${x.type}</option>`).join('');
    const thOpts=db.themas.map(x=>`<option value="${x.id}" ${x.id===kl.themaId?'selected':''}>${x.naam}</option>`).join('');
    return `<tr data-id="${kl.id}">
      <td><select name="naamId">${naamOpts}</select></td>
      <td><select name="typeId">${typeOpts}</select></td>
      <td><select name="themaId">${thOpts}</select></td>
      <td><input name="capaciteit" type="number" value="${kl.capaciteit||''}"></td>
      <td class="actions-cell"><button class="iconbtn act-save" data-id="${kl.id}">💾</button><button class="iconbtn act-del" data-id="${kl.id}">🗑️</button></td>
    </tr>`;
  }).join('');
}

function setupKlassen(){
  document.querySelectorAll('#tbl-klassen-head th.sortable').forEach(th=>{
    th.addEventListener('click',()=>{
      const s=getSort();
      let dir='asc';
      if(s.key===th.dataset.key && s.dir==='asc') dir='desc';
      setSort({key:th.dataset.key, dir});
      renderKlassen();
    });
  });
  document.getElementById('form-add-klas').addEventListener('submit',(e)=>{
    e.preventDefault();
    const db=SHDB.loadDB();
    const f=e.target;
    const nieuw={id:SHDB.uid('kl'),naamId:f.naamId.value,typeId:f.typeId.value,themaId:f.themaId.value,capaciteit:parseInt(f.capaciteit.value)||0};
    db.klassen.push(nieuw); SHDB.saveDB(db); renderKlassen(); f.reset();
  });
  document.getElementById('tbl-klassen').addEventListener('click',(e)=>{
    const btn=e.target.closest('button'); if(!btn) return;
    const db=SHDB.loadDB(); const id=btn.dataset.id; const idx=(db.klassen||[]).findIndex(x=>x.id===id); if(idx<0) return;
    if(btn.classList.contains('act-del')){ if(confirm('Verwijderen?')){ db.klassen.splice(idx,1); SHDB.saveDB(db); renderKlassen(); } return; }
    if(btn.classList.contains('act-save')){
      const tr=btn.closest('tr'); const kl=db.klassen[idx];
      tr.querySelectorAll('select,input').forEach(el=>{ kl[el.name]=el.value; });
      SHDB.saveDB(db); renderKlassen();
    }
  });
}

window.addEventListener('DOMContentLoaded', ()=>{ renderKlassen(); setupKlassen(); });
