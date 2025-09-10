
// Minimal, dependency-free monthly calendar
(function(){
  const grid = document.getElementById('calGrid');
  const title = document.getElementById('calTitle');
  const prev = document.getElementById('prevMonth');
  const next = document.getElementById('nextMonth');

  const dow = ['M','D','W','D','V','Z','Z'];

  let view = new Date();
  view.setDate(1);

  function pad(n){ return n.toString().padStart(2,'0'); }

  function render(){
    grid.innerHTML = '';
    // DOW header
    dow.forEach(d => {
      const el = document.createElement('div');
      el.className = 'dow';
      el.textContent = d;
      grid.appendChild(el);
    });

    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = new Date(firstDay);
    // Monday-first calendar: shift start to Monday
    const weekday = (firstDay.getDay() + 6) % 7; // 0=Mon
    start.setDate(firstDay.getDate() - weekday);

    const today = new Date();
    const last = new Date(year, month + 1, 0); // last day of current month
    title.textContent = firstDay.toLocaleString('nl-NL', { month: 'long', year: 'numeric' });

    // 6 weeks * 7 days = 42
    for (let i=0;i<42;i++){
      const d = new Date(start);
      d.setDate(start.getDate()+i);
      const cell = document.createElement('div');
      cell.className = 'day';
      if (d.getMonth() !== month) cell.classList.add('is-other');
      if (d.toDateString() === today.toDateString()) cell.classList.add('is-today');
      cell.textContent = d.getDate();
      grid.appendChild(cell);
    }
  }

  prev.addEventListener('click', ()=>{ view.setMonth(view.getMonth()-1); render(); });
  next.addEventListener('click', ()=>{ view.setMonth(view.getMonth()+1); render(); });

  render();
})();
