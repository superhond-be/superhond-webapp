// public/js/mijn-boekingen.js (v27)
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('sh_token');
  if(!token){ location.href='/admin-login.html'; return; }

  const tbody = document.querySelector('#tblBookings tbody');

  async function loadBookings(){
    const resp = await fetch('/api/bookings/mine',{headers:{Authorization:'Bearer '+token}});
    if(!resp.ok){ alert('Boekingen laden mislukt'); return; }
    const data = await resp.json();
    tbody.innerHTML='';
    data.bookings.forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${b.lesnaam||''}</td>
        <td>${b.lestype||''}</td>
        <td>${b.les_datum||''}</td>
        <td>${b.les_tijd||''}</td>
        <td>${b.locatie||''}</td>
        <td>${b.hond_naam||''}</td>
        <td>${b.status}</td>
        <td>${b.status==='active' ? '<button data-id="'+b.id+'">Annuleren</button>' : ''}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  tbody.addEventListener('click', async (e)=>{
    const id = e.target && e.target.dataset && e.target.dataset.id;
    if(!id) return;
    if(!confirm('Weet je zeker dat je deze boeking wilt annuleren?')) return;
    const resp = await fetch('/api/bookings/'+id,{method:'DELETE',headers:{Authorization:'Bearer '+token}});
    if(!resp.ok){ const d=await resp.json(); alert(d.error||'Annuleren mislukt'); return; }
    loadBookings();
  });

  loadBookings();
});
