// public/js/hondenbeheer.js (v22)
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('sh_token');
  if (!token) { location.href = '/admin-login.html'; return; }

  const form = document.getElementById('formDog');
  const tbody = document.querySelector('#tblDogs tbody');

  async function fetchDogs() {
    const resp = await fetch('/api/dogs', { headers: { Authorization: 'Bearer ' + token } });
    if (!resp.ok) { alert('Honden laden mislukt'); return; }
    const data = await resp.json();
    tbody.innerHTML = '';
    data.dogs.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${d.id}</td><td>${d.naam}</td><td>${d.ras||''}</td><td>${d.geboortedatum||''}</td><td>${d.credits}</td>`;
      tbody.appendChild(tr);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.credits = parseInt(data.credits||'0',10);
    const resp = await fetch('/api/dogs', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(data)
    });
    const result = await resp.json();
    if (!resp.ok) { alert(result.error||'Opslaan mislukt'); return; }
    form.reset();
    fetchDogs();
  });

  fetchDogs();
});
