document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("#check-status-btn");
  const output = document.querySelector("#admin-status-output");

  button.addEventListener("click", async () => {
    output.textContent = "⏳ Status wordt opgehaald...";

    try {
      const res = await fetch("/api/admin/status");
      const data = await res.json();

      if (!data.ok) {
        output.textContent = `❌ Fout: ${data.error || "Onbekende fout"}`;
        output.style.color = "red";
        return;
      }

      if (data.count > 0) {
        output.textContent = `✅ Er zijn momenteel ${data.count} admin(s) geregistreerd.`;
        output.style.color = "green";
      } else {
        output.textContent = "⚠️ Er zijn nog geen admins geregistreerd.";
        output.style.color = "orange";
      }
    } catch (err) {
      console.error(err);
      output.textContent = "❌ Server niet bereikbaar.";
      output.style.color = "red";
    }
  });
});
