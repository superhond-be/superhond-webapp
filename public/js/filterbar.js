(function(){
  function h(tag, attrs={}, children=[]){
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if(k==='class') el.className = v;
      else if(k==='for') el.htmlFor = v;
      else el.setAttribute(k,v);
    });
    children.forEach(c => el.appendChild(typeof c==='string'? document.createTextNode(c) : c));
    return el;
  }

  function FilterBar({ mount, trainers=[], locaties=[] }){
    const host = (typeof mount === 'string')? document.querySelector(mount) : mount;
    if(!host) return;

    const wrap = h('div', { class: 'sh-filterbar' });
    const fZoek = h('div', { class:'sh-field' }, [ h('label', {}, ['Zoek (Naam/Thema)']), h('input', { type:'text', id:'sh-q', placeholder:'bv. Puppy, Agility...' }) ]);
    const fFrom = h('div', { class:'sh-field' }, [ h('label', {}, ['Datum van']), h('input', { type:'date', id:'sh-from' }) ]);
    const fTo   = h('div', { class:'sh-field' }, [ h('label', {}, ['Datum tot']), h('input', { type:'date', id:'sh-to' }) ]);
    const locSel= h('select', { id:'sh-loc' }, [h('option', { value:'' }, ['Alle locaties'])]);
    (locaties||[]).forEach(l=> locSel.appendChild(h('option', { value:l.id }, [l.naam])));
    const fLoc  = h('div', { class:'sh-field' }, [ h('label', {}, ['Locatie']), locSel ]);
    const trSel = h('select', { id:'sh-trainers', multiple:'multiple' }, []);
    (trainers||[]).forEach(t=> trSel.appendChild(h('option', { value:t.id }, [t.naam])));
    const fTr   = h('div', { class:'sh-field' }, [ h('label', {}, ['Trainer(s)']), trSel ]);
    const resetBtn = h('button', { class:'btn muted', id:'sh-reset', type:'button' }, ['Filters wissen']);

    [fZoek,fFrom,fTo,fLoc,fTr,resetBtn].forEach(c=> wrap.appendChild(c));
    host.innerHTML=''; host.appendChild(wrap);

    function emit(){
      const q = document.getElementById('sh-q').value.trim().toLowerCase();
      const dateFrom = document.getElementById('sh-from').value || null;
      const dateTo = document.getElementById('sh-to').value || null;
      const locatieId = document.getElementById('sh-loc').value || null;
      const trainerIds = Array.from(document.getElementById('sh-trainers').selectedOptions).map(o=>o.value);
      host.dispatchEvent(new CustomEvent('sh:filters:change', { detail:{ q, dateFrom, dateTo, locatieId, trainerIds } }));
    }

    wrap.addEventListener('input', emit);
    wrap.addEventListener('change', emit);
    resetBtn.addEventListener('click', ()=>{
      document.getElementById('sh-q').value='';
      document.getElementById('sh-from').value='';
      document.getElementById('sh-to').value='';
      document.getElementById('sh-loc').value='';
      Array.from(document.getElementById('sh-trainers').options).forEach(o=> o.selected=false);
      emit();
    });

    emit();
  }

  window.SHFilterBar = { mount: FilterBar };
})();