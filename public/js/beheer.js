function option(list, idKey, labelKey, selectedId){
  return list.map(it=>`<option value="${it[idKey]}" ${it[idKey]===selectedId?'selected':''}>${it[labelKey]}</option>`).join('');
}
function renderBeheer(){
  const db = SHDB.loadDB();
  const tbody = document.getElementById('tbl-lessen');
  tbody.innerHTML = (db.lessen||[]).map(ls=>`<tr data-id="${ls.id}">
    <td><select>${option(db.namen,'id','naam',ls.naamId)}</select></td>
    <td><select>${option(db.types,'id','type',ls.typeId)}</select></td>
    <td><select>${option(db.locaties,'id','naam',ls.locatieId)}</select></td>
    <td><select>${option(db.themas,'id','naam',ls.themaId)}</select></td>
    <td><select>${option(db.trainers,'id','naam',ls.trainerId)}</select></td>
    <td><input type="date" value="${ls.datum}"></td>
    <td><input type="time" value="${ls.tijd}"></td>
    <td><input type="number" min="1" value="${ls.capaciteit}"></td>
    <td>
      <div class="actions">
        <button class="iconbtn" data-act="save" data-id="${ls.id}">💾</button>
        <button class="iconbtn" data-act="del" data-id="${ls.id}">🗑️</button>
      </div>
    </td>
  </tr>`).join('');
}
function addLes(){
  const db = SHDB.loadDB();
  const id = SHDB.uid('ls');
  const d = new Date().toISOString().slice(0,10);
  db.lessen = db.lessen||[];
  db.lessen.push({id, naamId: db.namen[0]?.id, typeId: db.types[0]?.id, locatieId: db.locaties[0]?.id, themaId: db.themas[0]?.id, trainerId: db.trainers[0]?.id, datum:d, tijd:'10:00', capaciteit:8});
  SHDB.saveDB(db);
  renderBeheer();
}
function attachBeheerActions(){
  const tbody = document.getElementById('tbl-lessen');
  tbody.addEventListener('click', (e)=>{
    const btn = e.target.closest('button.iconbtn'); if(!btn) return;
    const id = btn.dataset.id; const act = btn.dataset.act;
    const db = SHDB.loadDB();
    if(act==='del'){
      if(confirm('Les verwijderen?')){
        db.lessen = db.lessen.filter(x=>x.id!==id);
        SHDB.saveDB(db);
        renderBeheer();
      }
      return;
    }
    if(act==='save'){
      const tr = btn.closest('tr');
      const [naamSel,typeSel,locSel,thSel,trSel,dateInp,timeInp,capInp] = tr.querySelectorAll('select,input');
      const i = db.lessen.findIndex(x=>x.id===id); if(i<0) return;
      db.lessen[i] = {...db.lessen[i],
        naamId: naamSel.value, typeId: typeSel.value, locatieId: locSel.value, themaId: thSel.value, trainerId: trSel.value,
        datum: dateInp.value, tijd: timeInp.value, capaciteit: Number(capInp.value||0)
      };
      SHDB.saveDB(db);
    }
  });
}
window.addEventListener('DOMContentLoaded', ()=>{
  renderBeheer();
  attachBeheerActions();
  document.getElementById('add-les').addEventListener('click', addLes);

  // Export/Import buttons
  const ex = document.getElementById('btn-export');
  const im = document.getElementById('btn-import');
  const file = document.getElementById('file-import');
  ex.addEventListener('click', ()=> SHDB.exportJSON());
  im.addEventListener('click', ()=> file.click());
  file.addEventListener('change', async (e)=>{
    const f = e.target.files[0]; if(!f) return;
    try{
      await SHDB.importJSON(f);
      SHCRUD.renderAll();
      renderBeheer();
      alert('Import gelukt ✅');
    }catch(err){
      alert('Import mislukt: '+ err.message);
    }finally{
      file.value = '';
    }
  });
});