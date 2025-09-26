
function renderCustomers(){
  const db=loadDB();
  const q=(document.getElementById('q')?.value||'').toLowerCase();
  const rows=(db.klanten||[]).filter(c=>!q || c.naam.toLowerCase().includes(q) || (c.email||'').toLowerCase().includes(q));
  const tb=document.getElementById('tbl-klanten');
  tb.innerHTML = rows.map(c=>`
    <tr data-id="${c.id}">
      <td>${c.naam}</td>
      <td>${c.email||''}</td>
      <td>${c.tel||''}</td>
      <td>
        <button class="btn muted act-edit">✏️</button>
        <button class="btn warn act-del">🗑️</button>
      </td>
    </tr>
  `).join('');
  document.getElementById('cnt-klanten').textContent = rows.length;
}

function attachCustomerHandlers(){
  // search
  const q=document.getElementById('q'); if(q){ q.addEventListener('input', renderCustomers); }
  // form add/edit
  const f=document.getElementById('form-klant');
  f.addEventListener('submit',(e)=>{
    e.preventDefault();
    const db=loadDB();
    const id=f.dataset.editing || uid('klnt');
    const payload={ id, naam:f.naam.value.trim(), email:f.email.value.trim(), tel:f.tel.value.trim() };
    if(f.dataset.editing){
      const i=db.klanten.findIndex(x=>x.id===id); if(i>=0) db.klanten[i]=payload;
    }else{
      db.klanten.push(payload);
    }
    saveDB(db); f.reset(); delete f.dataset.editing; renderCustomers();
  });
  // table actions
  document.getElementById('tbl-klanten').addEventListener('click',(e)=>{
    const tr=e.target.closest('tr'); if(!tr) return;
    const db=loadDB(); const id=tr.dataset.id; const c=db.klanten.find(x=>x.id===id);
    if(e.target.closest('.act-del')){
      if(confirm('Klant verwijderen?')){
        db.klanten = db.klanten.filter(x=>x.id!==id);
        // ook verwijderen uit deelnemerslijsten
        (db.lesdagen||[]).forEach(l=> l.participants = (l.participants||[]).filter(pid=>pid!==id));
        saveDB(db); renderCustomers();
      }
    }
    if(e.target.closest('.act-edit')){
      const f=document.getElementById('form-klant'); f.dataset.editing=id;
      f.naam.value=c.naam||''; f.email.value=c.email||''; f.tel.value=c.tel||'';
      f.naam.focus();
    }
  });
}

document.addEventListener('DOMContentLoaded', ()=>{ renderCustomers(); attachCustomerHandlers(); });
