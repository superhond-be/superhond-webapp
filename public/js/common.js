
// Common helpers for navigation, tabs, etc.
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.matches('.tab')) {
    const container = t.closest('main');
    container.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
    t.classList.add('active');
    const target = t.getAttribute('data-tab');
    container.querySelectorAll('.tabpanel').forEach(p => p.classList.remove('show'));
    const panel = container.querySelector('#tab-' + target);
    if (panel) panel.classList.add('show');
  }
});
