async function fetchJSON(url){ const r = await fetch(url); return r.json(); }
document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('.version').forEach(el=>el.textContent='v0.18.6');
  const tbody = document.getElementById('lessen-body');
  const data = await fetchJSON('/api/lessen');
  const rows = data.map(l => `<tr>
    <td>${l.id}</td>
    <td>${l.naam}</td>
    <td>${l.locatie}</td>
    <td>${new Date(l.start).toLocaleString()}</td>
    <td>${l.credits}</td>
    <td>${l.max}</td>
    <td>${l.trainer}</td>
  </tr>`).join('');
  tbody.innerHTML = rows;
});
