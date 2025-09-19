
const KEY='SH_CUSTOMERS';
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(_){return []}}
function save(v){localStorage.setItem(KEY, JSON.stringify(v))}
let all=load();
const $=s=>document.querySelector(s);

document.addEventListener('DOMContentLoaded',()=>{
  render();
  $('#btnAdd').onclick=()=>openModal();
  $('#btnCancel').onclick=()=>$('#modal').style.display='none';
  $('#btnSave').onclick=saveModal;
  $('#btnAddHond').onclick=addHondRow;
});

function render(){
  const tb=document.querySelector('#tbl tbody'); tb.innerHTML='';
  for(const c of all){
    const dogs=(c.honden||[]).map(h=>`${h.naam} (${h.credits||0}/${h.geldigheid||0}m)`).join(', ');
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${c.voornaam} ${c.achternaam}</td><td>${dogs}</td><td><button onclick="edit('${c.id}')" class="btn">✏️</button></td>`;
    tb.appendChild(tr);
  }
}
function edit(id){const c=all.find(x=>x.id===id); openModal(c);}
function openModal(c={id:'K'+Math.random().toString(36).slice(2,9), voornaam:'',achternaam:'', honden:[]}){
  $('#modal').style.display='block';
  $('#modalTitle').textContent=c.id.startsWith('K')?'Klant bewerken':'Nieuwe klant';
  $('#voornaam').value=c.voornaam||''; $('#achternaam').value=c.achternaam||'';
  $('#btnSave').dataset.id=c.id;
  const tb=$('#hondTbl tbody'); tb.innerHTML='';
  (c.honden||[]).forEach(h=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><input value="${h.naam||''}"></td><td><input value="${h.ras||''}"></td>
    <td><input type="number" value="${h.credits||0}"></td><td><input type="number" value="${h.geldigheid||0}"></td>`;
    tb.appendChild(tr);
  });
}
function addHondRow(){
  const tr=document.createElement('tr');
  tr.innerHTML='<td><input></td><td><input></td><td><input type="number" value="0"></td><td><input type="number" value="0"></td>';
  $('#hondTbl tbody').appendChild(tr);
}
function saveModal(){
  const id=$('#btnSave').dataset.id;
  const c={id,voornaam:$('#voornaam').value,achternaam:$('#achternaam').value,honden:[]};
  $('#hondTbl tbody').querySelectorAll('tr').forEach(r=>{
    const i=r.querySelectorAll('input');
    c.honden.push({naam:i[0].value,ras:i[1].value,credits:parseInt(i[2].value||'0',10),geldigheid:parseInt(i[3].value||'0',10)});
  });
  const idx=all.findIndex(x=>x.id===id); if(idx>-1) all[idx]=c; else all.push(c);
  save(all); $('#modal').style.display='none'; render();
}
