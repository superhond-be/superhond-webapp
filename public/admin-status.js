// public/admin-status.js
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('#check-status');
  const output = document.querySelector('#status-output');

  btn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/admin/setup-status');
      const data = await res.json();
      output.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      output.textContent = JSON.stringify({ ok: false, error: err.message });
    }
  });
});
