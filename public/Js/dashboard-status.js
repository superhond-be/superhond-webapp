// Leest /api/admin/setup-status en past UI aan
(async function initStatus(){
  const statusBox = document.getElementById('statusBox');
  const tileSetup  = document.getElementById('tile-setup');
  const countBadge = document.getElementById('countBadge');

  function setStatus(text, cls){
    statusBox.className = 'status ' + (cls || '');
    statusBox.textContent = text;
  }

  try {
    setStatus('Status laden…', 'muted');
    const res = await fetch('/api/admin/setup-status', { cache: 'no-store' });
    const j = await res.json();

    if (!res.ok || j.ok === false) {
      setStatus('❌ Status kon niet geladen worden.', 'err');
      return;
    }

    const count = Number(j.count || 0);
    const hasToken = !!j.hasSetupToken;

    countBadge.textContent = count;

    if (count === 0) {
      // geen admins → setup-tegel tonen
      tileSetup.classList.remove('hidden');
      setStatus(
        `⚠️ Er zijn nog geen admins. Setup token: ${hasToken ? 'actief' : 'niet ingesteld'}.`,
        'warn'
      );
    } else {
      // er zijn admins → setup verbergen
      tileSetup.classList.add('hidden');
      setStatus(
        `✅ ${count} admin(s) geregistreerd • Setup token: ${hasToken ? 'actief' : 'niet ingesteld'}.`,
        'ok'
      );
    }
  } catch (e) {
    console.warn(e);
    setStatus('❌ Server niet bereikbaar.', 'err');
  }
})();
