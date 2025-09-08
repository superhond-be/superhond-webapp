
// Simple client-side filter for the demo table
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('userSearch');
  const rows = document.querySelectorAll('#usersTable tbody tr');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    rows.forEach(r => {
      const text = r.innerText.toLowerCase();
      r.style.display = text.includes(q) ? '' : 'none';
    });
  });
});
