document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard geladen (publiek blauw, admin rood)');
});
// Tabs logic for klantenportaal
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-tab');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const pane = document.getElementById(id);
    if (pane) pane.classList.add('active');
  });
});

(function(){
  const calEl = document.getElementById('calendar');
  const titleEl = document.getElementById('cal-title');
  if(!calEl || !titleEl) return;

  let view = new Date();
  view.setDate(1);

  function render(){
    const year = view.getFullYear();
    const month = view.getMonth(); // 0..11
    titleEl.textContent = new Date(year, month).toLocaleString('nl-BE', { month: 'long', year: 'numeric' });

    calEl.innerHTML = '';
    const dow = ['M','D','W','D','V','Z','Z'];
    dow.forEach(d => {
      const c = document.createElement('div');
      c.className = 'cal-cell cal-dow';
      c.textContent = d;
      calEl.appendChild(c);
    });

    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // maandag=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysPrev = new Date(year, month, 0).getDate();

    // leading cells
    for(let i=0;i<firstDow;i++){
      const d = daysPrev - firstDow + 1 + i;
      addCell(d, true);
    }
    // month days
    const today = new Date();
    for(let d=1; d<=daysInMonth; d++){
      const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      addCell(d, false, isToday);
    }
    // trailing cells to fill 6 rows (optional)
    const total = 7 + firstDow + daysInMonth; // header + days
    const need = Math.ceil(total/7)*7 - total;
    for(let d=1; d<=need; d++) addCell(d, true);
  }

  function addCell(n, muted=false, today=false){
    const c = document.createElement('div');
    c.className = 'cal-cell' + (muted ? ' cal-muted' : '') + (today ? ' cal-today' : '');
    c.textContent = n;
    calEl.appendChild(c);
  }

  document.getElementById('cal-prev')?.addEventListener('click', () => { view.setMonth(view.getMonth()-1); render(); });
  document.getElementById('cal-next')?.addEventListener('click', () => { view.setMonth(view.getMonth()+1); render(); });

  render();
})();
