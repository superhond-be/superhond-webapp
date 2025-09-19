
const KEY_MAILLOG = 'SH_MAILLOG';
const $ = s => document.querySelector(s);
function load(){ try{return JSON.parse(localStorage.getItem(KEY_MAILLOG))||[]}catch(_){return []} }
function save(v){ localStorage.setItem(KEY_MAILLOG, JSON.stringify(v)); }

let data = load();
document.addEventListener('DOMContentLoaded', () => {
  render();
  $('#filterType').onchange = render;
  $('#filterText').oninput = render;
  $('#btnClear').onclick = () => { if(confirm('Mail-log leegmaken?')){ data=[]; save(data); render(); } };
});

function render(){
  const tb = document.querySelector('#tbl tbody'); tb.innerHTML='';
  const t = $('#filterType').value; const q = $('#filterText').value.toLowerCase();
  data.filter(x => (!t || x.type===t))
      .filter(x => `${x.hondNaam} ${x.klantNaam} ${x.classNaam} ${x.details||''}`.toLowerCase().includes(q))
      .sort((a,b)=>a.ts.localeCompare(b.ts))
      .forEach(x => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${x.ts}</td><td>${x.type}</td><td>${x.hondNaam||''}</td><td>${x.klantNaam||''}</td><td>${x.classNaam||''}</td><td>${x.details||''}</td>`;
        tb.appendChild(tr);
      });
}
