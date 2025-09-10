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
