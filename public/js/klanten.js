
// v0.15.0 klanten + honden + doorsturen naar lessen
const KEY = 'SH_CUSTOMERS'; // customers with honden[]
const TMP_SELECTED_DOG = 'SH_SELECTED_DOG'; // for handoff to lessen
const $ = s => document.querySelector(s);

function load(){ try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return []} }
function save(list){ localStorage.setItem(KEY, JSON.stringify(list)); }
function uid(p='K'){ return p + Math.random().toString(36).slice(2,10); }
function render(list){
  const tbody = document.querySelector('#tbl tbody'); tbody.innerHTML='';
  for(const c of list){
    const honden = (c.honden||[]).map(h=>`<span class="tag">${h.naam||'🐶'} <button class="mini-enroll" data-cid="${c.id}" data-hid="${h.id}" title="Inschrijven">➕</button></span>`).join(' ');
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.voornaam||''} ${c.achternaam||''}</td>
      <td>${c.email||''}</td>
      <td>${c.telefoon||''}</td>
      <td>${honden||'<em>Geen</em>'}</td>
      <td>
        <button class="edit" data-id="${c.id}">✏️</button>
        <button class="del" data-id="${c.id}">🗑️</button>
      </td>`;
    tbody.appendChild(tr);
  }
  document.getElementById('count').textContent = `${list.length} klanten`;
}
let all = load();

document.addEventListener('DOMContentLoaded', () => {
  render(all);
  document.getElementById('search').addEventListener('input', e=>{
    const q = e.target.value.toLowerCase();
    const filtered = all.filter(c => JSON.stringify(c).toLowerCase().includes(q));
    render(filtered);
  });
  document.getElementById('btnAdd').onclick = () => openModal();
  document.getElementById('tbl').onclick = e => {
    const btn = e.target.closest('button');
    if(!btn) return;
    if(btn.classList.contains('edit')){
      const c = all.find(x=>x.id===btn.dataset.id); openModal(c);
    }else if(btn.classList.contains('del')){
      if(confirm('Deze klant verwijderen?')){
        all = all.filter(x=>x.id!==btn.dataset.id); save(all); render(all);
      }
    }else if(btn.classList.contains('mini-enroll')){
      // Set temp selection and go to lessen
      const c = all.find(x=>x.id===btn.dataset.cid);
      const h = (c?.honden||[]).find(x=>x.id===btn.dataset.hid);
      if(c && h){
        localStorage.setItem(TMP_SELECTED_DOG, JSON.stringify({klantId:c.id, hondId:h.id, klantNaam:`${c.voornaam} ${c.achternaam}`, hondNaam:h.naam}));
        window.location.href = 'lessen.html';
      }
    }
  };
  document.getElementById('btnCancel').onclick = closeModal;
  document.getElementById('btnSave').onclick = saveModal;
  document.getElementById('btnAddHond').onclick = addHondRow;
});

function openModal(c={id:uid('K'), honden:[]}){
  document.getElementById('modal').classList.add('active');
  document.getElementById('modalTitle').textContent = c.id? 'Klant bewerken' : 'Nieuwe klant';
  ['voornaam','achternaam','email','telefoon','adres','postcode','gemeente'].forEach(f=>document.getElementById(f).value=c[f]||'');
  document.getElementById('hondTbl').dataset.cid = c.id;
  renderHonden(c.honden||[]);
  document.getElementById('btnSave').dataset.id = c.id;
}
function closeModal(){ document.getElementById('modal').classList.remove('active'); }
function renderHonden(list){
  const tbody = document.querySelector('#hondTbl tbody'); tbody.innerHTML='';
  for(const h of list){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input value="${h.naam||''}" data-hid="${h.id}" data-field="naam"></td>
      <td><input value="${h.ras||''}" data-hid="${h.id}" data-field="ras"></td>
      <td><input type="date" value="${h.geboorte||''}" data-hid="${h.id}" data-field="geboorte"></td>
      <td><input value="${h.notes||''}" data-hid="${h.id}" data-field="notes"></td>
      <td><button onclick="delHond('${h.id}')">🗑️</button> <button onclick="enrollDog('${h.id}')">➕ Inschrijven</button></td>`;
    tbody.appendChild(tr);
  }
}
function addHondRow(){
  const hid = uid('H');
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input data-hid="${hid}" data-field="naam"></td>
    <td><input data-hid="${hid}" data-field="ras"></td>
    <td><input type="date" data-hid="${hid}" data-field="geboorte"></td>
    <td><input data-hid="${hid}" data-field="notes"></td>
    <td><button onclick="delHond('${hid}')">🗑️</button> <button onclick="enrollDog('${hid}')">➕ Inschrijven</button></td>`;
  document.querySelector('#hondTbl tbody').appendChild(tr);
}
function delHond(hid){
  const row = document.querySelector(`#hondTbl [data-hid='${hid}']`)?.closest('tr');
  if(row) row.remove();
}
function collectHonden(){
  const rows = document.querySelectorAll('#hondTbl tbody tr');
  const list = [];
  rows.forEach(r=>{
    const obj={id:null};
    r.querySelectorAll('input').forEach(inp=>{
      if(!obj.id) obj.id = inp.dataset.hid;
      obj[inp.dataset.field] = inp.value;
    });
    list.push(obj);
  });
  return list;
}
function saveModal(){
  const id = document.getElementById('btnSave').dataset.id;
  const c = { id,
    voornaam:$('#voornaam').value, achternaam:$('#achternaam').value, email:$('#email').value, telefoon:$('#telefoon').value,
    adres:$('#adres').value, postcode:$('#postcode').value, gemeente:$('#gemeente').value,
    honden:collectHonden()
  };
  const idx = all.findIndex(x=>x.id===id);
  if(idx>-1) all[idx]=c; else all.push(c);
  save(all); render(all); closeModal();
}
function enrollDog(hid){
  // read current modal customer
  const cid = document.getElementById('hondTbl').dataset.cid;
  const c = all.find(x=>x.id===cid) || {id:cid, voornaam:$('#voornaam').value, achternaam:$('#achternaam').value, honden:collectHonden()};
  const h = (c.honden||[]).find(x=>x.id===hid);
  if(!h){ alert('Bewaar eerst de klant en hond.'); return; }
  localStorage.setItem(TMP_SELECTED_DOG, JSON.stringify({klantId:c.id, hondId:h.id, klantNaam:`${c.voornaam} ${c.achternaam}`, hondNaam:h.naam}));
  window.location.href = 'lessen.html';
}
