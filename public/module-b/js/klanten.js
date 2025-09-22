
let klanten = [];
function render(list){
  const tbody = document.getElementById('klanten-body');
  tbody.innerHTML = '';
  list.forEach(k=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${k.naam}</td><td>${k.email}</td><td>${k.telefoon}</td><td>${k.land}</td><td>${k.plaats}</td><td>${k.adres}</td><td>✏️ 💾 🗑️</td>`;
    tbody.appendChild(tr);
  });
}
async function load(){
  const r = await fetch('../data/klanten.json'); klanten = await r.json();
  applyFilters();
}
function applyFilters(){
  const q = document.getElementById('q').value.trim().toLowerCase();
  const land = document.querySelector('input[name=land]:checked')?.value || 'ALL';
  let list = klanten.filter(k => (land==='ALL' || k.land===land) && (k.naam.toLowerCase().includes(q) || k.email.toLowerCase().includes(q)));
  render(list);
}
document.addEventListener('DOMContentLoaded', load);
