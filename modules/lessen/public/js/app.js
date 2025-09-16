document.addEventListener('DOMContentLoaded', async ()=>{
  let settings = await fetch('/api/lessen/settings').then(r=>r.json());
  const tb = document.querySelector('#tbl-namen tbody');

  function render(){
    tb.innerHTML = settings.namen.map((n,i)=>`
      <tr>
        <td><input value="${n.naam||''}" data-i="${i}" data-k="naam"></td>
        <td><input value="${n.prijs||''}" data-i="${i}" data-k="prijs"></td>
        <td><input value="${n.strippen||''}" data-i="${i}" data-k="strippen"></td>
        <td><input value="${n.max||''}" data-i="${i}" data-k="max"></td>
        <td><input value="${n.lesduurMin||''}" data-i="${i}" data-k="lesduurMin"></td>
        <td><input value="${n.mailblue||''}" data-i="${i}" data-k="mailblue"></td>
        <td><input value="${n.geldigheid?.aantal||''}" data-i="${i}" data-k="geldigheid.aantal"> 
            <select data-i="${i}" data-k="geldigheid.eenheid">
              ${['dagen','weken','maanden'].map(u=>`<option ${n.geldigheid?.eenheid===u?'selected':''}>${u}</option>`).join('')}
            </select></td>
        <td><button class="btn-del" data-del="${i}">🗑️</button></td>
      </tr>`).join('');
  }
  render();

  tb.addEventListener('input',e=>{
    const i=e.target.dataset.i; const k=e.target.dataset.k;
    if(!k) return;
    if(k.startsWith('geldigheid.')){
      const sub=k.split('.')[1];
      settings.namen[i].geldigheid=settings.namen[i].geldigheid||{};
      settings.namen[i].geldigheid[sub]= e.target.value;
    } else {
      settings.namen[i][k]=e.target.value;
    }
  });

  tb.addEventListener('click',e=>{
    if(e.target.dataset.del){
      settings.namen.splice(e.target.dataset.del,1);
      render();
    }
  });

  document.querySelector('#btn-save-all').addEventListener('click',async()=>{
    await fetch('/api/lessen/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)});
    alert('Opgeslagen!');
  });
});
