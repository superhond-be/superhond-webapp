(async () => {
  const API = ''; // zelfde origin
  const $ = (sel, el=document) => el.querySelector(sel);
  const el = (tag, props={}, ...kids) => {
    const n = document.createElement(tag);
    Object.assign(n, props);
    for (const k of kids) n.append(k);
    return n;
  };
  const notice = msg => alert(msg);

  async function api(path, {method='GET', body}={}) {
    const res = await fetch(API+path, {
      method,
      headers: { 'Content-Type':'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // ------- Clients -------
  let clients = [];
  async function loadClients(){
    clients = await api('/api/clients');
    renderClients();
  }
  function renderClients(){
    const root = $('#clients');
    root.innerHTML = '<h2>Klanten</h2>';
    const t = el('table');
    t.append(el('thead',{}, el('tr',{},
      el('th',{textContent:'ID'}),
      el('th',{textContent:'Naam'}),
      el('th',{textContent:'E-mail'}),
      el('th',{textContent:'Telefoon'}),
      el('th',{textContent:'Acties'})
    )));
    const tb = el('tbody');
    for (const c of clients){
      const tr = el('tr',{},
        el('td',{textContent:c.id}),
        el('td',{textContent:c.naam}),
        el('td',{textContent:c.email}),
        el('td',{textContent:c.telefoon||''}),
        el('td',{}, (()=> {
          const b = el('button',{textContent:'Verwijder'});
          b.onclick = async () => { 
            if (!confirm('Verwijder klant?')) return;
            await api('/api/clients/'+c.id,{method:'DELETE'});
            await loadClients();
            await loadDogs(); 
          };
          return b;
        })())
      );
      tb.append(tr);
    }
    t.append(tb);
    root.append(t);

    // formulier
    const f = el('form');
    f.innerHTML = `
      <input name="naam" placeholder="Naam" required>
      <input name="email" placeholder="E-mail" required>
      <input name="telefoon" placeholder="Telefoon">
      <button type="submit">Toevoegen</button>`;
    f.onsubmit = async e=>{
      e.preventDefault();
      const body = Object.fromEntries(new FormData(f).entries());
      await api('/api/clients',{method:'POST', body});
      f.reset();
      await loadClients();
    };
    root.append(f);
  }

  // ------- Dogs -------
  let dogs = [];
  async function loadDogs(){
    dogs = await api('/api/dogs');
    renderDogs();
  }
  function renderDogs(){
    const root = $('#dogs');
    root.innerHTML = '<h2>Honden</h2>';
    const t = el('table');
    t.append(el('thead',{}, el('tr',{},
      el('th',{textContent:'ID'}),
      el('th',{textContent:'Naam'}),
      el('th',{textContent:'Ras'}),
      el('th',{textContent:'Geboortedatum'}),
      el('th',{textContent:'Klant'}),
      el('th',{textContent:'Acties'})
    )));
    const tb = el('tbody');
    for (const d of dogs){
      const klant = clients.find(c=>c.id===d.client_id);
      const tr = el('tr',{},
        el('td',{textContent:d.id}),
        el('td',{textContent:d.naam}),
        el('td',{textContent:d.ras||''}),
        el('td',{textContent:d.geboortedatum||''}),
        el('td',{textContent:klant?klant.naam+' ('+klant.email+')':d.client_id}),
        el('td',{}, (()=> {
          const b = el('button',{textContent:'Verwijder'});
          b.onclick = async () => { 
            if (!confirm('Verwijder hond?')) return;
            await api('/api/dogs/'+d.id,{method:'DELETE'});
            await loadDogs();
          };
          return b;
        })())
      );
      tb.append(tr);
    }
    t.append(tb);
    root.append(t);

    // formulier
    const f = el('form');
    const sel = el('select',{name:'client_id', required:true},
      ...clients.map(c=> el('option',{value:c.id, textContent:c.naam+' ('+c.email+')'}))
    );
    f.append(
      el('input',{name:'naam', placeholder:'Naam hond', required:true}),
      el('input',{name:'ras', placeholder:'Ras'}),
      el('input',{name:'geboortedatum', type:'date'}),
      sel,
      el('button',{type:'submit', textContent:'Toevoegen'})
    );
    f.onsubmit = async e=>{
      e.preventDefault();
      const body = Object.fromEntries(new FormData(f).entries());
      await api('/api/dogs',{method:'POST', body});
      f.reset();
      await loadDogs();
    };
    root.append(f);
  }

  // Init
  await loadClients();
  await loadDogs();
})();
