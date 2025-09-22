async function fetchJSON(url){ const r = await fetch(url); return r.json(); }

function setVersion(v){ document.querySelectorAll('.version').forEach(el=>el.textContent=v); }

document.addEventListener('DOMContentLoaded', async () => {
  setVersion('v0.18.6');
  // Quick counts
  try{
    const [klanten,honden,lessen] = await Promise.all([
      fetchJSON('/api/klanten'),
      fetchJSON('/api/honden'),
      fetchJSON('/api/lessen')
    ]);
    document.getElementById('count-klanten').textContent = klanten.length;
    document.getElementById('count-honden').textContent  = honden.length;
    document.getElementById('count-lessen').textContent  = lessen.length;
  }catch(e){ console.error(e); }
});
