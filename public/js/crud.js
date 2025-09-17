
function iconBtns(key,id){return `<div class="actions">
  <button class="iconbtn" data-act="save" data-key="${key}" data-id="${id}">💾</button>
  <button class="iconbtn" data-act="del" data-key="${key}" data-id="${id}">🗑️</button>
</div>`}

function input(name,val,type='text',extra=''){ return `<input ${extra} name="${name}" type="${type}" value="${val??''}">`; }
function rowNamen(n){ return `<tr data-id="${n.id}">
  <td>${input('naam',n.naam)}</td>
  <td>${input('prijs',n.prijs,'number','step="1"')}</td>
  <td>${input('strippen',n.strippen,'number')}</td>
  <td>${input('max',n.max,'number')}</td>
  <td>${input('lesduur',n.lesduur,'number')}</td>
  <td>${input('mailblue',n.mailblue)}</td>
  <td>${input('geldigheid',n.geldigheid)}</td>
  <td>${iconBtns('namen',n.id)}</td>
</tr>`}

function rowTypes(t){ return `<tr data-id="${t.id}">
  <td>${input('type',t.type)}</td>
  <td>${input('beschrijving',t.beschrijving)}</td>
  <td>${iconBtns('types',t.id)}</td>
</tr>`}

function rowLoc(l){ return `<tr data-id="${l.id}">
  <td>${input('naam',l.naam)}</td>
  <td>${input('adres',l.adres)}</td>
  <td>${input('plaats',l.plaats)}</td>
  <td>${input('land',l.land)}</td>
  <td>${iconBtns('locaties',l.id)}</td>
</tr>`}

function rowThema(t){ return `<tr data-id="${t.id}">
  <td>${input('naam',t.naam)}</td>
  <td>${iconBtns('themas',t.id)}</td>
</tr>`}

function rowTrainer(t){ return `<tr data-id="${t.id}">
  <td>${input('naam',t.naam)}</td>
  <td>${iconBtns('trainers',t.id)}</td>
</tr>`}

function mountCRUD(){
  const db = SHDB.loadDB();
  document.getElementById('tbl-namen').innerHTML = db.namen.map(rowNamen).join('');
  document.getElementById('tbl-types').innerHTML = db.types.map(rowTypes).join('');
  document.getElementById('tbl-locaties').innerHTML = db.locaties.map(rowLoc).join('');
  document.getElementById('tbl-themas').innerHTML = db.themas.map(rowThema).join('');
  document.getElementById('tbl-trainers').innerHTML = db.trainers.map(rowTrainer).join('');

  document.getElementById('add-naam').onclick = ()=>{ const d=SHDB.loadDB(); const id=SHDB.uid('nm'); d.namen.push({id,naam:'Nieuwe naam',prijs:0,strippen:0,max:0,lesduur:60,mailblue:'',geldigheid:''}); SHDB.saveDB(d); mountCRUD(); renderBeheer(); };
  document.getElementById('add-type').onclick = ()=>{ const d=SHDB.loadDB(); const id=SHDB.uid('tp'); d.types.push({id,type:'Nieuw',beschrijving:''}); SHDB.saveDB(d); mountCRUD(); renderBeheer(); };
  document.getElementById('add-loc').onclick = ()=>{ const d=SHDB.loadDB(); const id=SHDB.uid('loc'); d.locaties.push({id,naam:'Nieuwe locatie',adres:'',plaats:'',land:'BE'}); SHDB.saveDB(d); mountCRUD(); renderBeheer(); };
  document.getElementById('add-th').onclick = ()=>{ const d=SHDB.loadDB(); const id=SHDB.uid('th'); d.themas.push({id,naam:'Nieuw thema'}); SHDB.saveDB(d); mountCRUD(); renderBeheer(); };
  document.getElementById('add-tr').onclick = ()=>{ const d=SHDB.loadDB(); const id=SHDB.uid('tr'); d.trainers.push({id,naam:'Nieuwe trainer'}); SHDB.saveDB(d); mountCRUD(); renderBeheer(); };

  document.body.addEventListener('click', (e)=>{
    const btn = e.target.closest('button.iconbtn'); if(!btn) return;
    const key = btn.dataset.key; const id = btn.dataset.id; const act=btn.dataset.act;
    const d = SHDB.loadDB();
    if(act==='del'){
      if(confirm('Verwijderen?')){
        d[key] = d[key].filter(x=>x.id!==id);
        // cascade: verwijder lessen met ontbrekende referenties
        if(key==='namen'){ d.lessen = d.lessen.filter(x=>x.naamId!==id); }
        if(key==='types'){ d.lessen = d.lessen.filter(x=>x.typeId!==id); }
        if(key==='locaties'){ d.lessen = d.lessen.filter(x=>x.locatieId!==id); }
        if(key==='themas'){ d.lessen = d.lessen.filter(x=>x.themaId!==id); }
        if(key==='trainers'){ d.lessen = d.lessen.map(x=> ({...x, trainerIds:(x.trainerIds||[]).filter(t=>t!==id)})); }
        SHDB.saveDB(d); mountCRUD(); renderBeheer();
      }
      return;
    }
    if(act==='save'){
      const tr = btn.closest('tr');
      const obj = {}; Array.from(tr.querySelectorAll('input')).forEach(i=> obj[i.name]= i.type==='number'? Number(i.value||0): i.value);
      const idx = d[key].findIndex(x=>x.id===id); if(idx>=0){ d[key][idx] = { ...d[key][idx], ...obj }; }
      SHDB.saveDB(d); renderBeheer();
    }
  });
}
window.addEventListener('DOMContentLoaded', mountCRUD);
