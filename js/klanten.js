// /public/js/klanten.js
(function () {
  const TBL = document.querySelector('#klantenTable tbody');
  const zoekInput = document.getElementById('zoekInput');
  const minDogs   = document.getElementById('minDogs');
  const landFilter= document.getElementById('landFilter');
  const form      = document.getElementById('klantForm');
  const out       = document.getElementById('resultBox');
  const prefillBtn= document.getElementById('prefillBtn');
  const statusBox = document.getElementById('dataStatus');

  let KLANTEN = [];
  let HONDEN  = [];

  const setStatus = (txt, ok=true) => { if(statusBox){ statusBox.textContent=txt; statusBox.style.color=ok?'#1f2328':'#b42318'; } };
  const keyName = k => `${k.voornaam||''} ${k.achternaam||''}`.trim();
  const dogCount = id => HONDEN.filter(h => h.klantId === id).length;
  const show = j => { if(out) out.textContent = JSON.stringify(j, null, 2); };

  function filterData(){
    const zoek = (zoekInput?.value||'').toLowerCase();
    const min  = parseInt(minDogs?.value||'0',10);
    const land = landFilter?.value||'';
    return KLANTEN.filter(k=>{
      const dogs = dogCount(k.id);
      const m1 = keyName(k).toLowerCase().includes(zoek) || (k.email||'').toLowerCase().includes(zoek);
      const m2 = dogs >= min;
      const m3 = !land || k.land === land;
      return m1 && m2 && m3;
    });
  }

  function render(){
    if(!TBL) return;
    const data = filterData();
    TBL.innerHTML = data.map(k=>{
      const dogs = dogCount(k.id);
      const plaats = [k.postcode,k.plaats].filter(Boolean).join(' ');
      return `<tr>
        <td>${keyName(k)}<div class="sub">${k.land||''}</div></td>
        <td>${k.email||''}</td>
        <td>${plaats}</td>
        <td style="text-align:center">${dogs}</td>
        <td><button class="btn btn-small" data-edit="${k.id}">✏️ Bewerken</button>
            <button class="btn btn-small" data-del="${k.id}">🗑️ Verwijderen</button></td>
      </tr>`;
    }).join('') || `<tr><td colspan="5" style="text-align:center;color:#888">Geen resultaten…</td></tr>`;
  }

  [zoekInput,minDogs,landFilter].forEach(el=>el&&el.addEventListener('input',render));

  prefillBtn?.addEventListener('click', ()=>{
    const demo={voornaam:"An",achternaam:"Peeters",email:"an.peeters@example.com",telefoon:"+32 470 12 34 56",land:"België",straat:"Dorpsstraat",nr:"7",toevoeging:"bus 2",postcode:"2470",plaats:"Retie",opmerkingen:"Interesse puppy-lessen. Beschikbaar woe/za."};
    Object.entries(demo).forEach(([k,v])=>{ const el=form.querySelector(`[name="${k}"]`); if(el) el.value=v; });
    show({mode:"prefill",klant:demo});
  });

  form?.addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(form); const obj={}; fd.forEach((v,k)=>obj[k]=String(v||'').trim());
    if(!obj.voornaam||!obj.achternaam||!obj.email){ show({error:"Gelieve voornaam, achternaam en e-mail in te vullen."}); return; }
    show({mode:"demo-save",klant:obj,ts:new Date().toISOString()});
    // later: POST /api/klanten
  });

  async function loadJson(url){ const r=await fetch(url+'?b='+Date.now()); if(!r.ok) throw new Error(`${url} → HTTP ${r.status}`); return r.json(); }
  async function init(){
    setStatus('Data laden…');
    try{
      [KLANTEN,HONDEN] = await Promise.all([
        loadJson('/data/klanten.json'),
        loadJson('/data/honden.json')
      ]);
      setStatus(`Geladen: ${KLANTEN.length} klanten, ${HONDEN.length} honden ✔️`);
    }catch(e){
      setStatus(`Kon demo-data niet laden. ${e.message}`, false);
      KLANTEN=[]; HONDEN=[];
    }
    render();
  }
  init();
})();
