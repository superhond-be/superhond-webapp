document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('#beschikbaar .tiles');
  if(!container) return;
  try {
    const res = await fetch('/api/lessons');
    const lessons = await res.json();
    if(!Array.isArray(lessons) || lessons.length === 0){
      container.innerHTML = '<div class="muted">Nog geen lessen beschikbaar.</div>';
      return;
    }
    container.innerHTML = lessons.map(l => `
      <a class="tile tile--public" href="#">
        ${l.type} – ${l.thema}
        <small>${l.datum || ''} ${l.tijd || ''} • ${l.locatie} • ${l.credits || 1} credit</small>
      </a>
    `).join('');
  } catch (e) {
    container.innerHTML = '<div class="muted">Kan lessen niet laden. Staat de server aan?</div>';
  }
});

// --- Load My Lessons (bookings) ---
(async()=>{
  const table = document.querySelector('#mijn-lessen tbody');
  if(!table) return;
  try{
    const [lessonsRes, bookingsRes] = await Promise.all([
      fetch('/api/lessons'), fetch('/api/bookings')
    ]);
    const lessons = await lessonsRes.json();
    const bookings = await bookingsRes.json();
    const klantId = 1; // dummy current klant
    const myBookings = bookings.filter(b=>b.klantId===klantId);
    if(myBookings.length===0){
      table.innerHTML = '<tr><td colspan="6">Nog geen inschrijvingen.</td></tr>';
      return;
    }
    table.innerHTML = myBookings.map(b=>{
      const l = lessons.find(x=>x.id===b.lessonId) || {};
      return `<tr>
        <td>${l.datum||''}</td>
        <td>${l.tijd||''}</td>
        <td>${l.locatie||''}</td>
        <td>${l.type||''} – ${l.thema||''}</td>
        <td>${l.trainer||''}</td>
        <td>${b.status}</td>
      </tr>`;
    }).join('');
  }catch(e){
    table.innerHTML = '<tr><td colspan="6">Fout bij laden van inschrijvingen.</td></tr>';
  }
})();
