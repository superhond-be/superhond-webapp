// /public/js/honden.js — demo-lijst honden
document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.querySelector('#honden-tabel tbody');
  const status = document.getElementById('hondenStatus');

  const setStatus = (txt, ok=true) => { if(status){ status.textContent=txt; status.style.color=ok?'#1f2328':'#b42318'; } };

  try{
    setStatus('Honden laden…');
    const r = await fetch('/data/honden.json?b=' + Date.now());
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    const honden = await r.json();

    if(!tbody) return;
    tbody.innerHTML = honden.map(h=>`
      <tr>
        <td>${h.naam}</td>
        <td>${h.ras||''}</td>
        <td>${h.geboorte||h.geboortedatum||''}</td>
        <td>${h.opmerkingen||''}</td>
        <td>${h.klantId||h.eigenaarId||''}</td>
      </tr>
    `).join('') || `<tr><td colspan="5" style="text-align:center;color:#888">Geen honden…</td></tr>`;

    setStatus(`Geladen: ${honden.length} honden ✔️`);
  }catch(e){
    if(tbody) tbody.innerHTML = `<tr><td colspan="5">❌ Kon honden niet laden</td></tr>`;
    setStatus('Kon honden niet laden. ' + e.message, false);
  }
});
