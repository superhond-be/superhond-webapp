document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard geladen (publiek blauw, admin rood)');
});
// Tabs logic for klantenportaal
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-tab');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const pane = document.getElementById(id);
    if (pane) pane.classList.add('active');
  });
});
