// public/js/lessen-v24.js
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('sh_token');
  if (!token) { location.href='/admin-login.html'; return; }

  const form=document.getElementById('formCreate');
  const tbody=document.querySelector('#tblLessons tbody');

  async function loadLookups(){
    const cats=['naam','lestype','locatie','lesgever'];
    for (let cat of cats){
      const sel=document.getElementById('sel-'+cat);
      const resp=await fetch('/api/lookup/'+cat,{headers:{Authorization:'Bearer '+token}});
      if(!resp.ok) continue;
      const data=await resp.json();
      sel.innerHTML='';
      data.items.forEach(it=>{
        const opt=document.createElement('option');
        opt.value=it.value; opt.textContent=it.value;
        sel.appendChild(opt);
      });
    }
  }

  async function fetchLessons(){
    const resp=await fetch('/api/lessen',{headers:{Authorization:'Bearer '+token}});
    if(!resp.ok){alert('Lessen laden mislukt');return;}
    const data=await resp.json();
    tbody.innerHTML='';
    data.lessons.forEach(l=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${l.id}</td><td>${l.naam||''}</td><td>${l.lestype||''}</td>
      <td>${l.locatie||''}</td><td>${l.lesgevers||''}</td><td>${l.strippen||1}</td>
      <td>${l.max_deelnemers||''}</td><td>${l.startdatum||''}</td>
      <td><button data-del="${l.id}">Verwijder</button></td>`;
      tbody.appendChild(tr);
    });
  }

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    const resp=await fetch('/api/lessen',{
      method:'POST',
      headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
      body:JSON.stringify(data)
    });
    const result=await resp.json();
    if(!resp.ok){alert(result.error||'Opslaan mislukt');return;}
    form.reset(); await loadLookups(); fetchLessons();
  });

  tbody.addEventListener('click',async e=>{
    if(e.target.dataset.del){
      if(!confirm('Verwijder deze les?')) return;
      const resp=await fetch('/api/lessen/'+e.target.dataset.del,{
        method:'DELETE',
        headers:{Authorization:'Bearer '+token}
      });
      if(!resp.ok){alert('Verwijderen mislukt');return;}
      fetchLessons();
    }
  });

  loadLookups(); fetchLessons();
});
