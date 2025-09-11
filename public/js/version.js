// public/js/version.js
(async function () {
  const els = {
    tag: document.querySelector('[data-version-tag]'),
    footer: document.querySelector('[data-version-footer]'),
  };
  try {
    const resp = await fetch('/version.json', { cache: 'no-store' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    const v = data.version || 'v?';
    if (els.tag) els.tag.textContent = v;
    if (els.footer) els.footer.textContent = `Build: ${data.version || 'v?'} • ${data.build_date || ''}`;
  } catch (e) {
    // Fallback (no /version.json found)
    const fallback = 'v15';
    if (els.tag) els.tag.textContent = fallback;
    if (els.footer) els.footer.textContent = `Build: ${fallback}`;
  }
})();
