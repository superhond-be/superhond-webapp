// public/js/dashboard-status.js
(function () {
  const btn   = document.querySelector('#btnCheckStatus');
  const preEl = document.querySelector('#statusOutput');

  function show(obj) {
    if (!preEl) return;
    preEl.textContent = JSON.stringify(obj, null, 2);
  }
  async function check() {
    try {
      const res = await fetch('/api/admin/status', { headers: { 'Accept': 'application/json' } });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const txt = await res.text();
        throw new Error('API endpoint niet gevonden of geen JSON ontvangen');
      }
      const data = await res.json();
      show(data);
    } catch (e) {
      show({ ok:false, error: String(e?.message || e) });
    }
  }

  if (btn) btn.addEventListener('click', check);
})();
