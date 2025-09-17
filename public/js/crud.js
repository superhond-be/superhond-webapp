function td(val){ return `<td>${val??''}</td>`; }
function actionBtns(id, key){ 
  return `<div class="actions">
    <button class="iconbtn" data-act="save" data-key="${key}" data-id="${id}" title="Opslaan">💾</button>
    <button class="iconbtn" data-act="del"  data-key="${key}" data-id="${id}" title="Verwijderen">🗑️</button>
  </div>`;
}

function renderNamen(){
  const db = SHDB.loadDB();
  const body = document.getElementById('tbl-namen');
  body.innerHTML = db.namen.map(n=>`<tr data-id="${n.id}">
    ${td(`<input value="${n.naam}">`)}
    ${td(`<input type="number" value="${n.prijs}">`)}
    ${td(`<input type="number" value="${n.strippen}">`)}
    ${td(`<input type="number" value="${n.max}">`)}
    ${td(`<input type="number" value="${n.lesduur}">`)}
    ${td(`<input value="${n.mailblue}">`)}
    ${td(`<input value="${n.geldigheid}">`)}
    ${td(actionBtns(n.id,'namen'))}
  </tr>`).join('');
}

function renderTypes(){
  const db = SHDB.loadDB();
  const body = document.getElementById('tbl-types');
  body.innerHTML = db.types.map(t=>`<tr data-id="${t.id}">
    ${td(`<input value="${t.type}">`)}
    ${td(`<input value="${t.beschrijving}">`)}
    ${td(actionBtns(t.id,'types'))}
  </tr>`).join('');
}

function renderLocaties(){
  const db = SHDB.loadDB();
  const body = document.getElementById('tbl-locaties');
  body.innerHTML = db.locaties.map(l=>`<tr data-id="${l.id}">
    ${td(`<input value="${l.naam}">`)}
    ${td(`<input value="${l.adres}">`)}
    ${td(`<input value="${l.plaats}">`)}
    ${td(`<input value="${l.land}">`)}
    ${td(`<input value="${l.beschrijving}">`)}
    ${td(actionBtns(l.id,'locaties'))}
  </tr>`).join('');
}

function renderThemas(){
  const db = SHDB.loadDB();
  const body = document.getElementById('tbl-themas');
  body.innerHTML = db.themas.map(t=>`<tr data-id="${t.id}">
    ${td(`<input value="${t.naam}">`)}
    ${td(`<input value="${t.beschrijving}">`)}
    ${td(actionBtns(t.id,'themas'))}
  </tr>`).join('');
}

function renderTrainers(){
  const db = SHDB.loadDB();
  const body = document.getElementById('tbl-trainers');
  body.innerHTML = db.trainers.map(t=>`<tr data-id="${t.id}">
    ${td(`<input value="${t.naam}">`)}
    ${td(`<input value="${t.functie}">`)}
    ${td(actionBtns(t.id,'trainers'))}
  </tr>`).join('');
}

function attachRowActions(containerId){
  const el = document.getElementById(containerId);
  el.addEventListener('click', (e)=>{
    const btn = e.target.closest('button.iconbtn');
    if(!btn) return;
    const key = btn.dataset.key;
    const id = btn.dataset.id;
    const act = btn.dataset.act;
    const db = SHDB.loadDB();
    const tr = btn.closest('tr');
    const inputs = [...tr.querySelectorAll('input')].map(i=>i.value);

    function saveRow(){
      const list = db[key];
      const i = list.findIndex(x=>x.id===id);
      if(i<0) return;
      if(key==='namen'){
        const [naam, prijs, strippen, max, lesduur, mailblue, geldigheid] = inputs;
        list[i] = {...list[i], naam, prijs:Number(prijs), strippen:Number(strippen), max:Number(max), lesduur:Number(lesduur), mailblue, geldigheid};
      }else if(key==='types'){
        const [type, beschrijving] = inputs; list[i] = {...list[i], type, beschrijving};
      }else if(key==='locaties'){
        const [naam, adres, plaats, land, beschrijving] = inputs; list[i] = {...list[i], naam, adres, plaats, land, beschrijving};
      }else if(key==='themas'){
        const [naam, beschrijving] = inputs; list[i] = {...list[i], naam, beschrijving};
      }else if(key==='trainers'){
        const [naam, functie] = inputs; list[i] = {...list[i], naam, functie};
      }
      SHDB.saveDB(db);
    }

    if(act==='save'){ saveRow(); return; }
    if(act==='del'){
      if(confirm('Verwijderen bevestigen?')){
        db[key] = db[key].filter(x=>x.id!==id);
        SHDB.saveDB(db);
        tr.remove();
      }
      return;
    }
  });
}

function addRow(key){
  const db = SHDB.loadDB();
  const id = SHDB.uid(key);
  if(key==='namen') db.namen.push({id, naam:'Nieuw pakket', prijs:0, strippen:0, max:0, lesduur:60, mailblue:'', geldigheid:'4 weken'});
  if(key==='types') db.types.push({id, type:'Nieuw', beschrijving:''});
  if(key==='locaties') db.locaties.push({id, naam:'Nieuwe locatie', adres:'', plaats:'', land:'BE', beschrijving:''});
  if(key==='themas') db.themas.push({id, naam:'Nieuw thema', beschrijving:''});
  if(key==='trainers') db.trainers.push({id, naam:'Nieuwe trainer', functie:''});
  SHDB.saveDB(db);
  renderAll();
}

function renderAll(){
  renderNamen(); renderTypes(); renderLocaties(); renderThemas(); renderTrainers();
}

window.SHCRUD = { renderAll, addRow, attachRowActions };