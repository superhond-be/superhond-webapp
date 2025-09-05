// public/js/admin-status.js
(async function () {
  const btn = document.getElementById('checkAdminStatus');
  const out = document.getElementById('adminStatusResult');

  if (!btn || !out) return;

  function show(msg, type = 'info') {
    out.innerHTML = msg;
    out.className = ''; // reset
    out.classList.add('admin-status', `admin-status--${type}`);
  }

  btn.addEventListener('click', async () => {
    show('Bezig met ophalen…');
    try {
      const res = await fetch('/api/admin/status', { cache: 'no-store' });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`API-fout (${res.status}): ${text || res.statusText}`);
      }
      const data = await res.json();

      // Toon netjes
      const tokenText = data.hasSetupToken ? 'gezet ✅' : 'niet gezet ❌';
      show(
        `
          <div><strong>Admins:</strong> ${data.count}</div>
          <div><strong>Setup-token:</strong> ${tokenText}</div>
        `,
        'ok'
      );
    } catch (err) {
      console.error(err);
      show(`Fout: ${err.message}`, 'error');
    }
  });
})();
