// Dynamische kalender (nl), start op huidige maand, maandag als eerste dag.
// Eenvoudige "events" demo die je later via API kan voeden.
(function(){
  const months = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
  const weekdaysMonFirst = ["Ma","Di","Wo","Do","Vr","Za","Zo"];

  // Demo events (kan vervangen worden door fetch('/api/lessen?...'))
  // Formaat: 'YYYY-MM-DD': { lesson: true, full: false }
  const demoEvents = {
    // Voorbeeld: lessen op enkele dagen
  };

  const grid = document.getElementById("cal-grid");
  const title = document.getElementById("cal-title");
  const btnPrev = document.querySelector('[data-cal="prev"]');
  const btnNext = document.querySelector('[data-cal="next"]');

  let view = (() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() }; // month: 0-11
  })();

  btnPrev.addEventListener("click", () => { shiftMonth(-1); });
  btnNext.addEventListener("click", () => { shiftMonth(1); });

  render();

  function shiftMonth(delta){
    let m = view.month + delta;
    let y = view.year;
    if(m < 0){ m = 11; y--; }
    if(m > 11){ m = 0; y++; }
    view = { year: y, month: m };
    render();
  }

  function render(){
    title.textContent = `${capitalize(months[view.month])} ${view.year}`;
    grid.innerHTML = "";

    const firstOfMonth = new Date(view.year, view.month, 1);
    const startDay = (firstOfMonth.getDay() + 6) % 7; // Ma=0 ... Zo=6
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

    const prevMonthDays = new Date(view.year, view.month, 0).getDate();

    // 6 rijen * 7 dagen = 42 cellen om layout stabiel te houden
    const totalCells = 42;
    let dayNum = 1;
    for(let i=0;i<totalCells;i++){
      const cell = document.createElement('div');
      cell.className = 'cal-cell';
      const dayWrap = document.createElement('div');
      dayWrap.className = 'day';

      let dateYear = view.year;
      let dateMonth = view.month;
      let dateDay;

      if(i < startDay){
        // trailing vorige maand
        dateMonth = (view.month - 1 + 12) % 12;
        dateYear = view.year + (view.month === 0 ? -1 : 0);
        dateDay = prevMonthDays - (startDay - 1 - i);
        cell.classList.add('muted');
      }else if(i >= startDay + daysInMonth){
        // leading volgende maand
        dateMonth = (view.month + 1) % 12;
        dateYear = view.year + (view.month === 11 ? 1 : 0);
        dateDay = i - (startDay + daysInMonth) + 1;
        cell.classList.add('muted');
      }else{
        dateDay = dayNum++;
      }

      dayWrap.textContent = dateDay;
      cell.appendChild(dayWrap);

      const iso = toISO(dateYear, dateMonth+1, dateDay);
      // badges
      const badges = document.createElement('div');
      badges.className = 'badges';

      const ev = demoEvents[iso];
      if(ev && ev.lesson){
        const b = document.createElement('span');
        b.className = 'badge lesson';
        b.textContent = 'Les';
        badges.appendChild(b);
      }
      if(ev && ev.full){
        const b = document.createElement('span');
        b.className = 'badge full';
        b.textContent = 'Vol';
        badges.appendChild(b);
      }
      cell.appendChild(badges);

      // vandaag markeren (alleen als de cel tot huidige maand behoort)
      const today = new Date();
      if(dateYear === today.getFullYear() && dateMonth === today.getMonth() && dateDay === today.getDate()){
        cell.classList.add('today');
      }

      // click handler (placeholder)
      cell.addEventListener('click', () => {
        const info = ev ? `Lesdag (${ev.full ? 'VOL' : 'plek vrij'})` : 'Geen lessen';
        alert(`${iso}: ${info}`);
      });

      grid.appendChild(cell);
    }
  }

  function toISO(y,m,d){
    const mm = String(m).padStart(2,'0');
    const dd = String(d).padStart(2,'0');
    return `${y}-${mm}-${dd}`;
  }

  function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

  // Expose simpele API om events in te schieten (optioneel)
  window.SuperhondCalendar = {
    setEvents(map){
      // verwacht object: { 'YYYY-MM-DD': {lesson:true, full:false}, ... }
      Object.keys(map||{}).forEach(k => demoEvents[k] = map[k]);
      render();
    },
    getView(){ return { ...view }; }
  };
})();
