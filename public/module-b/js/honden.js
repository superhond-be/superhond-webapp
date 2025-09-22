
let honden = [];
async function loadHonden(){
  const r = await fetch('../data/honden.json'); honden = await r.json();
  const tbody = document.getElementById('honden-body'); tbody.innerHTML='';
  honden.forEach(h=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${h.naam}</td><td>${h.ras}</td><td>${h.leeftijd}</td><td>${h.eigenaar}</td><td>${h.eigenaar_id}</td><td>✏️ 💾 🗑️</td>`;
    tbody.appendChild(tr);
  });
}
document.addEventListener('DOMContentLoaded', loadHonden);
