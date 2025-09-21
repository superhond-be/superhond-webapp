
const SH = {
  version: '0.18.4',
  build: new Date().toISOString(),
  nav(to){ if(to) location.href = to; },
  ping(){
    fetch('/api/health').then(r=>r.json()).then(d=>{
      const el = document.querySelector('#health'); 
      if(el){ el.textContent = `API: ${d.status} • ${d.time}`; }
    }).catch(()=>{});
  }
};
window.addEventListener('DOMContentLoaded', ()=>{
  SH.ping();
});
