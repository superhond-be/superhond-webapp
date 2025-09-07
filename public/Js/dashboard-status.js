// Zorgt ervoor dat de knop de backend status ophaalt en toont
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("checkStatus");
  const result = document.getElementById("statusResult");

  if (!btn || !result) return;

  btn.addEventListener("click", async () => {
    result.textContent = "Bezig met ophalen…";
    try {
      const res = await fetch("/api/admin/status", { headers: { "Accept": "application/json" } });
      // Als de server een HTML-foutpagina zou sturen, voorkom JSON parse error
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server gaf geen geldige JSON terug:\n" + text.slice(0, 300));
      }
      result.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      result.textContent = `Fout: ${err.message}`;
    }
  });
});
