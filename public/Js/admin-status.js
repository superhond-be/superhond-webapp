document.getElementById('checkStatus').addEventListener('click', async () => {
  const resultaat = document.getElementById('resultaat');
  resultaat.textContent = "⏳ Status wordt opgehaald...";

  try {
    const response = await fetch('/api/admin/users');
    const data = await response.json();

    if (response.ok) {
      resultaat.textContent = `✅ Aantal admins: ${data.count}`;
    } else {
      resultaat.textContent = `❌ Fout: ${data.error || "Onbekende fout"}`;
    }
  } catch (err) {
    resultaat.textContent = `⚠️ Fout bij ophalen: ${err.message}`;
  }
});
