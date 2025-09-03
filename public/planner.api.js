// Helper: fetch met korte timeout en retry
async function quickFetch(url, opts={}, {timeoutMs=8000, retries=1}={}) {
  for (let i = 0; i <= retries; i++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {...opts, signal: ctrl.signal, cache:'no-store'});
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      clearTimeout(t);
      if (i === retries) throw e;
    }
  }
}

// Gebruik quickFetch in API:
const API = {
  settings: async ()=> (await quickFetch('/api/settings')).json(),
  courses: {
    all: async ()=> (await quickFetch('/api/courses')).json(),
    add: async (x)=> (await quickFetch('/api/courses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(x)})).json(),
    update: async (id,x)=> (await quickFetch('/api/courses/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(x)})).json(),
    del: async (id)=> (await quickFetch('/api/courses/'+id,{method:'DELETE'})).json(),
  },
  sessions: {
    all: async ()=> (await quickFetch('/api/sessions')).json(),
    add: async (x)=> (await quickFetch('/api/sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(x)})).json(),
    update: async (id,x)=> (await quickFetch('/api/sessions/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(x)})).json(),
    del: async (id)=> (await quickFetch('/api/sessions/'+id,{method:'DELETE'})).json(),
  },
  enrollments: {
    all: async ()=> (await quickFetch('/api/enrollments')).json(),
    add: async (x)=> {
      const res = await quickFetch('/api/enrollments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(x)});
      if (res.status === 409) { const j = await res.json(); throw new Error(j.message||'Dubbele inschrijving'); }
      return res.json();
    },
    update: async (id,x)=> (await quickFetch('/api/enrollments/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(x)})).json(),
    del: async (id)=> (await quickFetch('/api/enrollments/'+id,{method:'DELETE'})).json(),
  }
};

(function keepAlive(){
  let timer;
  function start(){
    stop();
    timer = setInterval(()=> quickFetch('/api/ping').catch(()=>{}), 4*60*1000);
  }
  function stop(){ if (timer) clearInterval(timer); }
  document.addEventListener('visibilitychange', ()=> document.hidden ? stop() : start());
  start();
})();
