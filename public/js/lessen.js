
const KEY='SH_CLASSES';
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(_){return []}}
function save(v){localStorage.setItem(KEY, JSON.stringify(v))}
let all=load();
const $=s=>document.querySelector(s);

document.addEventListener('DOMContentLoaded',()=>{
  render();
  $('#btnAddClass').onclick=addClass;
});

function render(){
  const tb=document.querySelector('#tbl tbody'); tb.innerHTML='';
  for(const c of all){
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${c.naam}</td><td>${c.type}</td><td>${c.cap}</td><td>${(c.lessen||[]).length}</td>`;
    tb.appendChild(tr);
  }
}
function addClass(){
  const c={id:'C'+Math.random().toString(36).slice(2,9),naam:'Nieuwe klas',type:'',cap:8,lessen:[]};
  all.push(c); save(all); render();
}
