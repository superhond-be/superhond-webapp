
// Superhond Klanten v0.14.0 — klanten + honden
const KEY = 'SH_CUSTOMERS';
const $ = sel => document.querySelector(sel);

function load(){ try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return []} }
function save(list){ localStorage.setItem(KEY, JSON.stringify(list)); }

function render(list){
  const tbody=document.querySelector('#tbl tbody'); tbody.innerHTML='';
  for(const c of list){
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${c.voornaam||''} ${c.achternaam||''}</td>
      <td>${c.email||''}</td>
      <td>${c.telefoon||''}</td>
      <td>${(c.honden||[]).length} hond(en)</td>
      <td><button class='edit' data-id='${c.id}'>✏️</button>
      <button class='del' data-id='${c.id}'>🗑️</button></td>`;
    tbody.appendChild(tr);
  }
  document.getElementById('count').textContent=list.length+' klanten';
}

function uid(){return 'K'+Math.random().toString(36).slice(2,9);}
function uidHond(){return 'H'+Math.random().toString(36).slice(2,9);}

let all=load();

document.addEventListener('DOMContentLoaded',()=>{
  render(all);
  document.getElementById('btnAdd').onclick=()=>openModal();
  document.getElementById('tbl').onclick=e=>{
    if(e.target.classList.contains('edit')){
      const c=all.find(x=>x.id==e.target.dataset.id);
      openModal(c);
    } else if(e.target.classList.contains('del')){
      all=all.filter(x=>x.id!=e.target.dataset.id); save(all); render(all);
    }
  }
  document.getElementById('btnCancel').onclick=closeModal;
  document.getElementById('btnSave').onclick=saveModal;
  document.getElementById('btnAddHond').onclick=()=>addHondRow();
});

function openModal(c={id:uid(),honden:[]}){
  document.getElementById('modal').classList.add('active');
  document.getElementById('modalTitle').textContent=c.id?'Klant bewerken':'Nieuwe klant';
  document.getElementById('voornaam').value=c.voornaam||'';
  document.getElementById('achternaam').value=c.achternaam||'';
  document.getElementById('email').value=c.email||'';
  document.getElementById('telefoon').value=c.telefoon||'';
  document.getElementById('adres').value=c.adres||'';
  document.getElementById('postcode').value=c.postcode||'';
  document.getElementById('gemeente').value=c.gemeente||'';
  document.getElementById('hondTbl').dataset.cid=c.id;
  renderHonden(c.honden||[]);
  document.getElementById('btnSave').dataset.id=c.id;
}
function closeModal(){document.getElementById('modal').classList.remove('active');}

function renderHonden(list){
  const tbody=document.querySelector('#hondTbl tbody'); tbody.innerHTML='';
  for(const h of list){
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><input value="${h.naam||''}" data-hid="${h.id}" data-field="naam"></td>
      <td><input value="${h.ras||''}" data-hid="${h.id}" data-field="ras"></td>
      <td><input type="date" value="${h.geboorte||''}" data-hid="${h.id}" data-field="geboorte"></td>
      <td><input value="${h.notes||''}" data-hid="${h.id}" data-field="notes"></td>
      <td><button onclick="delHond('${h.id}')">🗑️</button></td>`;
    tbody.appendChild(tr);
  }
}
function addHondRow(){
  const hid=uidHond();
  const tr=document.createElement('tr');
  tr.innerHTML=`<td><input data-hid="${hid}" data-field="naam"></td>
    <td><input data-hid="${hid}" data-field="ras"></td>
    <td><input type="date" data-hid="${hid}" data-field="geboorte"></td>
    <td><input data-hid="${hid}" data-field="notes"></td>
    <td><button onclick="delHond('${hid}')">🗑️</button></td>`;
  document.querySelector('#hondTbl tbody').appendChild(tr);
}
function delHond(hid){
  const row=document.querySelector(`#hondTbl [data-hid='${hid}']`)?.closest('tr');
  if(row) row.remove();
}
function collectHonden(){
  const rows=document.querySelectorAll('#hondTbl tbody tr');
  const list=[];
  rows.forEach(r=>{
    const obj={id:null};
    r.querySelectorAll('input').forEach(inp=>{
      if(!obj.id) obj.id=inp.dataset.hid;
      obj[inp.dataset.field]=inp.value;
    });
    list.push(obj);
  });
  return list;
}
function saveModal(){
  const id=document.getElementById('btnSave').dataset.id;
  const c={
    id:id,
    voornaam:document.getElementById('voornaam').value,
    achternaam:document.getElementById('achternaam').value,
    email:document.getElementById('email').value,
    telefoon:document.getElementById('telefoon').value,
    adres:document.getElementById('adres').value,
    postcode:document.getElementById('postcode').value,
    gemeente:document.getElementById('gemeente').value,
    honden:collectHonden()
  };
  const idx=all.findIndex(x=>x.id==id);
  if(idx>-1){all[idx]=c;}else{all.push(c);}
  save(all); render(all); closeModal();
}
