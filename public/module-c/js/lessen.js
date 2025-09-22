
let lessen = [];
function render(l){
  const tbody = document.getElementById('lessen-body'); tbody.innerHTML='';
  l.forEach(x=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${x.naam}</td><td>${x.type}</td><td>${x.locatie}</td><td>${x.start}</td><td>${x.prijs}</td><td>${x.credits}</td><td>${x.max}</td>`;
    tbody.appendChild(tr);
  });
}
async function load(){
  const r = await fetch('../data/lessen.json'); lessen = await r.json();
  applyFilters();
}
function applyFilters(){
  const loc = document.getElementById('loc').value;
  const q = document.getElementById('zoek').value.trim().toLowerCase();
  let list = lessen.filter(x => (loc==='ALL' || x.locatie===loc) && x.naam.toLowerCase().includes(q));
  render(list);
}
document.addEventListener('DOMContentLoaded', load);
