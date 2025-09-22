async function fetchJSON(url){ const r = await fetch(url); return r.json(); }
document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('.version').forEach(el=>el.textContent='v0.18.6');
  const tableBody = document.querySelector('#klanten-body');
  const filterLand = document.getElementById('filter-land');
  const search = document.getElementById('search');

  let data = await fetchJSON('/api/klanten');

  function render(){
    const q = search.value.toLowerCase();
    const land = filterLand.value;
    const rows = data.filter(k => 
      (land === 'ALL' || k.land === land) &&
      (`${k.voornaam} ${k.achternaam}`.toLowerCase().includes(q) || (k.email||'').toLowerCase().includes(q))
    ).map(k => `<tr><td>${k.id}</td><td>${k.voornaam} ${k.achternaam}</td><td>${k.email||''}</td><td>${k.land}</td><td>${k.woonplaats||''}</td></tr>`).join('');
    tableBody.innerHTML = rows || '<tr><td colspan="5">Geen resultaten</td></tr>';
  }

  filterLand.addEventListener('change', render);
  search.addEventListener('input', render);
  render();
});
