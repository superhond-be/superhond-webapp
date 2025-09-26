// Superhond - tabs + dummy "Toevoegen" zonder backend (in-memory)
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".tab-button");
  const panels = document.querySelectorAll(".tab-content");

  // Tab wissel
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected","false"); });
      panels.forEach(p => p.classList.remove("active"));

      button.classList.add("active");
      button.setAttribute("aria-selected","true");
      const tabId = button.dataset.tab;
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Eenvoudig toevoegen aan lijst (in-memory)
  document.querySelectorAll('button[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-add'); // lesnaam | lestype | locatie | trainers
      const input = document.getElementById(`input-${key}`);
      const list = document.getElementById(`list-${key}`);
      const value = (input.value || '').trim();
      if(!value) return;
      const li = document.createElement('li');
      li.textContent = value;
      list.appendChild(li);
      input.value = '';
      input.focus();
    });
  });
});
